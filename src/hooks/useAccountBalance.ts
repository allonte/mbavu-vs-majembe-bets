import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useAccountBalance(userId?: string) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshBalance = useCallback(async () => {
    if (!userId) {
      setBalance(0);
      return;
    }

    setLoading(true);

    await (supabase.rpc as any)('ensure_my_account_balance');

    const { data, error } = await supabase
      .from('account_balances')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error) {
      setBalance(data?.balance ?? 0);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  return {
    balance,
    loading,
    refreshBalance,
  };
}
