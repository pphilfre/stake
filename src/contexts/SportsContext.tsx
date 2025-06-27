import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sportsApi, Match, BettingMarket, LiveStats, Player } from '../services/sportsApi';

interface BetSlipItem {
  id: string;
  matchId: string;
  matchName: string;
  marketName: string;
  optionName: string;
  odds: number;
  stake: number;
  potentialWin: number;
  type: 'single' | 'combo';
}

interface SportsContextValue {
  // Matches
  matches: Match[];
  liveMatches: Match[];
  featuredMatches: Match[];
  loadingMatches: boolean;
  
  // API Status
  usingMockData: boolean;
  apiStatus: 'online' | 'offline' | 'unknown';
  
  // Betting Markets
  bettingMarkets: { [matchId: string]: BettingMarket[] };
  loadingMarkets: { [matchId: string]: boolean };
  
  // Live Stats
  liveStats: { [matchId: string]: LiveStats };
  
  // Bet Slip
  betSlip: BetSlipItem[];
  totalStake: number;
  totalPotentialWin: number;
  
  // Players
  teamPlayers: { [teamId: string]: Player[] };
  
  // Actions
  loadMatches: (sport?: string) => Promise<void>;
  loadBettingMarkets: (matchId: string, sport: string) => Promise<void>;
  loadTeamPlayers: (teamId: string, sport: string) => Promise<void>;
  addToBetSlip: (item: Omit<BetSlipItem, 'id' | 'stake' | 'potentialWin' | 'type'>) => void;
  removeFromBetSlip: (id: string) => void;
  updateStake: (id: string, stake: number) => void;
  clearBetSlip: () => void;
  placeBet: () => Promise<boolean>;
  
  // Live updates
  subscribeToMatch: (matchId: string) => () => void;
}

const SportsContext = createContext<SportsContextValue | undefined>(undefined);

export const useSports = () => {
  const context = useContext(SportsContext);
  if (!context) {
    throw new Error('useSports must be used within a SportsProvider');
  }
  return context;
};

interface SportsProviderProps {
  children: React.ReactNode;
}

