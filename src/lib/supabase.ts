import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          total_wagered: number
          total_won: number
          games_played: number
          is_guest: boolean
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          total_wagered?: number
          total_won?: number
          games_played?: number
          is_guest?: boolean
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          total_wagered?: number
          total_won?: number
          games_played?: number
          is_guest?: boolean
        }
      }
      game_results: {
        Row: {
          id: string
          user_id: string
          game_type: string
          bet_amount: number
          win_amount: number
          currency: string
          multiplier: number
          created_at: string
          game_data: any
        }
        Insert: {
          id?: string
          user_id: string
          game_type: string
          bet_amount: number
          win_amount: number
          currency: string
          multiplier: number
          created_at?: string
          game_data?: any
        }
        Update: {
          id?: string
          user_id?: string
          game_type?: string
          bet_amount?: number
          win_amount?: number
          currency?: string
          multiplier?: number
          created_at?: string
          game_data?: any
        }
      }
    }
  }
}