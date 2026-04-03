create table if not exists public.account_balances (
  user_id uuid primary key references auth.users (id) on delete cascade,
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.account_balances enable row level security;

drop policy if exists "Users can view their own balance" on public.account_balances;
create policy "Users can view their own balance"
  on public.account_balances
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own balance row" on public.account_balances;
create policy "Users can create their own balance row"
  on public.account_balances
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own balance" on public.account_balances;
create policy "Users can update their own balance"
  on public.account_balances
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_account_balances_updated_at on public.account_balances;
create trigger set_account_balances_updated_at
before update on public.account_balances
for each row
execute function public.set_updated_at();

create or replace function public.place_bet(stake_amount numeric)
returns numeric
language plpgsql
security invoker
set search_path = public
as $$
declare
  remaining_balance numeric;
begin
  if stake_amount is null or stake_amount <= 0 then
    raise exception 'Stake amount must be greater than zero';
  end if;

  update public.account_balances
  set balance = balance - stake_amount
  where user_id = auth.uid()
    and balance >= stake_amount
  returning balance into remaining_balance;

  if remaining_balance is null then
    raise exception 'Insufficient balance';
  end if;

  return remaining_balance;
end;
$$;
