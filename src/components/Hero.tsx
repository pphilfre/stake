import React from 'react';
import { Link } from 'react-router-dom';
import { Dice1, TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Provably Fair',
      description: 'Cryptographically verified fairness for all games',
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Lightning-fast cryptocurrency transactions',
    },
    {
      icon: Dice1,
      title: 'Casino Games',
      description: 'Dice, Roulette, Blackjack and more',
    },
    {
      icon: TrendingUp,
      title: 'Live Sports',
      description: 'Real-time odds on major sporting events',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              The Future of
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Crypto Gaming
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the most advanced crypto casino and sportsbook platform.
              Provably fair games, live sports betting, and instant crypto payouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/casino"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <Dice1 className="w-5 h-5" />
                <span>Play Casino</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/sportsbook"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3 rounded-lg transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center space-x-2"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Sports Betting</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose CryptoVault?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Built for the modern crypto gambler with cutting-edge technology and unmatched security.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-2xl p-8 border border-yellow-400/20 backdrop-blur-sm"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Playing?
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Join thousands of players who trust CryptoVault for their crypto gaming experience.
            </p>
            <Link
              to="/casino"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-3 rounded-lg transition-all"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};