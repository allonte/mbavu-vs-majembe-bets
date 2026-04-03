-- Hotfix: ensure place_bet_as_draft exists in both 3-arg and 4-arg forms,
-- and force PostgREST to refresh schema cache.

create or replace function public.place_bet_as_draft(
  p_fighter text,
  p_odds numeric,
  p_stake numeric,
  p_tax_rate numeric default 0.16
)
returns public.bet_slips
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_balance numeric(12, 2);
  v_tax_amount numeric(12, 2);
  v_stake_after_tax numeric(12, 2);
  v_gross_payout numeric(12, 2);
  v_bet public.bet_slips;
  v_new_balance numeric(12, 2);
begin
  if v_user_id is null then
    raise exception 'You must be signed in to place a bet';
  end if;

  if p_fighter is null or btrim(p_fighter) = '' then
    raise exception 'Select a valid fighter';
  end if;

  if p_stake is null or p_stake <= 0 then
    raise exception 'Stake must be greater than zero';
  end if;

  if p_odds is null or p_odds <= 0 then
    raise exception 'Odds must be greater than zero';
  end if;

  select balance into v_balance
  from public.account_balances
  where user_id = v_user_id
  for update;

  if v_balance is null then
    raise exception 'Account balance was not found for this user';
  end if;

  if v_balance <= 0 then
    raise exception 'Insufficient balance. Add funds before placing a bet';
  end if;

  if p_stake > v_balance then
    raise exception 'Stake exceeds available balance';
  end if;

  v_tax_amount := round((p_stake * p_tax_rate)::numeric, 2);
  v_stake_after_tax := round((p_stake - v_tax_amount)::numeric, 2);
  v_gross_payout := round((v_stake_after_tax * p_odds)::numeric, 2);

  insert into public.bet_slips (
    user_id,
    fighter,
    odds,
    stake,
    tax_amount,
    stake_after_tax,
    gross_payout,
    status
  )
  values (
    v_user_id,
    p_fighter,
    round(p_odds, 2),
    round(p_stake, 2),
    v_tax_amount,
    v_stake_after_tax,
    v_gross_payout,
    'placed'
  )
  returning * into v_bet;

  if v_bet.id is null then
    raise exception 'Failed to save bet slip';
  end if;

  update public.account_balances
  set balance = round((balance - p_stake)::numeric, 2)
  where user_id = v_user_id
  returning balance into v_new_balance;

  if v_new_balance is null then
    raise exception 'Failed to deduct stake from account balance';
  end if;

  return v_bet;
end;
$$;

create or replace function public.place_bet_as_draft(
  p_fighter text,
  p_odds numeric,
  p_stake numeric
)
returns public.bet_slips
language sql
security definer
set search_path = public
as $$
  select public.place_bet_as_draft(
    p_fighter => p_fighter,
    p_odds => p_odds,
    p_stake => p_stake,
    p_tax_rate => 0.16
  );
$$;

grant execute on function public.place_bet_as_draft(text, numeric, numeric, numeric) to authenticated;
grant execute on function public.place_bet_as_draft(text, numeric, numeric) to authenticated;

select pg_notify('pgrst', 'reload schema');
