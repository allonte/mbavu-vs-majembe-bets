
-- Add email column
ALTER TABLE public.account_balances ADD COLUMN email text;

-- Backfill existing rows with emails from auth.users
UPDATE public.account_balances ab
SET email = u.email
FROM auth.users u
WHERE u.id = ab.user_id;

-- Update the auto-create function to also store email
CREATE OR REPLACE FUNCTION public.create_account_balance_for_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.account_balances (user_id, balance, email)
  VALUES (new.id, 0, new.email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
  RETURN new;
END;
$$;

-- Update ensure function to also store email
CREATE OR REPLACE FUNCTION public.ensure_my_account_balance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.account_balances (user_id, balance, email)
  VALUES (auth.uid(), 0, v_email)
  ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
END;
$$;
