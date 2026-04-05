import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Wallet, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface AccountBalanceProps {
  balance: number;
  loading?: boolean;
}

export function AccountBalance({ balance, loading = false }: AccountBalanceProps) {
  const { user } = useAuth();
  const [depositOpen, setDepositOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <section className="container pb-8">
        <div className="max-w-md mx-auto bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl tracking-wider flex items-center gap-2">
              <Wallet className="h-5 w-5 text-gold" />
              Account Balance
            </h3>
            <span className="font-display text-3xl text-gold">
              {loading ? 'Loading...' : `KSH ${balance.toFixed(2)}`}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Your balance is managed securely from the Supabase cloud dashboard by administrators.
          </p>

          <Button variant="gold" size="lg" className="w-full" onClick={() => setDepositOpen(true)}>
            Deposit Funds
          </Button>
        </div>
      </section>

      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl tracking-wider text-center">
              Deposit via M-Pesa
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground text-center">
              To deposit funds, please contact an administrator.
            </p>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">Betting can be addictive. Not for under 18.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
