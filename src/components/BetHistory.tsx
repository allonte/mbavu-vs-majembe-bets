import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Receipt, ChevronDown, ChevronUp } from 'lucide-react';

interface BetSlipRecord {
  id: string;
  fighter: string;
  odds: number;
  stake: number;
  tax_amount: number;
  stake_after_tax: number;
  gross_payout: number;
  status: string;
  created_at: string;
}

export function BetHistory({ refreshKey }: { refreshKey: number }) {
  const { user } = useAuth();
  const [bets, setBets] = useState<BetSlipRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('bet_slips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setBets((data as BetSlipRecord[]) ?? []);
        setLoading(false);
      });
  }, [user, refreshKey]);

  if (!user || bets.length === 0) return null;

  return (
    <section className="container pb-10">
      <div className="max-w-md mx-auto bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-secondary/50">
          <h3 className="font-display text-xl tracking-wider text-center flex items-center justify-center gap-2">
            <Receipt className="h-5 w-5 text-gold" />
            My Bet Slips ({bets.length})
          </h3>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground text-sm py-6">Loading…</p>
        ) : (
          <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
            {bets.map((bet) => {
              const expanded = expandedId === bet.id;
              return (
                <button
                  key={bet.id}
                  className="w-full text-left p-4 hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : bet.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display tracking-wider">{bet.fighter}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bet.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gold">
                          KSH {Number(bet.stake).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{bet.status}</p>
                      </div>
                      {expanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-3 space-y-1 rounded-lg bg-secondary/50 border border-border p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Odds</span>
                        <span className="text-gold">× {Number(bet.odds).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stake</span>
                        <span>KSH {Number(bet.stake).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tax (16%)</span>
                        <span className="text-destructive">- KSH {Number(bet.tax_amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stake After Tax</span>
                        <span>KSH {Number(bet.stake_after_tax).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <span className="font-semibold">Potential Payout</span>
                        <span className="font-display text-gold">KSH {Number(bet.gross_payout).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
