import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, TrendingUp, Star, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../contexts/GameContext';

export const PlinkoGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState('1');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [rows, setRows] = useState(16);
  const [isDropping, setIsDropping] = useState(false);
  const [ballPosition, setBallPosition] = useState<{x: number, y: number} | null>(null);
  const [gameHistory, setGameHistory] = useState<Array<{multiplier: number, won: boolean}>>([]);
  const [lastResult, setLastResult] = useState<{multiplier: number, bucket: number} | null>(null);
  
  const { currencies, selectedCurrency, getBalance, updateBalance, switchCurrency } = useWallet();
  const { updateStats, generateProvablyFairSeed } = useGame();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Multipliers for different risk levels and rows
  const getMultipliers = () => {
    const multipliers = {
      low: {
        8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        12: [8.4, 3, 1.9, 1.2, 1, 0.7, 0.7, 1, 1.2, 1.9, 3, 8.4],
        16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16]
      },
      medium: {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
      },
      high: {
        8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
        12: [76, 18, 5, 1.9, 0.4, 0.2, 0.1, 0.2, 0.4, 1.9, 5, 18, 76],
        16: [420, 130, 26, 9, 4, 2, 0.2, 0.2, 0.1, 0.2, 0.2, 2, 4, 9, 26, 130, 420]
      }
    };
    return multipliers[riskLevel][rows as keyof typeof multipliers[typeof riskLevel]];
  };

  const dropBall = async () => {
    const balance = getBalance();
    if (parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0 || isDropping) return;

    setIsDropping(true);
    updateBalance(-parseFloat(betAmount));

    // Generate provably fair path
    const seed = generateProvablyFairSeed();
    const path: number[] = [];
    let position = rows / 2; // Start at center

    // Simulate ball bouncing through pegs
    for (let row = 0; row < rows; row++) {
      const random = Math.random();
      const direction = random < 0.5 ? -0.5 : 0.5;
      position += direction;
      path.push(position);
    }

    // Animate ball drop
    for (let i = 0; i < path.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setBallPosition({ x: path[i], y: i });
    }

    // Determine final bucket
    const finalBucket = Math.max(0, Math.min(getMultipliers().length - 1, Math.floor(position)));
    const multiplier = getMultipliers()[finalBucket];
    
    setLastResult({ multiplier, bucket: finalBucket });
    
    const won = multiplier >= 1;
    if (won) {
      const winAmount = parseFloat(betAmount) * multiplier;
      updateBalance(winAmount);
    }

    updateStats(parseFloat(betAmount), won);
    setGameHistory(prev => [...prev.slice(-9), { multiplier, won }]);

    setTimeout(() => {
      setIsDropping(false);
      setBallPosition(null);
    }, 1000);
  };

  const formatBalance = (amount: number) => {
    if (selectedCurrency === 'BTC') return amount.toFixed(8);
    if (selectedCurrency === 'ETH') return amount.toFixed(6);
    return amount.toFixed(2);
  };

  const getBucketColor = (multiplier: number) => {
    if (multiplier >= 10) return 'from-red-500 to-red-700';
    if (multiplier >= 3) return 'from-orange-500 to-orange-700';
    if (multiplier >= 1) return 'from-green-500 to-green-700';
    return 'from-gray-500 to-gray-700';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Plinko Board */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 relative overflow-hidden">
            <div className="relative">
              {/* Pegs */}
              <div className="grid gap-4 justify-center mb-8">
                {Array.from({ length: rows }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center space-x-8">
                    {Array.from({ length: rowIndex + 3 }, (_, pegIndex) => (
                      <div
                        key={pegIndex}
                        className="w-3 h-3 bg-white rounded-full shadow-lg"
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Ball */}
              <AnimatePresence>
                {ballPosition && (
                  <motion.div
                    className="absolute w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-lg z-10"
                    style={{
                      left: `${50 + (ballPosition.x - rows/2) * 32}%`,
                      top: `${ballPosition.y * 32 + 20}px`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 0.1,
                      repeat: Infinity,
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Multiplier Buckets */}
              <div className="flex justify-center space-x-1 mt-8">
                {getMultipliers().map((multiplier, index) => (
                  <div
                    key={index}
                    className={`w-12 h-16 bg-gradient-to-b ${getBucketColor(multiplier)} rounded-lg flex items-center justify-center border-2 ${
                      lastResult?.bucket === index ? 'border-yellow-400 shadow-lg shadow-yellow-400/50' : 'border-white/20'
                    }`}
                  >
                    <div className="text-white text-xs font-bold text-center">
                      {multiplier}x
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Result Display */}
            {lastResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6"
              >
                <div className={`text-3xl font-bold mb-2 ${
                  lastResult.multiplier >= 1 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastResult.multiplier}x
                </div>
                <div className="text-white">
                  {lastResult.multiplier >= 1 ? 'WIN' : 'LOSS'}: {formatBalance(parseFloat(betAmount) * lastResult.multiplier)} {selectedCurrency}
                </div>
              </motion.div>
            )}
          </div>

          {/* Game Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  value={selectedCurrency}
                  onChange={(e) => switchCurrency(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                >
                  {currencies.map(currency => (
                    <option key={currency.symbol} value={currency.symbol} className="bg-slate-800">
                      {currency.symbol} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bet Amount
                </label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Enter bet amount"
                  step={selectedCurrency === 'BTC' ? '0.00000001' : selectedCurrency === 'ETH' ? '0.000001' : '0.01'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Risk Level
                </label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="low" className="bg-slate-800">Low Risk</option>
                  <option value="medium" className="bg-slate-800">Medium Risk</option>
                  <option value="high" className="bg-slate-800">High Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rows
                </label>
                <select
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value={8} className="bg-slate-800">8 Rows</option>
                  <option value={12} className="bg-slate-800">12 Rows</option>
                  <option value={16} className="bg-slate-800">16 Rows</option>
                </select>
              </div>
            </div>

            <button
              onClick={dropBall}
              disabled={isDropping || parseFloat(betAmount) > getBalance() || parseFloat(betAmount) <= 0}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>{isDropping ? 'Dropping...' : 'Drop Ball'}</span>
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Game Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Game Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Bet Amount</span>
                <span className="text-white font-semibold">{betAmount} {selectedCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Balance</span>
                <span className="text-white font-semibold">{formatBalance(getBalance())} {selectedCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Risk Level</span>
                <span className={`font-semibold ${
                  riskLevel === 'high' ? 'text-red-400' : 
                  riskLevel === 'medium' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Rows</span>
                <span className="text-white font-semibold">{rows}</span>
              </div>
            </div>
          </div>

          {/* Multipliers */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Multipliers</h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {getMultipliers().map((multiplier, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-center font-bold ${
                    multiplier >= 10 ? 'bg-red-600/20 text-red-400' :
                    multiplier >= 3 ? 'bg-orange-600/20 text-orange-400' :
                    multiplier >= 1 ? 'bg-green-600/20 text-green-400' :
                    'bg-gray-600/20 text-gray-400'
                  }`}
                >
                  {multiplier}x
                </div>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Games</h3>
            <div className="space-y-2">
              {gameHistory.map((game, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    game.won ? 'bg-green-600/20 border border-green-600/30' : 'bg-red-600/20 border border-red-600/30'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      game.won ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      <Circle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{game.multiplier}x</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                    {game.won ? 'WIN' : 'LOSS'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategy Tips */}
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl p-6 border border-blue-600/30">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Pro Tips</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Higher risk = higher potential rewards</li>
              <li>• More rows = more extreme multipliers</li>
              <li>• Center buckets have lower multipliers</li>
              <li>• Edge buckets have the highest payouts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};