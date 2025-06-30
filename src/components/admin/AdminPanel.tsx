import React, { useState } from 'react'
import { X, Settings, Lock, Unlock, RotateCcw, Save, Eye, EyeOff, Crown, TrendingUp, DollarSign, Users, Gamepad2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdmin } from '../../contexts/AdminContext'
import { useAuth } from '../../contexts/AuthContext'

interface AdminPanelProps {
  gameId?: string
  isVisible: boolean
  onClose: () => void
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ gameId, isVisible, onClose }) => {
  const { 
    isAdminAuthenticated, 
    authenticateAdmin, 
    logoutAdmin, 
    gameSettings, 
    updateGameSettings, 
    resetGameSettings
  } = useAdmin()
  
  const { gameResults, profile } = useAuth()
  
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [tempSettings, setTempSettings] = useState(gameId ? gameSettings[gameId] || {} : {})
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'settings'>('overview')

  if (!isVisible) return null

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authenticateAdmin(pin)) {
      setPin('')
      setPinError('')
      setTempSettings(gameId ? gameSettings[gameId] || {} : {})
    } else {
      setPinError('Invalid PIN code')
      setPin('')
    }
  }

  const handleGameSettingChange = (key: string, value: number | boolean) => {
    setTempSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveGame = () => {
    if (gameId) {
      updateGameSettings(gameId, tempSettings)
    }
  }

  const handleResetGame = () => {
    if (gameId) {
      resetGameSettings(gameId)
      setTempSettings(gameSettings[gameId])
    }
  }

  const handleLogout = () => {
    logoutAdmin()
    setPin('')
    setPinError('')
  }

  // Calculate admin stats
  const totalGamesPlayed = gameResults.length
  const totalWagered = gameResults.reduce((sum, result) => sum + result.bet_amount, 0)
  const totalWon = gameResults.reduce((sum, result) => sum + result.win_amount, 0)
  const houseProfit = totalWagered - totalWon
  const averageBet = totalGamesPlayed > 0 ? totalWagered / totalGamesPlayed : 0

  // Game type breakdown
  const gameBreakdown = gameResults.reduce((acc, result) => {
    acc[result.game_type] = (acc[result.game_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 w-full max-w-6xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!isAdminAuthenticated ? (
          <form onSubmit={handlePinSubmit} className="space-y-6 max-w-md mx-auto">
            <div className="flex items-center space-x-2 text-yellow-400 mb-6 justify-center">
              <Lock className="w-6 h-6" />
              <span className="text-xl">Admin access required</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter PIN Code
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="****"
                  maxLength={4}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {pinError && (
                <p className="text-red-400 text-sm mt-2">{pinError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold py-3 rounded-lg transition-all"
            >
              Authenticate
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-400">
                <Unlock className="w-6 h-6" />
                <span className="text-lg">Admin authenticated</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'games', label: 'Games', icon: Gamepad2 },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all flex items-center justify-center space-x-2 ${
                      activeTab === tab.id
                        ? 'bg-yellow-500 text-black'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <Gamepad2 className="w-6 h-6 text-blue-500" />
                      <span className="text-gray-400 text-sm">Total Games</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalGamesPlayed}</p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <DollarSign className="w-6 h-6 text-green-500" />
                      <span className="text-gray-400 text-sm">Total Wagered</span>
                    </div>
                    <p className="text-3xl font-bold text-white">${totalWagered.toFixed(2)}</p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-yellow-500" />
                      <span className="text-gray-400 text-sm">House Profit</span>
                    </div>
                    <p className={`text-3xl font-bold ${houseProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${houseProfit.toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center space-x-3 mb-3">
                      <Users className="w-6 h-6 text-purple-500" />
                      <span className="text-gray-400 text-sm">Avg Bet</span>
                    </div>
                    <p className="text-3xl font-bold text-white">${averageBet.toFixed(2)}</p>
                  </div>
                </div>

                {/* Game Breakdown */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Game Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Object.entries(gameBreakdown).map(([game, count]) => (
                      <div key={game} className="text-center">
                        <div className="text-2xl font-bold text-white">{count}</div>
                        <div className="text-gray-400 text-sm capitalize">{game}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {gameResults.slice(0, 10).map((result, index) => (
                      <div key={result.id || index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div>
                          <p className="text-white font-medium capitalize">{result.game_type}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(result.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">${result.bet_amount.toFixed(2)}</p>
                          <p className={`text-sm ${result.win_amount > result.bet_amount ? 'text-green-400' : 'text-red-400'}`}>
                            {result.win_amount > result.bet_amount ? '+' : ''}${(result.win_amount - result.bet_amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(gameSettings).map(([game, settings]) => (
                    <div key={game} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-semibold text-white mb-4 capitalize">{game}</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status</span>
                          <span className={`font-semibold ${settings.enabled ? 'text-green-400' : 'text-red-400'}`}>
                            {settings.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate</span>
                          <span className="text-white">{settings.winRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">House Edge</span>
                          <span className="text-white">{settings.houseEdge}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Min/Max Bet</span>
                          <span className="text-white">${settings.minBet} - ${settings.maxBet}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && gameId && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-2xl font-semibold text-white mb-6 capitalize flex items-center space-x-2">
                  <Settings className="w-6 h-6" />
                  <span>{gameId} Settings</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Win Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={tempSettings.winRate || 50}
                      onChange={(e) => handleGameSettingChange('winRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      House Edge (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={tempSettings.houseEdge || 2.5}
                      onChange={(e) => handleGameSettingChange('houseEdge', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Bet ($)
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={tempSettings.minBet || 1}
                      onChange={(e) => handleGameSettingChange('minBet', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Bet ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tempSettings.maxBet || 1000}
                      onChange={(e) => handleGameSettingChange('maxBet', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Payout ($)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tempSettings.maxPayout || 10000}
                      onChange={(e) => handleGameSettingChange('maxPayout', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Game Enabled
                    </label>
                    <button
                      onClick={() => handleGameSettingChange('enabled', !tempSettings.enabled)}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tempSettings.enabled
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {tempSettings.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={handleSaveGame}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </button>
                  
                  <button
                    onClick={handleResetGame}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset to Default</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}