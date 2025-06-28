import React, { useState } from 'react';
import { Dice1, RotateCw, Spade as SuitSpade, Play, Eye, Shield, Zap, Circle, Bomb, Gem, TrendingUp, Users, DollarSign, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { DiceGame } from './games/DiceGame';
import { RouletteGame } from './games/RouletteGame';
import { BlackjackGame } from './games/BlackjackGame';
import { MinesGame } from './games/MinesGame';
import { PlinkoGame } from './games/PlinkoGame';
import { ProvablyFairModal } from './ProvablyFairModal';

export const Casino: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isProvablyFairOpen, setIsProvablyFairOpen] = useState(false);
  const { gameStats } = useGame();
  const { gameResults, profile } = useAuth();
  const { currencies, convertToUSD } = useWallet();

  const games = [
    {
      id: 'mines',
      name: 'Mines',
      icon: Bomb,
      description: 'Find gems while avoiding mines in this thrilling game of risk and reward',
      component: MinesGame,
      minBet: 0.001,
      maxBet: 100,
      maxMultiplier: '24.75x',
      featured: true,
      color: 'from-red-500 to-orange-600',
    },
    {
      id: 'plinko',
      name: 'Plinko',
      icon: Circle,
      description: 'Drop the ball and watch it bounce through pegs to win big multipliers',
      component: PlinkoGame,
      minBet: 0.001,
      maxBet: 100,
      maxMultiplier: '420x',
      featured: true,
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'dice',
      name: 'Dice',
      icon: Dice1,
      description: 'Roll the dice and win big with our provably fair dice game',
      component: DiceGame,
      minBet: 0.001,
      maxBet: 10,
      maxMultiplier: '99x',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      id: 'roulette',
      name: 'Roulette',
      icon: RotateCw,
      description: 'Spin the wheel in our classic European roulette',
      component: RouletteGame,
      minBet: 0.01,
      maxBet: 100,
      maxMultiplier: '36x',
      color: 'from-green-500 to-emerald-600',
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      icon: SuitSpade,
      description: 'Beat the dealer in this classic card game',
      component: BlackjackGame,
      minBet: 0.01,
      maxBet: 50,
      maxMultiplier: '3:2',
      color: 'from-gray-700 to-gray-900',
    },
  ];

  // Calculate real stats from game results and profile
  const totalGamesPlayed = gameResults.length;
  const totalWagered = gameResults.reduce((sum, result) => sum + convertToUSD(result.bet_amount, result.currency), 0);
  const totalWon = gameResults.reduce((sum, result) => sum + convertToUSD(result.win_amount, result.currency), 0);
  const houseEdge = totalWagered > 0 ? ((totalWagered - totalWon) / totalWagered * 100) : 1.2;
  const winRate = totalGamesPlayed > 0 ? (gameResults.filter(r => r.win_amount > r.bet_amount).length / totalGamesPlayed * 100) : 0;

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="min-h-screen pt-20 pb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedGame(null)}
                className="text-gray-300 hover:text-white transition-colors flex items-center space-x-2 group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                <span>Back to Casino</span>
              </button>
              <button
                onClick={() => setIsProvablyFairOpen(true)}
                className="flex items-center space-x-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 px-4 py-2 rounded-lg transition-colors border border-green-600/30"
              >
                <Shield className="w-4 h-4" />
                <span>Provably Fair</span>
              </button>
            </div>
            <GameComponent />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen pt-20 pb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Casino Games
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Experience our collection of provably fair casino games. Every bet is transparent, 
            verifiable, and designed for maximum excitement.
          </motion.p>
        </div>

        {/* Real Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-3">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <span className="text-gray-400 text-sm">Games Played</span>
            </div>
            <h3 className="text-3xl font-bold text-white">{totalGamesPlayed.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm mt-1">
              {profile?.is_guest ? 'Guest Session' : 'Your Total'}
            </p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-3">
              <DollarSign className="w-6 h-6 text-green-500" />
              <span className="text-gray-400 text-sm">Total Wagered</span>
            </div>
            <h3 className="text-3xl font-bold text-white">${totalWagered.toLocaleString()}</h3>
            <p className="text-gray-400 text-sm mt-1">USD Equivalent</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              <span className="text-gray-400 text-sm">Win Rate</span>
            </div>
            <h3 className="text-3xl font-bold text-white">{winRate.toFixed(1)}%</h3>
            <p className="text-gray-400 text-sm mt-1">Your Success Rate</p>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-6 h-6 text-purple-500" />
              <span className="text-gray-400 text-sm">House Edge</span>
            </div>
            <h3 className="text-3xl font-bold text-white">{houseEdge.toFixed(1)}%</h3>
            <p className="text-gray-400 text-sm mt-1">Platform Average</p>
          </div>
        </motion.div>

        {/* Featured Games */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Featured Games</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {games.filter(game => game.featured).map((game, index) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className={`group relative bg-gradient-to-br ${game.color} rounded-3xl p-8 overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300`}
                  onClick={() => setSelectedGame(game.id)}
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`pattern-${game.id}`} width="60" height="60" patternUnits="userSpaceOnUse">
                          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#pattern-${game.id})`} />
                    </svg>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                              FEATURED
                            </span>
                            <div className="flex items-center space-x-2 text-white/80">
                              <Eye className="w-4 h-4" />
                              <span className="text-sm">Provably Fair</span>
                            </div>
                          </div>
                          <h3 className="text-3xl font-bold text-white">{game.name}</h3>
                        </div>
                      </div>
                      <button className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center space-x-2 group-hover:scale-110">
                        <Play className="w-5 h-5" />
                        <span>Play</span>
                      </button>
                    </div>
                    
                    <p className="text-white/90 text-lg mb-6 leading-relaxed">{game.description}</p>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-sm text-white/70 mb-1">Min Bet</div>
                        <div className="text-lg font-bold text-white">{game.minBet} BTC</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-sm text-white/70 mb-1">Max Bet</div>
                        <div className="text-lg font-bold text-white">{game.maxBet} BTC</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                        <div className="text-sm text-white/70 mb-1">Max Win</div>
                        <div className="text-lg font-bold text-yellow-300">{game.maxMultiplier}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* All Games Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">All Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {games.map((game, index) => {
              const Icon = game.icon;
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer transform hover:scale-105"
                  onClick={() => setSelectedGame(game.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center space-x-2 text-green-400">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Provably Fair</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed">{game.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span>Min: {game.minBet} BTC</span>
                    <span>Max: {game.maxBet} BTC</span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 group-hover:scale-105">
                    <Play className="w-4 h-4" />
                    <span>Play Now</span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Provably Fair Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-3xl p-8 border border-green-600/20 backdrop-blur-sm"
        >
          <div className="text-center">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Provably Fair Gaming</h2>
            <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-lg leading-relaxed">
              Every game outcome is cryptographically verifiable using advanced algorithms. 
              We ensure complete transparency and fairness in every bet you place, giving you 
              the confidence to play knowing the results are truly random and unmanipulated.
            </p>
            <button
              onClick={() => setIsProvablyFairOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-lg"
            >
              Learn More About Fairness
            </button>
          </div>
        </motion.div>
      </div>

      <ProvablyFairModal isOpen={isProvablyFairOpen} onClose={() => setIsProvablyFairOpen(false)} />
    </div>
  );
};