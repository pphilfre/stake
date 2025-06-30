import React, { useState } from 'react'
import { X, User, Save, Trophy, TrendingUp, Calendar, Coins, Camera } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile, gameResults } = useAuth()
  const [username, setUsername] = useState(profile?.username || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await updateProfile({
        username: username || null,
        avatar_url: avatarUrl || null
      })
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !profile) return null

  const winRate = profile.games_played > 0 ? (gameResults.filter(r => r.win_amount > r.bet_amount).length / Math.min(gameResults.length, profile.games_played)) * 100 : 0
  const totalProfit = profile.total_won - profile.total_wagered

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 w-full max-w-4xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Info */}
          <div className="space-y-6">
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-700 flex items-center justify-center border-4 border-yellow-500">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <User className={`w-16 h-16 text-gray-400 ${avatarUrl ? 'hidden' : ''}`} />
                </div>
                <div className="absolute bottom-0 right-0 bg-yellow-500 rounded-full p-2">
                  <Camera className="w-4 h-4 text-black" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white">{profile.username || 'Anonymous'}</h3>
              <p className="text-gray-400">{profile.is_guest ? 'Guest Account' : profile.email}</p>
              {profile.is_guest && (
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 text-sm mt-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Guest Session
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Avatar URL (supports GIFs)
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="https://example.com/avatar.gif"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="text-gray-400 text-sm">Games Played</span>
                </div>
                <p className="text-3xl font-bold text-white">{profile.games_played}</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <span className="text-gray-400 text-sm">Win Rate</span>
                </div>
                <p className="text-3xl font-bold text-white">{winRate.toFixed(1)}%</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                  <Coins className="w-6 h-6 text-blue-500" />
                  <span className="text-gray-400 text-sm">Total Wagered</span>
                </div>
                <p className="text-3xl font-bold text-white">${profile.total_wagered.toFixed(2)}</p>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center space-x-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                  <span className="text-gray-400 text-sm">Profit/Loss</span>
                </div>
                <p className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Recent Games */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h4 className="text-xl font-semibold text-white mb-4">Recent Games</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {gameResults.length > 0 ? (
                  gameResults.map((result, index) => (
                    <div key={result.id || index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium capitalize">{result.game_type}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(result.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{result.multiplier.toFixed(2)}x</p>
                        <p className={`text-sm ${result.win_amount > result.bet_amount ? 'text-green-400' : 'text-red-400'}`}>
                          {result.win_amount > result.bet_amount ? '+' : ''}${(result.win_amount - result.bet_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">No games played yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}