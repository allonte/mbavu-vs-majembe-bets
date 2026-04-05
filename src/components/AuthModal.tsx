import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import vuruguPoster from '@/assets/vurugu-poster.jpg';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    const { error } = result;

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(isLogin ? 'Welcome back!' : 'Account created! You are now signed in.');
      onOpenChange(false);
      setEmail('');
      setPassword('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md p-0 overflow-hidden">
        <div className="w-full h-40 overflow-hidden">
          <img src={vuruguPoster} alt="VURUGU Fight Night" className="w-full h-full object-cover object-top" />
        </div>
        <div className="px-6 pb-6">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl tracking-wider text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="fighter@ring.com"
              required
              className="bg-secondary border-border"
            />
            {isLogin && (
              <p className="text-xs text-muted-foreground">
                Use an email that has at least one name matching your M-Pesa name for account balance updates.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="bg-secondary border-border"
            />
          </div>
          <Button type="submit" className="w-full" variant="fight" size="lg" disabled={loading}>
            {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-gold underline hover:no-underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
            <p className="text-xs font-semibold text-destructive">⚠️ Gambling can be addictive. Not for under 18.</p>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
