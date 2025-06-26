import React, { useState, useEffect } from 'react';
import { Play, RotateCw, Bomb, Gem, Zap, TrendingUp, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../contexts/GameContext';

interface Cell {
  id: number;
  revealed: boolean;
  isMine: boolean;
  isGem: boolean;
}

export const MinesGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState('1');
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [cells, setCells] = useState<Cell[]>([]);
  const [revealedGems, setRevealedGems] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [gameHistory, setGameHistory] = useState<Array<{gems: number, multiplier: number, won: boolean}>>([]);
  const [animatingCell, setAnimatingCell] = useState<number | null>(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [showLoseAnimation, setShowLoseAnimation] = useState(false);
  
  const { balance, updateBalance } = useWallet();
  const { updateStats, generateProvablyFairSeed } = useGame();

  const gridSize = 25; // 5x5 grid

  const initializeGame = () => {
    if (parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0) return;

    const newCells: Cell[] = Array.from({ length: gridSize }, (_, index) => ({
      id: index,
      revealed: false,
      isMine: false,
      isGem: false,
    }));

    // Place mines randomly
    const minePositions = new Set<number>();
    while (minePositions.size < mineCount) {
      const randomPos = Math.floor(Math.random() * gridSize);
      minePositions.add(randomPos);
    }

    // Set mines and gems
    newCells.forEach((cell, index) => {
      if (minePositions.has(index)) {
        cell.isMine = true;
      } else {
        cell.isGem = true;
      }
    });

    setCells(newCells);
    setGameState('playing');
    setRevealedGems(0);
    setCurrentMultiplier(1);
    setShowWinAnimation(false);
    setShowLoseAnimation(false);
    updateBalance(-parseFloat(betAmount));
  };

  const calculateMultiplier = (gemsRevealed: number) => {
    const totalGems = gridSize - mineCount;
    if (gemsRevealed === 0) return 1;
    
    // Progressive multiplier calculation
    let multiplier = 1;
    for (let i = 1; i <= gemsRevealed; i++) {
      const remaining = totalGems - i + 1;
      const total = gridSize - i + 1;
      multiplier *= (total / remaining);
    }
    return multiplier * 0.97; // House edge
  };

  const revealCell = (cellId: number) => {
    if (gameState !== 'playing') return;
    
    const cell = cells[cellId];
    if (cell.revealed) return;

    setAnimatingCell(cellId);
    
    setTimeout(() => {
      setCells(prev => prev.map(c => 
        c.id === cellId ? { ...c, revealed: true } : c
      ));

      if (cell.isMine) {
        // Hit a mine - game over
        setGameState('finished');
        setShowLoseAnimation(true);
        updateStats(parseFloat(betAmount), false);
        setGameHistory(prev => [...prev.slice(-9), { 
          gems: revealedGems, 
          multiplier: currentMultiplier, 
          won: false 
        }]);
        
        // Reveal all mines after a delay
        setTimeout(() => {
          setCells(prev => prev.map(c => ({ ...c, revealed: true })));
        }, 1000);
      } else {
        // Found a gem
        const newGemsCount = revealedGems + 1;
        const newMultiplier = calculateMultiplier(newGemsCount);
        setRevealedGems(newGemsCount);
        setCurrentMultiplier(newMultiplier);
        
        // Check if all gems found
        if (newGemsCount === gridSize - mineCount) {
          setGameState('finished');
          setShowWinAnimation(true);
          const winAmount = parseFloat(betAmount) * newMultiplier;
          updateBalance(winAmount);
          updateStats(parseFloat(betAmount), true);
          setGameHistory(prev => [...prev.slice(-9), { 
            gems: newGemsCount, 
            multiplier: newMultiplier, 
            won: true 
          }]);
        }
      }
      
      setAnimatingCell(null);
    }, 300);
  };

  const cashOut = () => {
    if (gameState !== 'playing' || revealedGems === 0) return;
    
    setGameState('finished');
    setShowWinAnimation(true);
    const winAmount = parseFloat(betAmount) * currentMultiplier;
    updateBalance(winAmount);
    updateStats(parseFloat(betAmount), true);
    setGameHistory(prev => [...prev.slice(-9), { 
      gems: revealedGems, 
      multiplier: currentMultiplier, 
      won: true 
    }]);
  };

  const newGame = () => {
    setGameState('betting');
    setCells([]);
    setRevealedGems(0);
    setCurrentMultiplier(1);
    setShowWinAnimation(false);
    setShowLoseAnimation(false);
  };

  const getCellContent = (cell: Cell) => {
    if (!cell.revealed) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border border-slate-600 hover:border-yellow-400 transition-all duration-200 cursor-pointer flex items-center justify-center group">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full group-hover:scale-110 transition-transform duration-200" />
        </div>
      );
    }

    if (cell.isMine) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-2 border-red-500 flex items-center justify-center"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            <Bomb className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>
      );
    }

    return (
      <motion.div
        initial={{ scale: 0, rotate: 0 }}
        animate={{ scale: 1, rotate: 360 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg border-2 border-green-400 flex items-center justify-center relative overflow-hidden"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Gem className="w-8 h-8 text-white" />
        </motion.div>
        
        {/* Sparkle effect */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 20}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Stats */}
          <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{revealedGems}</div>
                <div className="text-purple-300 text-sm">Gems Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">{currentMultiplier.toFixed(2)}x</div>
                <div className="text-purple-300 text-sm">Multiplier</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">${(parseFloat(betAmount) * currentMultiplier).toFixed(2)}</div>
                <div className="text-purple-300 text-sm">Potential Win</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">{mineCount}</div>
                <div className="text-purple-300 text-sm">Mines</div>
              </div>
            </div>
          </div>

          {/* Game Grid */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="grid grid-cols-5 gap-3 max-w-md mx-auto relative z-10">
              {cells.map((cell) => (
                <motion.div
                  key={cell.id}
                  className="aspect-square"
                  whileHover={{ scale: gameState === 'playing' && !cell.revealed ? 1.05 : 1 }}
                  whileTap={{ scale: gameState === 'playing' && !cell.revealed ? 0.95 : 1 }}
                  onClick={() => revealCell(cell.id)}
                >
                  <AnimatePresence>
                    {animatingCell === cell.id && (
                      <motion.div
                        className="absolute inset-0 bg-yellow-400 rounded-lg"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </AnimatePresence>
                  {getCellContent(cell)}
                </motion.div>
              ))}
            </div>

            {/* Win Animation */}
            <AnimatePresence>
              {showWinAnimation && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <div className="text-4xl font-bold text-green-400 mb-2">YOU WIN!</div>
                    <div className="text-2xl text-white">${(parseFloat(betAmount) * currentMultiplier).toFixed(2)}</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lose Animation */}
            <AnimatePresence>
              {showLoseAnimation && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5, repeat: 3 }}
                      className="text-6xl mb-4"
                    >
                      💥
                    </motion.div>
                    <div className="text-4xl font-bold text-red-400 mb-2">BOOM!</div>
                    <div className="text-xl text-white">Better luck next time!</div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Game Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            {gameState === 'betting' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      Number of Mines
                    </label>
                    <select
                      value={mineCount}
                      onChange={(e) => setMineCount(parseInt(e.target.value))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num} className="bg-slate-800">{num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={initializeGame}
                  disabled={parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start Game</span>
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-lg text-gray-300 mb-2">
                    Click tiles to reveal gems. Avoid the mines!
                  </div>
                  <div className="text-sm text-gray-400">
                    {gridSize - mineCount - revealedGems} gems remaining
                  </div>
                </div>
                
                <button
                  onClick={cashOut}
                  disabled={revealedGems === 0}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Cash Out ${(parseFloat(betAmount) * currentMultiplier).toFixed(2)}</span>
                </button>
              </div>
            )}

            {gameState === 'finished' && (
              <button
                onClick={newGame}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-4 rounded-lg transition-all"
              >
                New Game
              </button>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Game Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Game Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Current Bet</span>
                <span className="text-white font-semibold">${betAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Balance</span>
                <span className="text-white font-semibold">${balance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Mines</span>
                <span className="text-red-400 font-semibold">{mineCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Safe Tiles</span>
                <span className="text-green-400 font-semibold">{gridSize - mineCount}</span>
              </div>
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
                      {game.won ? <Gem className="w-4 h-4 text-white" /> : <Bomb className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">{game.gems} gems</div>
                      <div className="text-gray-400 text-xs">{game.multiplier.toFixed(2)}x</div>
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
              <li>• Start with fewer mines for better odds</li>
              <li>• Cash out early to secure profits</li>
              <li>• Higher mines = higher multipliers</li>
              <li>• Each revealed gem increases your multiplier</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};