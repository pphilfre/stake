import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface Profile {
  id: string
  username: string | null
  email: string | null
  avatar_url: string | null
  total_wagered: number
  total_won: number
  games_played: number
  is_guest: boolean
  created_at: string
  updated_at: string
}

interface GameResult {
  id: string
  game_type: string
  bet_amount: number
  win_amount: number
  currency: string
  multiplier: number
  created_at: string
  game_data: any
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  gameResults: GameResult[]
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  playAsGuest: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>
  recordGameResult: (gameType: string, betAmount: number, winAmount: number, currency: string, gameData?: any) => Promise<void>
  loadGameResults: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [gameResults, setGameResults] = useState<GameResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadProfile(session.user.id)
        await loadGameResults()
      } else {
        setProfile(null)
        setGameResults([])
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const newProfile = {
          id: userId,
          username: null,
          email: user?.email || null,
          avatar_url: null,
          total_wagered: 0,
          total_won: 0,
          games_played: 0,
          is_guest: false
        }

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single()

        if (!createError) {
          setProfile(createdProfile)
        }
      } else if (!error) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const loadGameResults = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error) {
        setGameResults(data || [])
      }
    } catch (error) {
      console.error('Error loading game results:', error)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })

    if (!error && data.user) {
      // Create profile
      await supabase.from('profiles').insert({
        id: data.user.id,
        username,
        email,
        is_guest: false
      })
    }

    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const playAsGuest = async () => {
    // Create a guest user
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const guestProfile: Profile = {
      id: guestId,
      username: `Guest_${Math.random().toString(36).substr(2, 6)}`,
      email: null,
      avatar_url: null,
      total_wagered: 0,
      total_won: 0,
      games_played: 0,
      is_guest: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setProfile(guestProfile)
    setUser({ id: guestId } as User)
    
    // Store guest data in localStorage
    localStorage.setItem('guestProfile', JSON.stringify(guestProfile))
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    if (profile?.is_guest) {
      // Update guest profile in localStorage
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() }
      setProfile(updatedProfile)
      localStorage.setItem('guestProfile', JSON.stringify(updatedProfile))
      return { error: null }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  const recordGameResult = async (gameType: string, betAmount: number, winAmount: number, currency: string, gameData?: any) => {
    if (!user || !profile) return

    const multiplier = betAmount > 0 ? winAmount / betAmount : 0
    const gameResult = {
      user_id: user.id,
      game_type: gameType,
      bet_amount: betAmount,
      win_amount: winAmount,
      currency,
      multiplier,
      game_data: gameData || {}
    }

    if (profile.is_guest) {
      // Store in localStorage for guests
      const guestResults = JSON.parse(localStorage.getItem('guestGameResults') || '[]')
      guestResults.unshift({ ...gameResult, id: Date.now().toString(), created_at: new Date().toISOString() })
      guestResults.splice(10) // Keep only last 10
      localStorage.setItem('guestGameResults', JSON.stringify(guestResults))
      setGameResults(guestResults)
    } else {
      // Store in Supabase for registered users
      const { error } = await supabase
        .from('game_results')
        .insert(gameResult)

      if (!error) {
        await loadGameResults()
      }
    }

    // Update profile stats
    const updatedStats = {
      total_wagered: profile.total_wagered + betAmount,
      total_won: profile.total_won + winAmount,
      games_played: profile.games_played + 1
    }

    await updateProfile(updatedStats)
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    gameResults,
    loading,
    signUp,
    signIn,
    signOut,
    playAsGuest,
    updateProfile,
    recordGameResult,
    loadGameResults
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}