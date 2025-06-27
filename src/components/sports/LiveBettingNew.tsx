import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, Minus, Activity, Play, Users, Target, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSports } from '../../contexts/SportsContext';
import { Match, BettingMarket } from '../../services/sportsApi';

interface LiveBettingProps {
  selectedSport?: string;
}

export const LiveBetting: React.FC<LiveBettingProps> = ({ selectedSport = 'all' }) => {
  const {
    liveMatches,
    bettingMarkets,
    liveStats,
    addToBetSlip,
    loadBettingMarkets,
    subscribeToMatch,
    usingMockData
  } = useSports();

  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'main' | 'goals' | 'players' | 'specials'>('main');

  const filteredMatches = liveMatches.filter(match => 
    selectedSport === 'all' || match.sport === selectedSport
  );

  useEffect(() => {
    // Subscribe to live updates for all live matches
    const unsubscribes = filteredMatches.map(match => {
      loadBettingMarkets(match.id, match.sport);
      return subscribeToMatch(match.id);
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  }, [filteredMatches, loadBettingMarkets, subscribeToMatch]);

  const getMatchTime = (match: Match) => {
    if (match.minute) {
      return `${match.minute}'`;
    }
    if (match.period) {
      return match.period;
    }
    return 'LIVE';
  };

  const getOddsTrend = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-400" />;
      default:
        return <Minus className="w-3 h-3 text-gray-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'main':
        return <Target className="w-4 h-4" />;
      case 'goals':
        return <Activity className="w-4 h-4" />;
      case 'players':
        return <Users className="w-4 h-4" />;
      case 'specials':
        return <Award className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const handleBetClick = (match: Match, market: BettingMarket, optionId: string) => {
    const option = market.options.find(opt => opt.id === optionId);
    if (!option || !option.isAvailable) return;

    addToBetSlip({
      matchId: match.id,
      matchName: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
      marketName: market.name,
      optionName: option.name,
      odds: option.odds
    });
  };

  const renderLiveStats = (matchId: string) => {
    const stats = liveStats[matchId];
    if (!stats) return null;

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-slate-800/50 rounded-lg p-4 mt-4"
      >
        <h4 className="text-white font-medium mb-3">Live Statistics</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Possession</span>
              <span className="text-white">{stats.possession.home}% - {stats.possession.away}%</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Shots</span>
              <span className="text-white">{stats.shots.home} - {stats.shots.away}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Shots on Target</span>
              <span className="text-white">{stats.shotsOnTarget.home} - {stats.shotsOnTarget.away}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Corners</span>
              <span className="text-white">{stats.corners.home} - {stats.corners.away}</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Fouls</span>
              <span className="text-white">{stats.fouls.home} - {stats.fouls.away}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Yellow Cards</span>
              <span className="text-white">{stats.yellowCards.home} - {stats.yellowCards.away}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Red Cards</span>
              <span className="text-white">{stats.redCards.home} - {stats.redCards.away}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Offsides</span>
              <span className="text-white">{stats.offsides.home} - {stats.offsides.away}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderBettingMarkets = (match: Match) => {
    const markets = bettingMarkets[match.id] || [];
    const filteredMarkets = markets.filter(market => market.category === selectedCategory);

    return (
      <div className="space-y-4">
        {filteredMarkets.map(market => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">{market.name}</h4>
              {market.isLive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 text-xs">LIVE</span>
                </div>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-3">{market.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {market.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => handleBetClick(match, market, option.id)}
                  disabled={!option.isAvailable}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    option.isAvailable
                      ? 'bg-slate-700/50 border-slate-600 hover:border-yellow-400 hover:bg-yellow-400/10'
                      : 'bg-slate-800/30 border-slate-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-medium">{option.name}</span>
                    <div className="flex items-center space-x-1">
                      {getOddsTrend(option.trend)}
                      <span className="text-yellow-400 font-bold">{option.odds.toFixed(2)}</span>
                    </div>
                  </div>
                  {option.line && (
                    <div className="text-gray-400 text-xs mt-1">Line: {option.line}</div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (filteredMatches.length === 0) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Live Matches</h3>
        <p className="text-gray-400">Check back later for live betting opportunities</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Banner for Live Betting */}
      {usingMockData && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <div>
              <p className="text-red-200 font-medium">Live Demo Mode</p>
              <p className="text-red-300/80 text-sm">
                Showing simulated live matches with mock odds. Real implementation would connect to live sports feeds.
              </p>
            </div>
          </div>
        </motion.div>
      )}
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span>Live Betting</span>
          <span className="text-gray-400 text-lg">({filteredMatches.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredMatches.map((match) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-red-600/20 to-orange-600/20 backdrop-blur-sm rounded-xl border border-red-600/30"
          >
            {/* Match Header */}
            <div className="p-6 border-b border-red-600/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-400 font-semibold">LIVE</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-400">{match.league}</span>
                </div>
                <div className="flex items-center space-x-2 text-white">
                  <Clock className="w-4 h-4" />
                  <span>{getMatchTime(match)}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="font-semibold text-white mb-1">{match.homeTeam.shortName}</div>
                  <div className="text-2xl font-bold text-white">{match.homeScore || 0}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-gray-400 text-sm">VS</div>
                </div>
                
                <div className="text-center">
                  <div className="font-semibold text-white mb-1">{match.awayTeam.shortName}</div>
                  <div className="text-2xl font-bold text-white">{match.awayScore || 0}</div>
                </div>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/30 hover:bg-red-600/50 rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">
                    {selectedMatch === match.id ? 'Hide Markets' : 'View Markets'}
                  </span>
                </button>
              </div>
            </div>

            {/* Betting Markets */}
            <AnimatePresence>
              {selectedMatch === match.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6"
                >
                  {/* Category Tabs */}
                  <div className="flex space-x-2 mb-6 overflow-x-auto">
                    {['main', 'goals', 'players', 'specials'].map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category as any)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                          selectedCategory === category
                            ? 'bg-yellow-400 text-black'
                            : 'bg-slate-700 text-white hover:bg-slate-600'
                        }`}
                      >
                        {getCategoryIcon(category)}
                        <span className="capitalize font-medium">{category}</span>
                      </button>
                    ))}
                  </div>

                  {/* Markets */}
                  {renderBettingMarkets(match)}

                  {/* Live Stats */}
                  {match.sport === 'soccer' && renderLiveStats(match.id)}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
