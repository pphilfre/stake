import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  league: string;
  homeOdds: number;
  awayOdds: number;
  isLive: boolean;
}

export const LiveBetting: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);

  useEffect(() => {
    // Simulate live matches
    const mockMatches: LiveMatch[] = [
      {
        id: 'live1',
        homeTeam: 'Barcelona',
        awayTeam: 'Real Madrid',
        homeScore: 1,
        awayScore: 2,
        minute: 67,
        league: 'La Liga',
        homeOdds: 3.2,
        awayOdds: 1.8,
        isLive: true,
      },
      {
        id: 'live2',
        homeTeam: 'Arsenal',
        awayTeam: 'Chelsea',
        homeScore: 0,
        awayScore: 1,
        minute: 34,
        league: 'Premier League',
        homeOdds: 2.4,
        awayOdds: 2.1,
        isLive: true,
      },
    ];

    setLiveMatches(mockMatches);

    // Simulate live updates
    const interval = setInterval(() => {
      setLiveMatches(prev => prev.map(match => ({
        ...match,
        minute: Math.min(match.minute + Math.floor(Math.random() * 3), 90),
        homeOdds: match.homeOdds + (Math.random() - 0.5) * 0.2,
        awayOdds: match.awayOdds + (Math.random() - 0.5) * 0.2,
        homeScore: Math.random() < 0.02 ? match.homeScore + 1 : match.homeScore,
        awayScore: Math.random() < 0.02 ? match.awayScore + 1 : match.awayScore,
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span>Live Betting</span>
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {liveMatches.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-red-600/30"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-semibold">LIVE</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{match.league}</span>
              </div>
              <div className="flex items-center space-x-2 text-white">
                <Clock className="w-4 h-4" />
                <span>{match.minute}'</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center mb-4">
              <div className="text-center">
                <div className="font-semibold text-white mb-1">{match.homeTeam}</div>
                <div className="text-2xl font-bold text-white">{match.homeScore}</div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-400 text-sm">VS</div>
              </div>
              
              <div className="text-center">
                <div className="font-semibold text-white mb-1">{match.awayTeam}</div>
                <div className="text-2xl font-bold text-white">{match.awayScore}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors text-center">
                <div className="text-white font-medium">{match.homeTeam}</div>
                <div className="text-yellow-400 font-bold">{match.homeOdds.toFixed(2)}</div>
              </button>
              <button className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-colors text-center">
                <div className="text-white font-medium">{match.awayTeam}</div>
                <div className="text-yellow-400 font-bold">{match.awayOdds.toFixed(2)}</div>
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};