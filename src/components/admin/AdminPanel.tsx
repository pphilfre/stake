import React, { useState } from 'react'
import { X, Settings, Lock, Unlock, RotateCcw, Save, Eye, EyeOff, Crown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAdmin } from '../../contexts/AdminContext'

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
  
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [tempSettings, setTempSettings] = useState(gameId ? gameSettings[gameId] || {} : {})

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

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 w-full max-w-4xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
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

            {gameId && (
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