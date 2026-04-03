-- Balance table managed by administrators from Supabase cloud dashboard.
create table if not exists public.account_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_account_balances_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists account_balances_set_updated_at on public.account_balances;
create trigger account_balances_set_updated_at
before update on public.account_balances
for each row execute procedure public.set_account_balances_updated_at();

create or replace function public.create_account_balance_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.account_balances (user_id, balance)
  values (new.id, 0)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_account_balance on auth.users;
create trigger on_auth_user_created_account_balance
after insert on auth.users
for each row execute procedure public.create_account_balance_for_new_user();

alter table public.account_balances enable row level security;

drop policy if exists "Users can read own balance" on public.account_balances;
create policy "Users can read own balance"
on public.account_balances
for select
to authenticated
using (auth.uid() = user_id);

-- Bet slips are always created as draft entries and saved in database.
create table if not exists public.bet_slips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fighter text not null,
  odds numeric(8, 2) not null check (odds > 0),
  stake numeric(12, 2) not null check (stake > 0),
  tax_amount numeric(12, 2) not null,
  stake_after_tax numeric(12, 2) not null,
  gross_payout numeric(12, 2) not null,
  status text not null default 'draft' check (status in ('draft', 'placed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.bet_slips enable row level security;

drop policy if exists "Users can read own bet slips" on public.bet_slips;
create policy "Users can read own bet slips"
on public.bet_slips
for select
to authenticated
using (auth.uid() = user_id);

-- Restrict inserts to RPC below so all validations and deductions happen atomically.
drop policy if exists "No direct insert into bet slips" on public.bet_slips;
create policy "No direct insert into bet slips"
on public.bet_slips
for insert
to authenticated
with check (false);

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
    'draft'
  )
  returning * into v_bet;

  update public.account_balances
  set balance = round((balance - p_stake)::numeric, 2)
  where user_id = v_user_id;

  return v_bet;
end;
$$;

grant execute on function public.place_bet_as_draft(text, numeric, numeric, numeric) to authenticated;
