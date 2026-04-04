
-- Create bet_slips table
CREATE TABLE public.bet_slips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fighter TEXT NOT NULL,
  odds NUMERIC(10,2) NOT NULL,
  stake NUMERIC(12,2) NOT NULL,
  tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  stake_after_tax NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_payout NUMERIC(12,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'placed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bet_slips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bet slips"
  ON public.bet_slips FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ensure_my_account_balance: creates a balance row if missing
CREATE OR REPLACE FUNCTION public.ensure_my_account_balance()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.account_balances (user_id, balance)
  VALUES (auth.uid(), 0)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_my_account_balance() TO authenticated;

-- place_bet_as_draft: validates, inserts bet, deducts balance
CREATE OR REPLACE FUNCTION public.place_bet_as_draft(
  p_fighter TEXT,
  p_odds NUMERIC,
  p_stake NUMERIC,
  p_tax_rate NUMERIC DEFAULT 0.16
)
RETURNS public.bet_slips
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_balance NUMERIC(12,2);
  v_tax_amount NUMERIC(12,2);
  v_stake_after_tax NUMERIC(12,2);
  v_gross_payout NUMERIC(12,2);
  v_bet public.bet_slips;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must be signed in to place a bet';
  END IF;

  IF p_fighter IS NULL OR btrim(p_fighter) = '' THEN
    RAISE EXCEPTION 'Select a valid fighter';
  END IF;

  IF p_stake IS NULL OR p_stake <= 0 THEN
    RAISE EXCEPTION 'Stake must be greater than zero';
  END IF;

  IF p_odds IS NULL OR p_odds <= 0 THEN
    RAISE EXCEPTION 'Odds must be greater than zero';
  END IF;

  SELECT balance INTO v_balance
  FROM public.account_balances
  WHERE user_id = v_user_id
  FOR UPDATE;

  IF v_balance IS NULL THEN
    RAISE EXCEPTION 'Account balance not found';
  END IF;

  IF p_stake > v_balance THEN
    RAISE EXCEPTION 'Stake exceeds available balance';
  END IF;

  v_tax_amount := round((p_stake * p_tax_rate)::numeric, 2);
  v_stake_after_tax := round((p_stake - v_tax_amount)::numeric, 2);
  v_gross_payout := round((v_stake_after_tax * p_odds)::numeric, 2);

  INSERT INTO public.bet_slips (
    user_id, fighter, odds, stake, tax_amount, stake_after_tax, gross_payout, status
  ) VALUES (
    v_user_id, p_fighter, round(p_odds, 2), round(p_stake, 2),
    v_tax_amount, v_stake_after_tax, v_gross_payout, 'placed'
  )
  RETURNING * INTO v_bet;

  UPDATE public.account_balances
  SET balance = round((balance - p_stake)::numeric, 2)
  WHERE user_id = v_user_id;

  RETURN v_bet;
END;
$$;

GRANT EXECUTE ON FUNCTION public.place_bet_as_draft(TEXT, NUMERIC, NUMERIC, NUMERIC) TO authenticated;

-- 3-arg overload for convenience
CREATE OR REPLACE FUNCTION public.place_bet_as_draft(
  p_fighter TEXT,
  p_odds NUMERIC,
  p_stake NUMERIC
)
RETURNS public.bet_slips
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.place_bet_as_draft(p_fighter, p_odds, p_stake, 0.16);
$$;

GRANT EXECUTE ON FUNCTION public.place_bet_as_draft(TEXT, NUMERIC, NUMERIC) TO authenticated;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
