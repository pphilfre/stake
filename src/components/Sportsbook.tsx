import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { LiveBetting } from './sports/LiveBetting';
import { BetSlip } from './sports/BetSlip';

interface Match {
  id: string;
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  isLive: boolean;
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  featured: boolean;
}

export const Sportsbook: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [betSlip, setBetSlip] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    // Simulate live odds updates
    const mockMatches: Match[] = [
      {
        id: '1',
        sport: 'soccer',
        league: 'Premier League',
        homeTeam: 'Manchester City',
        awayTeam: 'Liverpool',
        startTime: '2024-01-15T15:00:00Z',
        isLive: true,
        homeOdds: 2.10,
        awayOdds: 3.20,
        drawOdds: 3.50,
        featured: true,
      },
      {
        id: '2',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        startTime: '2024-01-15T20:00:00Z',
        isLive: false,
        homeOdds: 1.85,
        awayOdds: 2.00,
        featured: true,
      },
      {
        id: '3',
        sport: 'soccer',
        league: 'La Liga',
        homeTeam: 'Real Madrid',
        awayTeam: 'Barcelona',
        startTime: '2024-01-16T18:00:00Z',
        isLive: false,
        homeOdds: 2.40,
        awayOdds: 2.80,
        drawOdds: 3.30,
        featured: true,
      },
    ];

    setMatches(mockMatches);

    // Simulate live odds updates
    const interval = setInterval(() => {
      setMatches(prev => prev.map(match => ({
        ...match,
        homeOdds: match.homeOdds + (Math.random() - 0.5) * 0.1,
        awayOdds: match.awayOdds + (Math.random() - 0.5) * 0.1,
        drawOdds: match.drawOdds ? match.drawOdds + (Math.random() - 0.5) * 0.1 : undefined,
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const sports = [
    { id: 'all', name: 'All Sports', icon: TrendingUp },
    { id: 'soccer', name: 'Soccer', icon: TrendingUp },
    { id: 'basketball', name: 'Basketball', icon: TrendingUp },
    { id: 'tennis', name: 'Tennis', icon: TrendingUp },
    { id: 'esports', name: 'Esports', icon: TrendingUp },
  ];

  const filteredMatches = selectedSport === 'all' 
    ? matches 
    : matches.filter(match => match.sport === selectedSport);

  const addToBetSlip = (match: Match, type: 'home' | 'away' | 'draw', odds: number) => {
    const bet = {
      id: `${match.id}-${type}`,
      matchId: match.id,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      type,
      odds,
      stake: 0,
    };

    setBetSlip(prev => {
      const existing = prev.find(b => b.id === bet.id);
      if (existing) return prev;
      return [...prev, bet];
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Sportsbook
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Bet on your favorite sports with competitive odds and instant payouts.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Sports Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {sports.map((sport) => {
                const Icon = sport.icon;
                return (
                  <button
                    key={sport.id}
                    onClick={() => setSelectedSport(sport.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      selectedSport === sport.id
                        ? 'bg-yellow-400 text-black'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{sport.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Betting */}
            <LiveBetting />

            {/* Featured Matches */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-400" />
                <span>Featured Matches</span>
              </h2>
              <div className="space-y-4">
                {filteredMatches.filter(match => match.featured).map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-400">
                          {match.league}
                        </div>
                        {match.isLive && (
                          <div className="flex items-center space-x-1 text-red-400">
                            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold">LIVE</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(match.startTime).toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => addToBetSlip(match, 'home', match.homeOdds)}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors text-center"
                      >
                        <div className="font-semibold text-white mb-1">{match.homeTeam}</div>
                        <div className="text-yellow-400 font-bold">{match.homeOdds.toFixed(2)}</div>
                      </button>

                      {match.drawOdds && (
                        <button
                          onClick={() => addToBetSlip(match, 'draw', match.drawOdds!)}
                          className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors text-center"
                        >
                          <div className="font-semibold text-white mb-1">Draw</div>
                          <div className="text-yellow-400 font-bold">{match.drawOdds.toFixed(2)}</div>
                        </button>
                      )}

                      <button
                        onClick={() => addToBetSlip(match, 'away', match.awayOdds)}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-colors text-center"
                      >
                        <div className="font-semibold text-white mb-1">{match.awayTeam}</div>
                        <div className="text-yellow-400 font-bold">{match.awayOdds.toFixed(2)}</div>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="w-full lg:w-80">
            <BetSlip bets={betSlip} setBets={setBetSlip} />
          </div>
        </div>
      </div>
    </div>
  );
};