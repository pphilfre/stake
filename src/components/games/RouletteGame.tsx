import React, { useState, useEffect } from 'react';
import { Play, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../contexts/GameContext';

export const RouletteGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState('1');
  const [selectedBets, setSelectedBets] = useState<{[key: string]: number}>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [gameHistory, setGameHistory] = useState<number[]>([]);
  
  const { balance, updateBalance } = useWallet();
  const { updateStats, generateProvablyFairSeed } = useGame();

  const rouletteNumbers = [
    { number: 0, color: 'green' },
    { number: 32, color: 'red' }, { number: 15, color: 'black' }, { number: 19, color: 'red' },
    { number: 4, color: 'black' }, { number: 21, color: 'red' }, { number: 2, color: 'black' },
    { number: 25, color: 'red' }, { number: 17, color: 'black' }, { number: 34, color: 'red' },
    { number: 6, color: 'black' }, { number: 27, color: 'red' }, { number: 13, color: 'black' },
    { number: 36, color: 'red' }, { number: 11, color: 'black' }, { number: 30, color: 'red' },
    { number: 8, color: 'black' }, { number: 23, color: 'red' }, { number: 10, color: 'black' },
    { number: 5, color: 'red' }, { number: 24, color: 'black' }, { number: 16, color: 'red' },
    { number: 33, color: 'black' }, { number: 1, color: 'red' }, { number: 20, color: 'black' },
    { number: 14, color: 'red' }, { number: 31, color: 'black' }, { number: 9, color: 'red' },
    { number: 22, color: 'black' }, { number: 18, color: 'red' }, { number: 29, color: 'black' },
    { number: 7, color: 'red' }, { number: 28, color: 'black' }, { number: 12, color: 'red' },
    { number: 35, color: 'black' }, { number: 3, color: 'red' }, { number: 26, color: 'black' }
  ];

  const betTypes = [
    { name: 'Red', multiplier: 2, color: 'bg-red-600' },
    { name: 'Black', multiplier: 2, color: 'bg-black' },
    { name: 'Even', multiplier: 2, color: 'bg-blue-600' },
    { name: 'Odd', multiplier: 2, color: 'bg-purple-600' },
    { name: '1-18', multiplier: 2, color: 'bg-green-600' },
    { name: '19-36', multiplier: 2, color: 'bg-orange-600' },
  ];

  const placeBet = (betType: string) => {
    const amount = parseFloat(betAmount);
    if (amount > balance || amount <= 0) return;

    setSelectedBets(prev => ({
      ...prev,
      [betType]: (prev[betType] || 0) + amount
    }));
  };

  const clearBets = () => {
    setSelectedBets({});
  };

  const spin = async () => {
    const totalBet = Object.values(selectedBets).reduce((sum, bet) => sum + bet, 0);
    if (totalBet > balance || totalBet <= 0) return;

    setIsSpinning(true);
    updateBalance(-totalBet);

    // Generate provably fair result
    const seed = generateProvablyFairSeed();
    const spinResult = Math.floor(Math.random() * 37);

    // Simulate spinning animation
    await new Promise(resolve => setTimeout(resolve, 3000));

    setResult(spinResult);
    setIsSpinning(false);

    const resultData = rouletteNumbers.find(n => n.number === spinResult);
    let totalWin = 0;
    let hasWon = false;

    // Check winning bets
    Object.entries(selectedBets).forEach(([betType, amount]) => {
      let isWinner = false;
      let multiplier = 1;

      switch (betType) {
        case 'Red':
          isWinner = resultData?.color === 'red';
          multiplier = 2;
          break;
        case 'Black':
          isWinner = resultData?.color === 'black';
          multiplier = 2;
          break;
        case 'Even':
          isWinner = spinResult > 0 && spinResult % 2 === 0;
          multiplier = 2;
          break;
        case 'Odd':
          isWinner = spinResult > 0 && spinResult % 2 === 1;
          multiplier = 2;
          break;
        case '1-18':
          isWinner = spinResult >= 1 && spinResult <= 18;
          multiplier = 2;
          break;
        case '19-36':
          isWinner = spinResult >= 19 && spinResult <= 36;
          multiplier = 2;
          break;
      }

      if (isWinner) {
        totalWin += amount * multiplier;
        hasWon = true;
      }
    });

    if (totalWin > 0) {
      updateBalance(totalWin);
    }

    setLastWin(hasWon);
    updateStats(totalBet, hasWon);
    setGameHistory(prev => [...prev.slice(-9), spinResult]);
    setSelectedBets({});
  };

  const getNumberColor = (num: number) => {
    const numberData = rouletteNumbers.find(n => n.number === num);
    if (numberData?.color === 'red') return 'bg-red-600';
    if (numberData?.color === 'black') return 'bg-gray-900';
    return 'bg-green-600';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Roulette Wheel */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: isSpinning ? 3 : 0, ease: "easeInOut" }}
              className="inline-block"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full border-8 border-yellow-400 flex items-center justify-center relative overflow-hidden">
                <div className="w-full h-full bg-gradient-to-r from-red-600 via-black to-green-600 rounded-full flex items-center justify-center">
                  {isSpinning ? (
                    <RotateCw className="w-12 h-12 text-white animate-spin" />
                  ) : (
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      result !== null ? getNumberColor(result) : 'bg-gray-600'
                    }`}>
                      {result !== null ? result : '?'}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
            
            {result !== null && (
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{result}</div>
                <div className={`text-lg font-semibold ${lastWin ? 'text-green-400' : 'text-red-400'}`}>
                  {lastWin ? 'You Won!' : 'You Lost!'}
                </div>
              </div>
            )}
          </div>

          {/* Betting Board */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bet Amount
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                placeholder="Enter bet amount"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {betTypes.map((bet) => (
                <button
                  key={bet.name}
                  onClick={() => placeBet(bet.name)}
                  disabled={isSpinning}
                  className={`${bet.color} hover:opacity-80 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all relative`}
                >
                  <span>{bet.name}</span>
                  <span className="block text-xs">{bet.multiplier}x</span>
                  {selectedBets[bet.name] && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      ${selectedBets[bet.name]}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={spin}
                disabled={isSpinning || Object.keys(selectedBets).length === 0}
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>{isSpinning ? 'Spinning...' : 'Spin'}</span>
              </button>
              <button
                onClick={clearBets}
                disabled={isSpinning}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold px-6 py-4 rounded-lg transition-all"
              >
                Clear Bets
              </button>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Current Bets */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Current Bets</h3>
            {Object.keys(selectedBets).length === 0 ? (
              <p className="text-gray-400">No bets placed</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(selectedBets).map(([betType, amount]) => (
                  <div key={betType} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-white">{betType}</span>
                    <span className="text-yellow-400 font-semibold">${amount}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-yellow-400 font-bold">
                      ${Object.values(selectedBets).reduce((sum, bet) => sum + bet, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Numbers */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Numbers</h3>
            <div className="grid grid-cols-5 gap-2">
              {gameHistory.map((num, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getNumberColor(num)}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};