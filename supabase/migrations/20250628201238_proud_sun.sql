/*
  # Fix profiles table UUID type issue

  1. Changes
    - Drop and recreate profiles table with correct UUID type
    - Drop and recreate game_results table with correct UUID type
    - Add proper foreign key constraints
    - Enable RLS on both tables
    - Add policies for authenticated users

  2. Security
    - Enable RLS on profiles table
    - Enable RLS on game_results table
    - Add policies for users to access their own data
*/

-- Drop existing tables if they exist
DROP TABLE IF EXISTS game_results;
DROP TABLE IF EXISTS profiles;

-- Create profiles table with correct UUID type
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text,
  email text,
  avatar_url text,
  total_wagered numeric DEFAULT 0,
  total_won numeric DEFAULT 0,
  games_played integer DEFAULT 0,
  is_guest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_results table with correct UUID type
CREATE TABLE game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  bet_amount numeric NOT NULL,
  win_amount numeric NOT NULL,
  currency text NOT NULL,
  multiplier numeric NOT NULL,
  game_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for game_results
CREATE POLICY "Users can view own game results"
  ON game_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own game results"
  ON game_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_game_results_user_id ON game_results(user_id);
CREATE INDEX idx_game_results_created_at ON game_results(created_at DESC);