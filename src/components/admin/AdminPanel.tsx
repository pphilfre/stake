import React, { useState } from 'react'
import { X, Settings, Lock, Unlock, RotateCcw, Save, Eye, EyeOff } from 'lucide-react'
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
    resetGameSettings,
    globalSettings,
    updateGlobalSettings
  } = useAdmin()
  
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [activeTab, setActiveTab] = useState<'games' | 'global'>('games')
  const [tempSettings, setTempSettings] = useState(gameId ? gameSettings[gameId] || {} : {})
  const [tempGlobalSettings, setTempGlobalSettings] = useState(globalSettings)

  if (!isVisible) return null

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (authenticateAdmin(pin)) {
      setPin('')
      setPinError('')
      setTempSettings(gameId ? gameSettings[gameId] || {} : {})
      setTempGlobalSettings(globalSettings)
    } else {
      setPinError('Invalid PIN code')
      setPin('')
    }
  }

  const handleGameSettingChange = (key: string, value: number | boolean) => {
    setTempSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleGlobalSettingChange = (key: string, value: number | boolean | string) => {
    setTempGlobalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSaveGame = () => {
    if (gameId) {
      updateGameSettings(gameId, tempSettings)
    }
  }

  const handleSaveGlobal = () => {
    updateGlobalSettings(tempGlobalSettings)
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
        className="bg-[#1a1d29] rounded-2xl p-8 w-full max-w-4xl border border-[#2d3748] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-[#00d4aa]" />
            <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
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
              <Lock className="w-5 h-5" />
              <span className="text-lg">Admin access required</span>
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
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors"
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
              className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] text-black font-semibold py-3 rounded-lg transition-all"
            >
              Authenticate
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-400">
                <Unlock className="w-5 h-5" />
                <span>Admin authenticated</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-[#0f1419] rounded-lg p-1">
              <button
                onClick={() => setActiveTab('games')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'games'
                    ? 'bg-[#00d4aa] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Game Settings
              </button>
              <button
                onClick={() => setActiveTab('global')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'global'
                    ? 'bg-[#00d4aa] text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Global Settings
              </button>
            </div>

            {/* Game Settings Tab */}
            {activeTab === 'games' && gameId && (
              <div className="bg-[#0f1419] rounded-lg p-6 border border-[#2d3748]">
                <h3 className="text-xl font-semibold text-white mb-6 capitalize">
                  {gameId} Settings
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
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
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
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
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
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
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
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
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
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Game Enabled
                    </label>
                    <button
                      onClick={() => handleGameSettingChange('enabled', !tempSettings.enabled)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    className="flex-1 bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
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

            {/* Global Settings Tab */}
            {activeTab === 'global' && (
              <div className="bg-[#0f1419] rounded-lg p-6 border border-[#2d3748]">
                <h3 className="text-xl font-semibold text-white mb-6">
                  Global Platform Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={tempGlobalSettings.platformName || 'Steak Casino'}
                      onChange={(e) => handleGlobalSettingChange('platformName', e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Default Currency
                    </label>
                    <select
                      value={tempGlobalSettings.defaultCurrency || 'USD'}
                      onChange={(e) => handleGlobalSettingChange('defaultCurrency', e.target.value)}
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
                    >
                      <option value="USD">USD</option>
                      <option value="BTC">Bitcoin</option>
                      <option value="ETH">Ethereum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Daily Withdrawal ($)
                    </label>
                    <input
                      type="number"
                      min="100"
                      value={tempGlobalSettings.maxDailyWithdrawal || 10000}
                      onChange={(e) => handleGlobalSettingChange('maxDailyWithdrawal', parseFloat(e.target.value))}
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Minimum Age
                    </label>
                    <input
                      type="number"
                      min="18"
                      max="25"
                      value={tempGlobalSettings.minimumAge || 18}
                      onChange={(e) => handleGlobalSettingChange('minimumAge', parseInt(e.target.value))}
                      className="w-full px-4 py-3 bg-[#1a1d29] border border-[#2d3748] rounded-lg text-white focus:outline-none focus:border-[#00d4aa]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Maintenance Mode
                    </label>
                    <button
                      onClick={() => handleGlobalSettingChange('maintenanceMode', !tempGlobalSettings.maintenanceMode)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tempGlobalSettings.maintenanceMode
                          ? 'bg-red-600 text-white'
                          : 'bg-green-600 text-white'
                      }`}
                    >
                      {tempGlobalSettings.maintenanceMode ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">
                      Registration Enabled
                    </label>
                    <button
                      onClick={() => handleGlobalSettingChange('registrationEnabled', !tempGlobalSettings.registrationEnabled)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        tempGlobalSettings.registrationEnabled
                          ? 'bg-green-600 text-white'
                          : 'bg-red-600 text-white'
                      }`}
                    >
                      {tempGlobalSettings.registrationEnabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveGlobal}
                  className="w-full mt-8 bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Global Settings</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}