import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { BetSlip } from '@/components/BetSlip';

const mockRpc = vi.fn();
const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: (...args: unknown[]) => mockRpc(...args),
  },
}));

const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...args: unknown[]) => mockToastSuccess(...args),
  },
}));

describe('BetSlip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens login when user is not authenticated', async () => {
    mockUseAuth.mockReturnValue({ user: null });
    const onLogin = vi.fn();

    render(
      <BetSlip
        selectedFighter="MBAVU"
        odds="4.20"
        onLogin={onLogin}
        accountBalance={1000}
        onBetPlaced={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: 'Sign In to Bet' }));

    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(mockRpc).not.toHaveBeenCalled();
  });

  it('blocks placement when stake is greater than available balance', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    render(
      <BetSlip
        selectedFighter="MBAVU"
        odds="4.20"
        onLogin={vi.fn()}
        accountBalance={50}
        onBetPlaced={vi.fn()}
      />
    );

    await userEvent.type(screen.getByPlaceholderText('Enter amount'), '100');
    await userEvent.click(screen.getByRole('button', { name: 'Place Bet' }));

    expect(mockRpc).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith(
      'Stake cannot be higher than your available account balance'
    );
  });

  it('places a bet successfully and triggers balance refresh', async () => {
    mockUseAuth.mockReturnValue({ user: { id: 'user-1' } });

    mockRpc.mockResolvedValue({
      data: {
        id: 'bet-1',
        fighter: 'MBAVU',
        odds: 4.2,
        stake: 100,
        gross_payout: 352.8,
        status: 'placed',
      },
      error: null,
    });

    const onBetPlaced = vi.fn().mockResolvedValue(undefined);

    render(
      <BetSlip
        selectedFighter="MBAVU"
        odds="4.20"
        onLogin={vi.fn()}
        accountBalance={1000}
        onBetPlaced={onBetPlaced}
      />
    );

    const input = screen.getByPlaceholderText('Enter amount');
    await userEvent.type(input, '100');
    await userEvent.click(screen.getByRole('button', { name: 'Place Bet' }));

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('place_bet_as_draft', {
        p_fighter: 'MBAVU',
        p_odds: 4.2,
        p_stake: 100,
        p_tax_rate: 0.16,
      });
    });

    expect(onBetPlaced).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(input).toHaveValue(null);
    expect(await screen.findByText('Latest Bet Slip')).toBeInTheDocument();
  });
});
