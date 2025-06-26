import React, { useState } from 'react';
import { Dice1, RotateCw, Spade as SuitSpade, Play, Eye, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '../contexts/GameContext';
import { DiceGame } from './games/DiceGame';
import { RouletteGame } from './games/RouletteGame';
import { BlackjackGame } from './games/BlackjackGame';
import { MinesGame } from './games/MinesGame';
import { ProvablyFairModal } from './ProvablyFairModal';

export const Casino: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [isProvablyFairOpen, setIsProvablyFairOpen] = useState(false);
  const { gameStats } = useGame();

  const games = [
    {
      id: 'mines',
      name: 'Mines',
      icon: Zap,
      description: 'Find gems while avoiding mines in this thrilling game of risk and reward',
      component: MinesGame,
      minBet: 0.001,
      maxBet: 100,
      featured: true,
    },
    {
      id: 'dice',
      name: 'Dice',
      icon: Dice1,
      description: 'Roll the dice and win big with our provably fair dice game',
      component: DiceGame,
      minBet: 0.001,
      maxBet: 10,
    },
    {
      id: 'roulette',
      name: 'Roulette',
      icon: RotateCw,
      description: 'Spin the wheel in our classic European roulette',
      component: RouletteGame,
      minBet: 0.01,
      maxBet: 100,
    },
    {
      id: 'blackjack',
      name: 'Blackjack',
      icon: SuitSpade,
      description: 'Beat the dealer in this classic card game',
      component: BlackjackGame,
      minBet: 0.01,
      maxBet: 50,
    },
  ];

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="min-h-screen pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => setSelectedGame(null)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                ← Back to Casino
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
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Casino Games
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Experience our collection of provably fair casino games. Every bet is transparent and verifiable.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">{gameStats.totalGames.toLocaleString()}</h3>
            <p className="text-gray-300">Games Played</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">${gameStats.totalWagered.toLocaleString()}</h3>
            <p className="text-gray-300">Total Wagered</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-2">{gameStats.houseEdge}%</h3>
            <p className="text-gray-300">House Edge</p>
          </div>
        </div>

        {/* Featured Game */}
        {games.filter(game => game.featured).map((game) => {
          const Icon = game.icon;
          return (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 mb-12 relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="featured-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#featured-grid)" />
                </svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                      <Icon className="w-8 h-8 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                          FEATURED
                        </span>
                        <div className="flex items-center space-x-2 text-green-400">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm">Provably Fair</span>
                        </div>
                      </div>
                      <h2 className="text-3xl font-bold text-white">{game.name}</h2>
                      <p className="text-gray-300 text-lg">{game.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGame(game.id)}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 rounded-xl transition-all flex items-center space-x-2 text-lg"
                  >
                    <Play className="w-5 h-5" />
                    <span>Play Now</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Min Bet</div>
                    <div className="text-xl font-bold text-white">{game.minBet} BTC</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Max Bet</div>
                    <div className="text-xl font-bold text-white">{game.maxBet} BTC</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Max Multiplier</div>
                    <div className="text-xl font-bold text-yellow-400">24.75x</div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.filter(game => !game.featured).map((game, index) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex items-center space-x-2 text-green-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">Provably Fair</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{game.name}</h3>
                <p className="text-gray-300 mb-4">{game.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                  <span>Min: {game.minBet} BTC</span>
                  <span>Max: {game.maxBet} BTC</span>
                </div>
                <button
                  onClick={() => setSelectedGame(game.id)}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>Play Now</span>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Provably Fair Section */}
        <div className="mt-16 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-2xl p-8 border border-green-600/20">
          <div className="text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Provably Fair Gaming</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Every game outcome is cryptographically verifiable. We use advanced algorithms to ensure
              complete transparency and fairness in every bet you place.
            </p>
            <button
              onClick={() => setIsProvablyFairOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      <ProvablyFairModal isOpen={isProvablyFairOpen} onClose={() => setIsProvablyFairOpen(false)} />
    </div>
  );
};