import React from 'react'
import { Link } from 'react-router-dom'
import { Dice1, Shield, Zap, ArrowRight, Users, TrendingUp, Star } from 'lucide-react'
import { motion } from 'framer-motion'

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
      title: 'Premium Games',
      description: 'Dice, Roulette, Blackjack, Mines, and Plinko',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Join thousands of players worldwide',
    },
  ]

  const stats = [
    { label: 'Players', value: '50K+' },
    { label: 'Games Played', value: '2M+' },
    { label: 'Total Winnings', value: '$10M+' },
    { label: 'Uptime', value: '99.9%' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1d29] to-[#0f1419]">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-xl flex items-center justify-center">
                <span className="text-black font-bold text-2xl">🥩</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white">
                Steak
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              The most advanced crypto casino platform with provably fair games, 
              instant payouts, and unmatched security.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/casino"
                className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] text-black font-semibold px-8 py-4 rounded-lg transition-all flex items-center justify-center space-x-2 text-lg"
              >
                <Dice1 className="w-6 h-6" />
                <span>Play Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-all backdrop-blur-sm border border-white/20 flex items-center justify-center space-x-2 text-lg">
                <Shield className="w-6 h-6" />
                <span>Learn More</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-[#00d4aa] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#1a1d29]/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Steak?
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Built for the modern gambler with cutting-edge technology and unmatched security.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-[#0f1419] rounded-xl p-6 border border-[#2d3748] hover:border-[#00d4aa]/50 transition-all group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </motion.div>
              )
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
            className="bg-gradient-to-r from-[#00d4aa]/10 to-[#00b894]/10 rounded-2xl p-8 border border-[#00d4aa]/20 backdrop-blur-sm"
          >
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Star className="w-8 h-8 text-[#00d4aa]" />
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Start Playing?
              </h2>
            </div>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of players who trust Steak for their gaming experience.
            </p>
            <Link
              to="/casino"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] text-black font-semibold px-8 py-4 rounded-lg transition-all text-lg"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}