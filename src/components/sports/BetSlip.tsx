import React, { useState } from 'react';
import { X, Trash2, Calculator } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';

interface Bet {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  type: 'home' | 'away' | 'draw';
  odds: number;
  stake: number;
}

interface BetSlipProps {
  bets: Bet[];
  setBets: (bets: Bet[]) => void;
}

export const BetSlip: React.FC<BetSlipProps> = ({ bets, setBets }) => {
  const [betType, setBetType] = useState<'single' | 'accumulator'>('single');
  const { balance, updateBalance } = useWallet();

  const updateStake = (betId: string, stake: number) => {
    setBets(bets.map(bet => 
      bet.id === betId ? { ...bet, stake } : bet
    ));
  };

  const removeBet = (betId: string) => {
    setBets(bets.filter(bet => bet.id !== betId));
  };

  const clearAllBets = () => {
    setBets([]);
  };

  const getTotalStake = () => {
    if (betType === 'single') {
      return bets.reduce((sum, bet) => sum + bet.stake, 0);
    } else {
      // For accumulator, use the stake of the first bet
      return bets.length > 0 ? bets[0].stake : 0;
    }
  };

  const getPotentialWin = () => {
    if (betType === 'single') {
      return bets.reduce((sum, bet) => sum + (bet.stake * bet.odds), 0);
    } else {
      // For accumulator, multiply all odds
      const totalOdds = bets.reduce((odds, bet) => odds * bet.odds, 1);
      return bets.length > 0 ? bets[0].stake * totalOdds : 0;
    }
  };

  const placeBets = () => {
    const totalStake = getTotalStake();
    if (totalStake > balance || totalStake <= 0) return;

    updateBalance(-totalStake);
    
    // Simulate bet placement
    const isWin = Math.random() > 0.5;
    if (isWin) {
      setTimeout(() => {
        updateBalance(getPotentialWin());
        alert('Congratulations! Your bet won!');
      }, 2000);
    } else {
      setTimeout(() => {
        alert('Your bet lost. Better luck next time!');
      }, 2000);
    }

    setBets([]);
  };

  const getBetDescription = (bet: Bet) => {
    const teamName = bet.type === 'home' ? bet.homeTeam : 
                    bet.type === 'away' ? bet.awayTeam : 'Draw';
    return `${bet.homeTeam} vs ${bet.awayTeam} - ${teamName}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Bet Slip</h3>
        {bets.length > 0 && (
          <button
            onClick={clearAllBets}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {bets.length === 0 ? (
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Click on odds to add bets</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Bet Type Selector */}
          {bets.length > 1 && (
            <div className="flex rounded-lg bg-white/5 p-1 mb-4">
              <button
                onClick={() => setBetType('single')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  betType === 'single'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setBetType('accumulator')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  betType === 'accumulator'
                    ? 'bg-yellow-400 text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Accumulator
              </button>
            </div>
          )}

          {/* Bets List */}
          <div className="space-y-3">
            {bets.map((bet) => (
              <div key={bet.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">
                      {getBetDescription(bet)}
                    </div>
                    <div className="text-yellow-400 font-bold">
                      {bet.odds.toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={() => removeBet(bet.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {(betType === 'single' || bets.indexOf(bet) === 0) && (
                  <div className="mt-2">
                    <input
                      type="number"
                      value={bet.stake || ''}
                      onChange={(e) => updateStake(bet.id, parseFloat(e.target.value) || 0)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      placeholder="Stake"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Stake</span>
                <span className="text-white font-semibold">${getTotalStake().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Potential Win</span>
                <span className="text-green-400 font-semibold">${getPotentialWin().toFixed(2)}</span>
              </div>
              {betType === 'accumulator' && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Odds</span>
                  <span className="text-yellow-400 font-semibold">
                    {bets.reduce((odds, bet) => odds * bet.odds, 1).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Place Bet Button */}
          <button
            onClick={placeBets}
            disabled={getTotalStake() > balance || getTotalStake() <= 0}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-all"
          >
            Place Bet
          </button>
        </div>
      )}
    </div>
  );
};