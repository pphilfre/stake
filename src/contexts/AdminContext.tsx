import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameSettings {
  winRate: number;
  minBet: number;
  maxBet: number;
  houseEdge: number;
  maxPayout: number;
  enabled: boolean;
}

interface AdminContextType {
  isAdminAuthenticated: boolean;
  authenticateAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  gameSettings: Record<string, GameSettings>;
  updateGameSettings: (gameId: string, settings: Partial<GameSettings>) => void;
  resetGameSettings: (gameId: string) => void;
}

const defaultGameSettings: GameSettings = {
  winRate: 50,
  minBet: 1,
  maxBet: 1000,
  houseEdge: 2.5,
  maxPayout: 10000,
  enabled: true,
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_PIN = '1234'; // In production, this should be environment variable

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [gameSettings, setGameSettings] = useState<Record<string, GameSettings>>({
    dice: { ...defaultGameSettings },
    blackjack: { ...defaultGameSettings, winRate: 48 },
    roulette: { ...defaultGameSettings, winRate: 47.4 },
    mines: { ...defaultGameSettings, winRate: 45 },
    plinko: { ...defaultGameSettings, winRate: 49 },
  });

  const authenticateAdmin = (pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
  };

  const updateGameSettings = (gameId: string, settings: Partial<GameSettings>) => {
    setGameSettings(prev => ({
      ...prev,
      [gameId]: { ...prev[gameId], ...settings }
    }));
  };

  const resetGameSettings = (gameId: string) => {
    setGameSettings(prev => ({
      ...prev,
      [gameId]: { ...defaultGameSettings }
    }));
  };

  return (
    <AdminContext.Provider value={{
      isAdminAuthenticated,
      authenticateAdmin,
      logoutAdmin,
      gameSettings,
      updateGameSettings,
      resetGameSettings,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
