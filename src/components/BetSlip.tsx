import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BetSlipProps {
  selectedFighter: string | null;
  odds: string;
  onLogin: () => void;
}

export function BetSlip({ selectedFighter, odds, onLogin }: BetSlipProps) {
  const [stake, setStake] = useState('');
  const { user } = useAuth();

  const numericOdds = parseFloat(odds);
  const stakeNum = parseFloat(stake) || 0;
  const payout = (stakeNum * numericOdds).toFixed(2);

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
    toast.success(`Bet placed! $${stake} on ${selectedFighter} at ${odds} odds. Potential payout: $${payout}`);
    setStake('');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-xl p-6">
      <h3 className="font-display text-xl tracking-wider text-center mb-4">Bet Slip</h3>
      {selectedFighter ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fighter</span>
            <span className="font-semibold">{selectedFighter}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Odds</span>
            <span className="text-gold font-display text-lg">{odds}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Stake ($)</label>
            <Input
              type="number"
              min="1"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              placeholder="Enter amount"
              className="bg-secondary border-border"
            />
          </div>
          {stakeNum > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20">
              <span className="text-sm text-muted-foreground">Potential Payout</span>
              <span className="font-display text-2xl text-gold">${payout}</span>
            </div>
          )}
          <Button variant="gold" size="lg" className="w-full" onClick={handlePlaceBet}>
            {user ? 'Place Bet' : 'Sign In to Bet'}
          </Button>
        </div>
      ) : (
        <p className="text-center text-muted-foreground text-sm py-8">
          Select a fighter to place your bet
        </p>
      )}
    </div>
  );
}
