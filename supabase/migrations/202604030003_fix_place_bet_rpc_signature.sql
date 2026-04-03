-- Compatibility fix for clients calling place_bet_as_draft without p_tax_rate.
-- Some PostgREST schema cache states fail to match defaulted args, so provide
-- an explicit 3-argument overload and reload schema cache.

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

grant execute on function public.place_bet_as_draft(text, numeric, numeric) to authenticated;

-- Ask PostgREST to refresh RPC metadata immediately.
select pg_notify('pgrst', 'reload schema');
