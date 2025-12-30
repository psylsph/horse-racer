import { useState } from 'react';
import { useBettingStore } from '@/stores/bettingStore';
import { useWalletStore } from '@/stores/walletStore';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { calculateOdds, formatOdds, calculatePayout } from '@/utils/oddsCalculator';
import { BetType, ECONOMY_CONFIG, Horse, Race } from '@/types';

interface BettingSlipProps {
  raceId: string;
  horses: Horse[];
}

export function BettingSlip({ raceId, horses }: BettingSlipProps) {
  const { addBet, removeBet, validateBet, getTotalStake, getTotalPotentialPayout, currentBets } = useBettingStore();
  const { balance, updateBalance } = useWalletStore();
  const { selectedHorse } = useGameStore();
  const [betType, setBetType] = useState<BetType>('win');
  const [betAmount, setBetAmount] = useState<number>(ECONOMY_CONFIG.MIN_BET);
  const [error, setError] = useState<string>('');
  const [exactaHorse2, setExactaHorse2] = useState<string | null>(null);

  const mockRace: Race = {
    id: raceId,
    horses,
    trackSurface: 'firm',
    weather: 'clear',
    distance: 1200,
    status: 'scheduled',
    startTime: Date.now(),
  };

  const selectedHorseOdds = selectedHorse ? calculateOdds(selectedHorse, mockRace) : 0;

  const handleAddBet = () => {
    if (!selectedHorse) {
      setError('Please select a horse first');
      return;
    }

    const validation = validateBet(
      {
        raceId,
        type: betType,
        horseIds: betType === 'exacta' ? [selectedHorse.id, exactaHorse2!] : [selectedHorse.id],
        amount: betAmount,
        potentialPayout: calculatePayout(betType, selectedHorseOdds, betAmount),
        status: 'pending',
      },
      balance
    );

    if (!validation.valid) {
      setError(validation.error || 'Invalid bet');
      return;
    }

    addBet({
      raceId,
      type: betType,
      horseIds: betType === 'exacta' ? [selectedHorse.id, exactaHorse2!] : [selectedHorse.id],
      amount: betAmount,
      potentialPayout: calculatePayout(betType, selectedHorseOdds, betAmount),
      status: 'pending',
    });

    // Deduct bet amount from wallet
    updateBalance(-betAmount);

    setError('');
    setBetAmount(ECONOMY_CONFIG.MIN_BET);
  };

  const handleRemoveBet = (betId: string) => {
    removeBet(betId);
  };

  const totalStake = getTotalStake();
  const totalPotentialPayout = getTotalPotentialPayout();
  const potentialProfit = totalPotentialPayout - totalStake;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 p-4 max-h-[35vh] overflow-y-auto">
      <div className="container mx-auto max-w-2xl">
        <h3 className="text-lg font-bold text-white mb-4" data-testid="betting-slip-title">
          Betting Slip
        </h3>

        {selectedHorse && (
          <div className="bg-slate-800 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                  style={{ backgroundColor: selectedHorse.color }}
                />
                <div>
                  <p className="text-white font-semibold" data-testid="selected-horse-name">
                    {selectedHorse.name}
                  </p>
                  <Badge variant="gold" data-testid="selected-horse-odds">
                    {formatOdds(selectedHorseOdds)}x
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bet Type
            </label>
            <select
              value={betType}
              onChange={(e) => {
                setBetType(e.target.value as BetType);
                setExactaHorse2(null);
              }}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
              data-testid="bet-type-selector"
            >
              <option value="win">Win (1st)</option>
              <option value="place">Place (1st or 2nd)</option>
              <option value="show">Show (1st, 2nd or 3rd)</option>
              <option value="exacta">Exacta (1st + 2nd)</option>
            </select>
          </div>

          {betType === 'exacta' && selectedHorse && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Second Horse (for Exacta)
              </label>
              <select
                value={exactaHorse2 || ''}
                onChange={(e) => setExactaHorse2(e.target.value || null)}
                className="w-full bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
                data-testid="exacta-horse-selector"
              >
                <option value="">Select horse...</option>
                {horses
                  .filter((h) => h.id !== selectedHorse.id)
                  .map((horse) => (
                    <option key={horse.id} value={horse.id}>
                      {horse.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Bet Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(ECONOMY_CONFIG.MIN_BET, Number(e.target.value) || ECONOMY_CONFIG.MIN_BET))}
                min={ECONOMY_CONFIG.MIN_BET}
                max={ECONOMY_CONFIG.MAX_BET}
                step={10}
                className="flex-1 bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2"
                data-testid="bet-amount-input"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBetAmount(ECONOMY_CONFIG.MIN_BET)}
              >
                Min
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setBetAmount(ECONOMY_CONFIG.MAX_BET)}
              >
                Max
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-crimson-900/50 border border-crimson-700 text-crimson-300 rounded-lg px-4 py-2 text-sm" data-testid="bet-error">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={handleAddBet}
              disabled={!selectedHorse || (betType === 'exacta' && !exactaHorse2)}
              className="flex-1"
              data-testid="add-bet-button"
            >
              Add Bet
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setBetAmount(ECONOMY_CONFIG.MIN_BET);
                setExactaHorse2(null);
                setError('');
              }}
              data-testid="clear-bet-button"
            >
              Clear
            </Button>
          </div>
        </div>

        {currentBets.length > 0 && (
          <div className="mt-6 border-t border-slate-700 pt-4">
            <h4 className="text-sm font-semibold text-slate-400 mb-3">Current Bets</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {currentBets.map((bet) => (
                <div
                  key={bet.id}
                  className="bg-slate-800 rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {bet.type.toUpperCase()} - {formatOdds(bet.potentialPayout / bet.amount)}x
                    </p>
                    <p className="text-xs text-slate-400">
                      {bet.horseIds.length === 2
                        ? 'Horses: ' + bet.horseIds.join(', ')
                        : 'Horse: ' + bet.horseIds[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={bet.status === 'won' ? 'success' : bet.status === 'lost' ? 'danger' : 'default'}>
                      {bet.status}
                    </Badge>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRemoveBet(bet.id)}
                      data-testid={`remove-bet-${bet.id}`}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentBets.length > 0 && (
          <div className="mt-4 bg-slate-800 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-400">Total Stake</p>
                <p className="text-2xl font-bold text-white" data-testid="total-stake">
                  {totalStake.toFixed(2)} credits
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Potential Return</p>
                <p
                  className={`text-2xl font-bold ${potentialProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  data-testid="potential-return"
                >
                  {totalPotentialPayout.toFixed(2)} credits
                </p>
              </div>
            </div>
            {potentialProfit > 0 && (
              <p className="text-center text-sm text-green-400 mt-2" data-testid="potential-profit">
                Potential Profit: +{potentialProfit} credits
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
