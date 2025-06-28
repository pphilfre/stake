import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
    // Check for guest profile in localStorage first
    const guestProfile = localStorage.getItem('guestProfile')
    if (guestProfile) {
      try {
        const parsedProfile = JSON.parse(guestProfile)
        setProfile(parsedProfile)
        setUser({ id: parsedProfile.id } as User)
        
        // Load guest game results
        const guestResults = JSON.parse(localStorage.getItem('guestGameResults') || '[]')
        setGameResults(guestResults)
        setLoading(false)
        return
      } catch (error) {
        console.error('Error parsing guest profile:', error)
        localStorage.removeItem('guestProfile')
        localStorage.removeItem('guestGameResults')
      }
    }

    // Only try Supabase if it's configured
    if (!isSupabaseConfigured) {
      console.log('Supabase not configured, running in demo mode')
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error)
        setLoading(false)
        return
      }
      
      console.log('Initial session:', session?.user?.id)
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
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
    if (!isSupabaseConfigured) return

    try {
      console.log('Loading profile for user:', userId)
      
      // First try to get existing profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle() // Use maybeSingle instead of single to avoid errors when no rows

      if (!data && !error) {
        // Profile doesn't exist, create one
        console.log('Profile not found, creating new profile')
        const newProfile = {
          id: userId, // This is now a UUID string from Supabase Auth
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

        if (!createError && createdProfile) {
          console.log('Profile created successfully:', createdProfile)
          setProfile(createdProfile)
        } else {
          console.error('Error creating profile:', createError)
          // If profile creation fails due to duplicate, try to fetch again
          if (createError?.code === '23505') {
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single()
            
            if (existingProfile) {
              console.log('Found existing profile after duplicate error:', existingProfile)
              setProfile(existingProfile)
            }
          }
        }
      } else if (!error && data) {
        console.log('Profile loaded successfully:', data)
        setProfile(data)
      } else if (error) {
        console.error('Error loading profile:', error)
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
    }
  }

  const loadGameResults = async () => {
    if (!user || !isSupabaseConfigured) return

    try {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        console.log('Game results loaded:', data.length)
        setGameResults(data)
      } else if (error) {
        console.error('Error loading game results:', error)
      }
    } catch (error) {
      console.error('Error in loadGameResults:', error)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Playing as guest instead.') }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })

      if (error) {
        console.error('Signup error:', error)
        return { error }
      }

      if (data.user) {
        console.log('User created successfully:', data.user.id)
        // Profile will be created automatically when auth state changes
      }

      return { error: null }
    } catch (error) {
      console.error('Signup error:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured. Playing as guest instead.') }
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Signin error:', error)
      }
      
      return { error }
    } catch (error) {
      console.error('Signin error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    // Clear guest data
    localStorage.removeItem('guestProfile')
    localStorage.removeItem('guestGameResults')
    
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    } else {
      // Manual cleanup for guest mode
      setUser(null)
      setProfile(null)
      setGameResults([])
      setSession(null)
    }
  }

  const playAsGuest = async () => {
    // Clear any existing auth
    if (isSupabaseConfigured) {
      await supabase.auth.signOut()
    }

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
    setGameResults([])
    
    // Store guest data in localStorage
    localStorage.setItem('guestProfile', JSON.stringify(guestProfile))
    console.log('Playing as guest:', guestProfile.username)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    if (profile?.is_guest) {
      // Update guest profile in localStorage
      const updatedProfile = { ...profile, ...updates, updated_at: new Date().toISOString() }
      setProfile(updatedProfile)
      localStorage.setItem('guestProfile', JSON.stringify(updatedProfile))
      console.log('Guest profile updated:', updatedProfile)
      return { error: null }
    }

    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase not configured') }
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      if (!error) {
        setProfile(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null)
        console.log('Profile updated successfully')
      } else {
        console.error('Profile update error:', error)
      }

      return { error }
    } catch (error) {
      console.error('Profile update error:', error)
      return { error }
    }
  }

  const recordGameResult = async (gameType: string, betAmount: number, winAmount: number, currency: string, gameData?: any) => {
    if (!user || !profile) {
      console.log('No user or profile, skipping game result recording')
      return
    }

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

    console.log('Recording game result:', gameResult)

    if (profile.is_guest) {
      // Store in localStorage for guests
      const guestResults = JSON.parse(localStorage.getItem('guestGameResults') || '[]')
      const newResult = { 
        ...gameResult, 
        id: Date.now().toString(), 
        created_at: new Date().toISOString() 
      }
      guestResults.unshift(newResult)
      guestResults.splice(10) // Keep only last 10
      localStorage.setItem('guestGameResults', JSON.stringify(guestResults))
      setGameResults(guestResults)
      console.log('Guest game result recorded')
    } else if (isSupabaseConfigured) {
      // Store in Supabase for registered users
      try {
        const { error } = await supabase
          .from('game_results')
          .insert(gameResult)

        if (!error) {
          console.log('Game result recorded in Supabase')
          await loadGameResults()
        } else {
          console.error('Error recording game result:', error)
        }
      } catch (error) {
        console.error('Error recording game result:', error)
      }
    }

    // Update profile stats
    const updatedStats = {
      total_wagered: profile.total_wagered + betAmount,
      total_won: profile.total_won + winAmount,
      games_played: profile.games_played + 1
    }

    console.log('Updating profile stats:', updatedStats)
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