export const SportsProvider: React.FC<SportsProviderProps> = ({ children }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [bettingMarkets, setBettingMarkets] = useState<{ [matchId: string]: BettingMarket[] }>({});
  const [liveStats, setLiveStats] = useState<{ [matchId: string]: LiveStats }>({});
  const [betSlip, setBetSlip] = useState<BetSlipItem[]>([]);
  const [teamPlayers, setTeamPlayers] = useState<{ [teamId: string]: Player[] }>({});
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingMarkets, setLoadingMarkets] = useState<{ [matchId: string]: boolean }>({});
  const [liveSubscriptions, setLiveSubscriptions] = useState<{ [matchId: string]: () => void }>({});
  const [usingMockData, setUsingMockData] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'unknown'>('unknown');

  // Computed values
  const liveMatches = matches.filter(match => match.status === 'live');
  const featuredMatches = matches.filter(match => match.featured);
  const totalStake = betSlip.reduce((sum, item) => sum + item.stake, 0);
  const totalPotentialWin = betSlip.reduce((sum, item) => sum + item.potentialWin, 0);

  // Load matches
  const loadMatches = useCallback(async (sport?: string) => {
    setLoadingMatches(true);
    setApiStatus('unknown');
    try {
      const fetchedMatches = await sportsApi.getMatches(sport);
      setMatches(fetchedMatches);
      
      // Check if we got mock data by looking at match IDs (mock data has simple numeric IDs)
      const hasMockData = fetchedMatches.some(match => 
        /^\d+$/.test(match.id) && parseInt(match.id) < 10
      );
      
      if (hasMockData && fetchedMatches.length > 0) {
        setUsingMockData(true);
        setApiStatus('offline');
        console.log('Using mock sports data due to API issues');
      } else if (fetchedMatches.length > 0) {
        setUsingMockData(false);
        setApiStatus('online');
      } else {
        setUsingMockData(true);
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
      setUsingMockData(true);
      setApiStatus('offline');
    } finally {
      setLoadingMatches(false);
    }
  }, []);

  // Load betting markets for a match
  const loadBettingMarkets = useCallback(async (matchId: string, sport: string) => {
    setLoadingMarkets(prev => ({ ...prev, [matchId]: true }));
    try {
      const markets = await sportsApi.getBettingMarkets(matchId, sport);
      setBettingMarkets(prev => ({ ...prev, [matchId]: markets }));
    } catch (error) {
      console.error('Failed to load betting markets:', error);
    } finally {
      setLoadingMarkets(prev => ({ ...prev, [matchId]: false }));
    }
  }, []);

  // Load team players
  const loadTeamPlayers = useCallback(async (teamId: string, sport: string) => {
    try {
      const players = await sportsApi.getTeamPlayers(teamId, sport);
      setTeamPlayers(prev => ({ ...prev, [teamId]: players }));
    } catch (error) {
      console.error('Failed to load team players:', error);
    }
  }, []);

  // Subscribe to live match updates
  const subscribeToMatch = useCallback((matchId: string) => {
    // Unsubscribe if already subscribed
    if (liveSubscriptions[matchId]) {
      liveSubscriptions[matchId]();
    }

    const unsubscribe = sportsApi.subscribeToLiveUpdates(matchId, (data) => {
      if (data.markets) {
        setBettingMarkets(prev => ({ ...prev, [matchId]: data.markets }));
      }
      if (data.stats) {
        setLiveStats(prev => ({ ...prev, [matchId]: data.stats }));
      }
    });

    setLiveSubscriptions(prev => ({ ...prev, [matchId]: unsubscribe }));

    return () => {
      unsubscribe();
      setLiveSubscriptions(prev => {
        const newSubs = { ...prev };
        delete newSubs[matchId];
        return newSubs;
      });
    };
  }, [liveSubscriptions]);

  // Bet slip management
  const addToBetSlip = useCallback((item: Omit<BetSlipItem, 'id' | 'stake' | 'potentialWin' | 'type'>) => {
    const newItem: BetSlipItem = {
      ...item,
      id: `${item.matchId}-${item.optionName}-${Date.now()}`,
      stake: 10, // Default stake
      potentialWin: 10 * item.odds,
      type: 'single'
    };

    setBetSlip(prev => {
      // Remove existing bet on same market if exists
      const filtered = prev.filter(bet => 
        !(bet.matchId === item.matchId && bet.marketName === item.marketName)
      );
      return [...filtered, newItem];
    });
  }, []);

  const removeFromBetSlip = useCallback((id: string) => {
    setBetSlip(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateStake = useCallback((id: string, stake: number) => {
    setBetSlip(prev => prev.map(item => 
      item.id === id 
        ? { ...item, stake, potentialWin: stake * item.odds }
        : item
    ));
  }, []);

  const clearBetSlip = useCallback(() => {
    setBetSlip([]);
  }, []);

  const placeBet = useCallback(async (): Promise<boolean> => {
    try {
      // In a real app, this would call an API to place the bet
      console.log('Placing bet:', betSlip);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear bet slip after successful bet
      clearBetSlip();
      
      return true;
    } catch (error) {
      console.error('Failed to place bet:', error);
      return false;
    }
  }, [betSlip, clearBetSlip]);

  // Initial load
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Auto-refresh matches every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadMatches();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadMatches]);

  // Cleanup subscriptions on unmount
  useEffect(() => {
    return () => {
      Object.values(liveSubscriptions).forEach(unsubscribe => unsubscribe());
    };
  }, [liveSubscriptions]);

  const value: SportsContextValue = {
    matches,
    liveMatches,
    featuredMatches,
    loadingMatches,
    usingMockData,
    apiStatus,
    bettingMarkets,
    loadingMarkets,
    liveStats,
    betSlip,
    totalStake,
    totalPotentialWin,
    teamPlayers,
    loadMatches,
    loadBettingMarkets,
    loadTeamPlayers,
    addToBetSlip,
    removeFromBetSlip,
    updateStake,
    clearBetSlip,
    placeBet,
    subscribeToMatch
  };

  return (
    <SportsContext.Provider value={value}>
      {children}
    </SportsContext.Provider>
  );
};
