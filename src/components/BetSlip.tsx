import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Calculator, TrendingUp, Receipt, AlertTriangle } from 'lucide-react';

interface BetSlipProps {
  selectedFighter: string | null;
  odds: string;
  onLogin: () => void;
}

const TAX_RATE = 0.16;

export function BetSlip({ selectedFighter, odds, onLogin }: BetSlipProps) {
  const [stake, setStake] = useState('');
  const { user } = useAuth();

  const numericOdds = parseFloat(odds);
  const stakeNum = parseFloat(stake) || 0;
  const taxAmount = stakeNum * TAX_RATE;
  const stakeAfterTax = stakeNum - taxAmount;
  const grossPayout = stakeAfterTax * numericOdds;
  const netProfit = grossPayout - stakeNum;

  const handlePlaceBet = () => {
    if (!user) {
      onLogin();
      return;
    }
    if (!selectedFighter) {
      toast.error('Select a fighter first');
      return;
    }
    if (stakeNum <= 0) {
      toast.error('Enter a valid stake');
      return;
    }
    toast.success(
      `Bet placed! KSH ${stakeNum.toFixed(2)} on ${selectedFighter} at ${odds} odds. Potential payout: KSH ${grossPayout.toFixed(2)}`
    );
    setStake('');
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border bg-secondary/50">
        <h3 className="font-display text-xl tracking-wider text-center flex items-center justify-center gap-2">
          <Receipt className="h-5 w-5 text-gold" />
          Bet Slip
        </h3>
      </div>

      <div className="p-6">
        {selectedFighter ? (
          <div className="space-y-5">
            {/* Fighter & Odds */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Pick</p>
                <p className="font-display text-lg tracking-wider">{selectedFighter}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Odds</p>
                <p className="font-display text-2xl text-gold">{odds}</p>
              </div>
            </div>

            {/* Stake Input */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calculator className="h-3.5 w-3.5" />
                Stake (KSH)
              </label>
              <Input
                type="number"
                min="1"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                placeholder="Enter amount"
                className="bg-secondary border-border text-lg font-display h-12"
              />
              {/* Quick amounts */}
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setStake(String(amt))}
                    className="px-3 py-1.5 text-xs font-semibold rounded-md bg-secondary border border-border hover:border-accent hover:text-gold transition-colors"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Payout Breakdown */}
            {stakeNum > 0 && (
              <div className="space-y-1 rounded-lg border border-border overflow-hidden">
                {/* Breakdown rows */}
                <div className="bg-secondary/30 p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Stake</span>
                    <span>KSH {stakeNum.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Excise Tax (16%)</span>
                    <span className="text-destructive">- KSH {taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-t border-border pt-2">
                    <span className="text-muted-foreground">Stake After Tax</span>
                    <span>KSH {stakeAfterTax.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Odds</span>
                    <span className="text-gold">× {numericOdds.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payout highlight */}
                <div className="bg-accent/10 border-t border-accent/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-gold" />
                      Potential Payout
                    </span>
                    <span className="font-display text-3xl text-gold">
                      KSH {grossPayout.toFixed(2)}
                    </span>
                  </div>
                  {netProfit > 0 && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">Net Profit</span>
                      <span className="text-sm text-gold font-semibold">
                        + KSH {netProfit.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button variant="gold" size="lg" className="w-full" onClick={handlePlaceBet}>
              {user ? 'Place Bet' : 'Sign In to Bet'}
            </Button>

            <div className="flex items-start gap-2 p-2 rounded-md bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
              <p className="text-[10px] text-destructive">
                Betting can be addictive. Not for under 18. 16% excise tax applies on all stakes.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground text-sm py-8">
            Select a fighter to place your bet
          </p>
        )}
      </div>
    </div>
  );
}
