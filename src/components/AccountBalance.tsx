import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Wallet, Phone, Clock, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function AccountBalance() {
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
            <span className="font-display text-3xl text-gold">KSH 0.00</span>
          </div>

          <Button
            variant="gold"
            size="lg"
            className="w-full"
            onClick={() => setDepositOpen(true)}
          >
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
            <div className="p-4 rounded-lg bg-secondary border border-border space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Payment Instructions
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">1</div>
                  <p className="text-sm">Go to M-Pesa on your phone</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">2</div>
                  <p className="text-sm">Select <strong>Lipa na M-Pesa</strong> → <strong>Pochi la Biashara</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">3</div>
                  <p className="text-sm">Enter the number below:</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                <Phone className="h-5 w-5 text-gold" />
                <span className="font-display text-2xl text-gold tracking-wider">0742145267</span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">4</div>
                <p className="text-sm">Enter the amount you wish to deposit and confirm</p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-gold">Payment reflects after 5 minutes.</strong> Your balance will be updated automatically once the payment is confirmed.
              </p>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Betting can be addictive. Not for under 18.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
