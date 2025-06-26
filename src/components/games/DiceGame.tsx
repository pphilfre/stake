import React, { useState, useEffect } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Play, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../contexts/GameContext';

export const DiceGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState('1');
  const [prediction, setPrediction] = useState<'over' | 'under'>('over');
  const [rollOver, setRollOver] = useState(50);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [gameHistory, setGameHistory] = useState<Array<{result: number, prediction: string, won: boolean}>>([]);
  
  const { balance, updateBalance } = useWallet();
  const { updateStats, generateProvablyFairSeed } = useGame();

  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  
  const multiplier = prediction === 'over' 
    ? (99 / (100 - rollOver)) 
    : (99 / rollOver);

  const winChance = prediction === 'over' ? (100 - rollOver) : rollOver;

  const rollDice = async () => {
    if (parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0) return;

    setIsRolling(true);
    updateBalance(-parseFloat(betAmount));

    // Generate provably fair result
    const seed = generateProvablyFairSeed();
    const roll = Math.floor(Math.random() * 100) + 1;

    // Simulate rolling animation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setDiceResult(roll);
    setIsRolling(false);

    const won = (prediction === 'over' && roll > rollOver) || (prediction === 'under' && roll < rollOver);
    setLastWin(won);

    if (won) {
      const winAmount = parseFloat(betAmount) * multiplier;
      updateBalance(winAmount);
    }

    updateStats(parseFloat(betAmount), won);
    setGameHistory(prev => [...prev.slice(-9), { result: roll, prediction: `${prediction} ${rollOver}`, won }]);
  };

  const getDiceIcon = () => {
    if (isRolling) {
      return RotateCw;
    }
    if (diceResult === null) return Dice1;
    const index = Math.floor((diceResult - 1) / 16.66);
    return diceIcons[Math.min(index, 5)];
  };

  const DiceIcon = getDiceIcon();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dice Display */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <motion.div
              animate={isRolling ? { rotate: 360 } : {}}
              transition={{ duration: 0.5, repeat: isRolling ? Infinity : 0, ease: "linear" }}
              className="inline-block"
            >
              <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                lastWin === true ? 'bg-green-600' : 
                lastWin === false ? 'bg-red-600' : 
                'bg-gradient-to-r from-yellow-400 to-orange-500'
              }`}>
                <DiceIcon className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            {diceResult !== null && (
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{diceResult}</div>
                <div className={`text-lg font-semibold ${lastWin ? 'text-green-400' : 'text-red-400'}`}>
                  {lastWin ? 'You Won!' : 'You Lost!'}
                </div>
              </div>
            )}
          </div>

          {/* Bet Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Prediction
                </label>
                <div className="flex rounded-lg bg-white/5 p-1">
                  <button
                    onClick={() => setPrediction('under')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      prediction === 'under'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Under
                  </button>
                  <button
                    onClick={() => setPrediction('over')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      prediction === 'over'
                        ? 'bg-green-600 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Over
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Roll {prediction === 'over' ? 'Over' : 'Under'}: {rollOver}
              </label>
              <input
                type="range"
                min="1"
                max="99"
                value={rollOver}
                onChange={(e) => setRollOver(parseInt(e.target.value))}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>1</span>
                <span>99</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-center">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-sm text-gray-400">Win Chance</div>
                <div className="text-xl font-bold text-white">{winChance.toFixed(1)}%</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-sm text-gray-400">Multiplier</div>
                <div className="text-xl font-bold text-white">{multiplier.toFixed(2)}x</div>
              </div>
            </div>

            <button
              onClick={rollDice}
              disabled={isRolling || parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2 mt-6"
            >
              <Play className="w-5 h-5" />
              <span>{isRolling ? 'Rolling...' : 'Roll Dice'}</span>
            </button>
          </div>
        </div>

        {/* Game History */}
        <div className="space-y-6">
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
                      <span className="text-white text-sm font-bold">{game.result}</span>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{game.prediction}</div>
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                    {game.won ? 'WIN' : 'LOSS'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};