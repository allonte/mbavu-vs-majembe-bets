import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { FighterCard } from '@/components/FighterCard';
import { BetSlip } from '@/components/BetSlip';
import { AuthModal } from '@/components/AuthModal';
import { AccountBalance } from '@/components/AccountBalance';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAccountBalance } from '@/hooks/useAccountBalance';

const fighters = [
  {
    id: 'mbavu',
    name: 'MBAVU',
    nickname: 'The Destroyer',
    image: '/mbavu.jpeg',
    record: '28-2-0 (24 KOs)',
    odds: '4.20',
    corner: 'red' as const,
  },
  {
    id: 'majembe',
    name: 'MAJEMBE',
    nickname: 'The Iron Fist',
    image: '/majembe.jpeg',
    record: '25-4-1 (19 KOs)',
    odds: '1.80',
    corner: 'blue' as const,
  },
];

export default function Index() {
  const [selected, setSelected] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [withdrawRequested, setWithdrawRequested] = useState(false);
  const { user } = useAuth();
  const { balance, loading, refreshBalance } = useAccountBalance(user?.id);

  const selectedFighter = fighters.find((f) => f.id === selected);

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative pt-24 pb-12 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 gradient-fight opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />

        <div className="container relative z-10 text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Championship Fight • Saturday, April 4, 2026
          </p>
          <h1 className="font-display text-5xl md:text-8xl lg:text-9xl tracking-wider leading-none">
            <span className="text-primary">MBAVU</span>
            <span className="text-muted-foreground mx-3 md:mx-6 text-3xl md:text-5xl align-middle">VS</span>
            <span className="text-gold">MAJEMBE</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            The Destroyer meets The Iron Fist in the fight of the century. Place your bets now.
          </p>
        </div>
      </section>

      <section className="container pb-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {fighters.map((fighter) => (
            <FighterCard
              key={fighter.id}
              {...fighter}
              selected={selected === fighter.id}
              onSelect={() => setSelected(fighter.id)}
            />
          ))}
        </div>
      </section>

      {user && <AccountBalance balance={balance} loading={loading} />}

      <section className="container pb-10">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6">
          <h2 className="font-display text-xl tracking-wider text-center mb-2">Withdraw</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Enter your M-Pesa number to request a withdrawal.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!mpesaNumber.trim()) return;
              setWithdrawRequested(true);
            }}
          >
            <Input
              type="tel"
              placeholder="e.g. 07XXXXXXXX"
              value={mpesaNumber}
              onChange={(e) => setMpesaNumber(e.target.value)}
            />
            <Button type="submit">Request Withdrawal</Button>
          </form>
          {withdrawRequested && (
            <p className="text-sm text-center text-muted-foreground mt-4">
              Withdrawal request received. The system will update after 30 mins.
            </p>
          )}
        </div>
      </section>

      <section className="container pb-20">
        <BetSlip
          selectedFighter={selectedFighter?.name ?? null}
          odds={selectedFighter?.odds ?? '0'}
          onLogin={() => setAuthOpen(true)}
          accountBalance={balance}
          onBetPlaced={refreshBalance}
        />
      </section>

      <section className="container pb-20">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-display text-xl tracking-wider text-center">Fight Odds</h2>
          </div>
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="font-semibold">Mbavu "The Destroyer"</span>
              </div>
              <div className="flex gap-4">
                <span className="text-sm text-muted-foreground">Win</span>
                <span className="font-display text-lg text-primary">4.20</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-semibold">Majembe "The Iron Fist"</span>
              </div>
              <div className="flex gap-4">
                <span className="text-sm text-muted-foreground">Win</span>
                <span className="font-display text-lg text-gold">1.80</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                <span className="font-semibold">Draw</span>
              </div>
              <div className="flex gap-4">
                <span className="text-sm text-muted-foreground">Draw</span>
                <span className="font-display text-lg">15.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
}
