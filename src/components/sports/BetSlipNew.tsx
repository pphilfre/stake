import React, { useState } from 'react';
import { Trash2, Calculator, DollarSign, TrendingUp, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSports } from '../../contexts/SportsContext';
import { useWallet } from '../../contexts/WalletContext';

type BetType = 'single' | 'accumulator' | 'system';

export const BetSlip: React.FC = () => {
  const {
    betSlip,
    totalStake,
    totalPotentialWin,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    placeBet
  } = useSports();

  const { getBalance, updateBalance, selectedCurrency } = useWallet();
  
  const [betType, setBetType] = useState<BetType>('single');
  const [isPlacing, setIsPlacing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const balance = getBalance();

  const formatCurrency = (amount: number) => {
    if (selectedCurrency === 'BTC') return amount.toFixed(8);
    if (selectedCurrency === 'ETH') return amount.toFixed(6);
    return amount.toFixed(2);
  };

  const calculateAccumulatorOdds = () => {
    return betSlip.reduce((acc, bet) => acc * bet.odds, 1);
  };

  const calculateAccumulatorPayout = () => {
    if (betSlip.length === 0) return 0;
    const totalOdds = calculateAccumulatorOdds();
    const totalStakeAmount = betSlip.reduce((sum, bet) => sum + bet.stake, 0);
    return totalStakeAmount * totalOdds;
  };

  const handleStakeChange = (id: string, value: string) => {
    const stake = parseFloat(value) || 0;
    updateStake(id, stake);
  };

  const handleQuickStake = (multiplier: number) => {
    const quickStake = balance * multiplier;
    betSlip.forEach(bet => {
      updateStake(bet.id, quickStake / betSlip.length);
    });
  };

  const handlePlaceBet = async () => {
    if (totalStake > balance) return;
    
    setIsPlacing(true);
    try {
      // Deduct balance immediately
      updateBalance(-totalStake);
      
      const success = await placeBet();
      
      if (success) {
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 3000);
      } else {
        // Refund if bet failed
        updateBalance(totalStake);
      }
    } catch (error) {
      // Refund if bet failed
      updateBalance(totalStake);
      console.error('Failed to place bet:', error);
    } finally {
      setIsPlacing(false);
    }
  };

  const renderSingleBets = () => (
    <div className="space-y-3">
      {betSlip.map((bet) => (
        <motion.div
          key={bet.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-white font-medium text-sm">{bet.matchName}</div>
              <div className="text-gray-400 text-xs">{bet.marketName}</div>
              <div className="text-yellow-400 text-sm font-semibold">{bet.optionName}</div>
            </div>
            <button
              onClick={() => removeFromBetSlip(bet.id)}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Odds</span>
            <span className="text-white font-bold">{bet.odds.toFixed(2)}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-400 text-sm">Stake ({selectedCurrency})</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={bet.stake}
                  onChange={(e) => handleStakeChange(bet.id, e.target.value)}
                  className="w-20 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm text-right"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Potential Win</span>
              <span className="text-green-400 font-semibold text-sm">
                {formatCurrency(bet.potentialWin)} {selectedCurrency}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderAccumulatorBet = () => {
    if (betSlip.length < 2) {
      return (
        <div className="text-center py-8">
          <Calculator className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Add at least 2 selections for accumulator</p>
        </div>
      );
    }

    const totalOdds = calculateAccumulatorOdds();
    const accumulatorStake = totalStake / betSlip.length;
    const potentialWin = accumulatorStake * totalOdds;

    return (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg p-4 border border-purple-600/30">
          <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Accumulator Bet ({betSlip.length} selections)</span>
          </h4>
          
          <div className="space-y-2 mb-4">
            {betSlip.map((bet) => (
              <div key={bet.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-300">{bet.optionName}</span>
                <span className="text-yellow-400 font-medium">{bet.odds.toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-purple-600/30 pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Odds</span>
              <span className="text-white font-bold">{totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stake</span>
              <span className="text-white">{formatCurrency(accumulatorStake)} {selectedCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Potential Win</span>
              <span className="text-green-400 font-bold">{formatCurrency(potentialWin)} {selectedCurrency}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (betSlip.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5" />
          <span>Bet Slip</span>
        </h3>
        
        <div className="text-center py-8">
          <Calculator className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Add selections to start betting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 sticky top-6">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Bet Slip ({betSlip.length})</span>
          </h3>
          
          <button
            onClick={clearBetSlip}
            className="text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bet Type Selector */}
        <div className="flex space-x-2 mb-6">
          {['single', 'accumulator'].map((type) => (
            <button
              key={type}
              onClick={() => setBetType(type as BetType)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                betType === type
                  ? 'bg-yellow-400 text-black'
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Bets */}
        <div className="mb-6 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {betType === 'single' ? renderSingleBets() : renderAccumulatorBet()}
          </AnimatePresence>
        </div>

        {/* Quick Stake Buttons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Quick Stake</label>
          <div className="grid grid-cols-4 gap-2">
            {[0.1, 0.25, 0.5, 1].map((multiplier) => (
              <button
                key={multiplier}
                onClick={() => handleQuickStake(multiplier)}
                className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs transition-colors"
              >
                {(multiplier * 100).toFixed(0)}%
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-slate-800/50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-400">Balance</span>
            <span className="text-white">{formatCurrency(balance)} {selectedCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Stake</span>
            <span className="text-white">{formatCurrency(totalStake)} {selectedCurrency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Potential Win</span>
            <span className="text-green-400 font-bold">
              {formatCurrency(betType === 'accumulator' ? calculateAccumulatorPayout() : totalPotentialWin)} {selectedCurrency}
            </span>
          </div>
        </div>

        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={totalStake > balance || totalStake <= 0 || isPlacing}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
        >
          {isPlacing ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Placing Bet...</span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              <span>Place Bet</span>
            </>
          )}
        </button>

        {totalStake > balance && (
          <p className="text-red-400 text-sm mt-2 text-center">Insufficient balance</p>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl p-6 border border-green-500/30 max-w-sm mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Bet Placed!</h3>
                <p className="text-gray-400">Your bet has been successfully placed</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
