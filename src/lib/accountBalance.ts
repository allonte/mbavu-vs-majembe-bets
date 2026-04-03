import { supabase } from '@/lib/supabase';

export async function ensureAccountBalance(userId: string) {
  const { error } = await supabase
    .from('account_balances')
    .upsert({ user_id: userId, balance: 0 }, { onConflict: 'user_id' });

  return { error };
}

export async function getAccountBalance(userId: string) {
  const { data, error } = await supabase
    .from('account_balances')
    .select('balance')
    .eq('user_id', userId)
    .single();

  return { balance: data ? Number(data.balance) : 0, error };
}
