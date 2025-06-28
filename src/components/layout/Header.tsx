import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Menu, X, Coins, Settings, LogOut, Crown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../../contexts/WalletContext'
import { useAuth } from '../../contexts/AuthContext'
import { AuthModal } from '../auth/AuthModal'
import { ProfileModal } from '../profile/ProfileModal'
import { WalletModal } from '../wallet/WalletModal'
import { AdminPanel } from '../admin/AdminPanel'

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const { selectedCurrency, getBalance } = useWallet()
  const { user, profile, signOut } = useAuth()
  const location = useLocation()

  const navigation = [
    { name: 'Casino', href: '/casino', icon: Coins },
  ]

  const formatBalance = (amount: number) => {
    if (selectedCurrency === 'BTC') return amount.toFixed(8)
    if (selectedCurrency === 'ETH') return amount.toFixed(6)
    return amount.toFixed(2)
  }

  const handleSignOut = async () => {
    await signOut()
    setShowUserMenu(false)
  }

  return (
    <>
      <header className="bg-[#0f1419] border-b border-[#2d3748] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#00d4aa] to-[#00b894] rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">🥩</span>
                </div>
                <span className="text-xl font-bold text-white">Steak</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === item.href
                        ? 'text-[#00d4aa] bg-[#00d4aa]/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Balance */}
                  <button
                    onClick={() => setIsWalletModalOpen(true)}
                    className="hidden sm:flex items-center space-x-2 bg-[#1a1d29] hover:bg-[#2d3748] border border-[#2d3748] text-white px-4 py-2 rounded-lg transition-all"
                  >
                    <Coins className="w-4 h-4 text-[#00d4aa]" />
                    <span className="font-medium">{formatBalance(getBalance())} {selectedCurrency}</span>
                  </button>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#2d3748] flex items-center justify-center">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                              e.currentTarget.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <User className={`w-4 h-4 text-gray-400 ${profile?.avatar_url ? 'hidden' : ''}`} />
                      </div>
                      <span className="hidden sm:block text-white font-medium">
                        {profile?.username || 'User'}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 mt-2 w-48 bg-[#1a1d29] border border-[#2d3748] rounded-lg shadow-xl py-2"
                        >
                          <button
                            onClick={() => {
                              setIsProfileModalOpen(true)
                              setShowUserMenu(false)
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setIsWalletModalOpen(true)
                              setShowUserMenu(false)
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Coins className="w-4 h-4" />
                            <span>Wallet</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsAdminPanelOpen(true)
                              setShowUserMenu(false)
                            }}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            <Crown className="w-4 h-4" />
                            <span>Admin</span>
                          </button>

                          <div className="border-t border-[#2d3748] my-2"></div>
                          
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center space-x-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] text-black font-semibold px-6 py-2 rounded-lg transition-all"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#1a1d29] border-t border-[#2d3748]"
            >
              <div className="px-4 py-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium transition-all ${
                        location.pathname === item.href
                          ? 'text-[#00d4aa] bg-[#00d4aa]/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
                
                {user && (
                  <button
                    onClick={() => {
                      setIsWalletModalOpen(true)
                      setIsMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Coins className="w-5 h-5" />
                    <span>{formatBalance(getBalance())} {selectedCurrency}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
      <AdminPanel isVisible={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
    </>
  )
}