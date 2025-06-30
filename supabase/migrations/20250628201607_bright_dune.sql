/*
  # Fix profiles table UUID type and authentication issues

  1. Tables
    - Drop and recreate profiles table with correct UUID type
    - Drop and recreate game_results table with correct UUID type
    - Add proper foreign key constraints
    
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add policies for profile creation
    
  3. Indexes
    - Add performance indexes
    - Add unique constraints where needed
*/

-- Drop existing tables if they exist (this will remove all data)
DROP TABLE IF EXISTS game_results CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table with correct UUID type
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  email text,
  avatar_url text,
  total_wagered numeric DEFAULT 0 NOT NULL,
  total_won numeric DEFAULT 0 NOT NULL,
  games_played integer DEFAULT 0 NOT NULL,
  is_guest boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create game_results table with correct UUID type
CREATE TABLE game_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_type text NOT NULL,
  bet_amount numeric NOT NULL,
  win_amount numeric NOT NULL,
  currency text NOT NULL,
  multiplier numeric NOT NULL,
  game_data jsonb DEFAULT '{}' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
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
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_game_results_user_id ON game_results(user_id);
CREATE INDEX idx_game_results_created_at ON game_results(created_at DESC);
CREATE INDEX idx_game_results_game_type ON game_results(game_type);

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();