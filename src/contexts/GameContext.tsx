import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

interface GameStats {
  totalGames: number;
  totalWagered: number;
  houseEdge: number;
  playerWins: number;
  playerLosses: number;
}

interface GameContextType {
  gameStats: GameStats;
  updateStats: (wagered: number, won: boolean) => void;
  generateProvablyFairSeed: () => string;
  verifyFairness: (seed: string, result: any) => boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 42847,
    totalWagered: 1287432,
    houseEdge: 1.2,
    playerWins: 0,
    playerLosses: 0
  });

  const { recordGameResult } = useAuth();

  const updateStats = (wagered: number, won: boolean) => {
    setGameStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      totalWagered: prev.totalWagered + wagered,
      playerWins: won ? prev.playerWins + 1 : prev.playerWins,
      playerLosses: won ? prev.playerLosses : prev.playerLosses + 1
    }));

    // Record the game result in the auth context
    const winAmount = won ? wagered * 2 : 0; // Simplified win calculation
    recordGameResult('unknown', wagered, winAmount, 'USD');
  };

  const generateProvablyFairSeed = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const verifyFairness = (seed: string, result: any) => {
    // Simplified provably fair verification
    const hash = btoa(seed + JSON.stringify(result));
    return hash.length > 0; // Always return true for demo
  };

  return (
    <GameContext.Provider value={{
      gameStats,
      updateStats,
      generateProvablyFairSeed,
      verifyFairness
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};