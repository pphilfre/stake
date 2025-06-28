import React, { useState } from 'react'
import { X, User, Mail, Image, Save, Trophy, TrendingUp, Calendar, Coins } from 'lucide-react'
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
        className="bg-[#1a1d29] rounded-2xl p-8 w-full max-w-2xl border border-[#2d3748] shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Profile</h2>
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
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-[#2d3748] flex items-center justify-center">
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
                <User className={`w-12 h-12 text-gray-400 ${avatarUrl ? 'hidden' : ''}`} />
              </div>
              <h3 className="text-xl font-bold text-white">{profile.username || 'Anonymous'}</h3>
              <p className="text-gray-400">{profile.is_guest ? 'Guest Account' : profile.email}</p>
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
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors"
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
                  className="w-full px-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors"
                  placeholder="https://example.com/avatar.gif"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] disabled:opacity-50 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0f1419] rounded-lg p-4 border border-[#2d3748]">
                <div className="flex items-center space-x-2 mb-2">
                  <Trophy className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-gray-400 text-sm">Games Played</span>
                </div>
                <p className="text-2xl font-bold text-white">{profile.games_played}</p>
              </div>

              <div className="bg-[#0f1419] rounded-lg p-4 border border-[#2d3748]">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-gray-400 text-sm">Win Rate</span>
                </div>
                <p className="text-2xl font-bold text-white">{winRate.toFixed(1)}%</p>
              </div>

              <div className="bg-[#0f1419] rounded-lg p-4 border border-[#2d3748]">
                <div className="flex items-center space-x-2 mb-2">
                  <Coins className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-gray-400 text-sm">Total Wagered</span>
                </div>
                <p className="text-2xl font-bold text-white">${profile.total_wagered.toFixed(2)}</p>
              </div>

              <div className="bg-[#0f1419] rounded-lg p-4 border border-[#2d3748]">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#00d4aa]" />
                  <span className="text-gray-400 text-sm">Profit/Loss</span>
                </div>
                <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Recent Games */}
            <div className="bg-[#0f1419] rounded-lg p-4 border border-[#2d3748]">
              <h4 className="text-lg font-semibold text-white mb-4">Recent Games</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {gameResults.length > 0 ? (
                  gameResults.map((result, index) => (
                    <div key={result.id || index} className="flex items-center justify-between p-3 bg-[#1a1d29] rounded-lg">
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
                  <p className="text-gray-400 text-center py-4">No games played yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}