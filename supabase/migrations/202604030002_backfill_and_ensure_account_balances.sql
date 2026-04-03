-- Backfill balances for users who signed up before the trigger existed.
insert into public.account_balances (user_id, balance)
select id, 0
from auth.users
on conflict (user_id) do nothing;

-- Ensure each authenticated user can lazily create their own balance row.
create or replace function public.ensure_my_account_balance()
returns public.account_balances
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.account_balances;
begin
  if v_user_id is null then
    raise exception 'You must be signed in';
  end if;

  insert into public.account_balances (user_id, balance)
  values (v_user_id, 0)
  on conflict (user_id) do nothing;

  select *
  into v_row
  from public.account_balances
  where user_id = v_user_id;

  return v_row;
end;
$$;

grant execute on function public.ensure_my_account_balance() to authenticated;
