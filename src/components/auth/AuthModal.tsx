import React, { useState } from 'react'
import { X, Mail, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'guest'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp, playAsGuest } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, username)
        if (error) throw error
      } else if (mode === 'guest') {
        await playAsGuest()
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestPlay = async () => {
    setLoading(true)
    try {
      await playAsGuest()
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-[#1a1d29] rounded-2xl p-8 w-full max-w-md border border-[#2d3748] shadow-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Play as Guest'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex space-x-1 mb-8 bg-[#0f1419] rounded-lg p-1">
          <button
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'signin'
                ? 'bg-[#00d4aa] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              mode === 'signup'
                ? 'bg-[#00d4aa] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>
          )}

          {mode !== 'guest' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-[#0f1419] border border-[#2d3748] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00d4aa] transition-colors"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00d4aa] to-[#00b894] hover:from-[#00b894] hover:to-[#00a085] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>
                {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Play as Guest'}
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#2d3748]">
          <button
            onClick={handleGuestPlay}
            disabled={loading}
            className="w-full bg-[#2d3748] hover:bg-[#4a5568] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <User className="w-5 h-5" />
            <span>Continue as Guest</span>
          </button>
          <p className="text-gray-400 text-xs text-center mt-3">
            Guest accounts don't save progress permanently
          </p>
        </div>
      </motion.div>
    </div>
  )
}