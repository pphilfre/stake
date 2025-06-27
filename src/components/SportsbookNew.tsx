import React, { useState } from 'react';
import { TrendingUp, Clock, Star, Filter, Search, Calendar, MapPin, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LiveBetting } from './sports/LiveBettingNew';
import { BetSlip } from './sports/BetSlipNew';
import { useSports } from '../contexts/SportsContext';
import { Match } from '../services/sportsApi';

const SPORTS = [
  { id: 'all', name: 'All Sports', icon: '⚽' },
  { id: 'soccer', name: 'Soccer', icon: '⚽' },
  { id: 'basketball', name: 'Basketball', icon: '🏀' },
  { id: 'american_football', name: 'American Football', icon: '🏈' },
  { id: 'tennis', name: 'Tennis', icon: '🎾' },
  { id: 'baseball', name: 'Baseball', icon: '⚾' },
  { id: 'hockey', name: 'Hockey', icon: '🏒' }
];

const TIME_FILTERS = [
  { id: 'all', name: 'All Time' },
  { id: 'today', name: 'Today' },
  { id: 'tomorrow', name: 'Tomorrow' },
  { id: 'week', name: 'This Week' }
];

export const Sportsbook: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const {
    matches,
    featuredMatches,
    loadingMatches,
    bettingMarkets,
    loadBettingMarkets,
    addToBetSlip,
    usingMockData,
    apiStatus
  } = useSports();

  // Filter matches based on selected criteria
  const filteredMatches = matches.filter(match => {
    // Sport filter
    if (selectedSport !== 'all' && match.sport !== selectedSport) return false;
    
    // Search filter
    if (searchQuery && !match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !match.league.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Time filter
    if (selectedTimeFilter !== 'all') {
      const matchDate = new Date(match.startTime);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      switch (selectedTimeFilter) {
        case 'today':
          if (matchDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'tomorrow':
          if (matchDate.toDateString() !== tomorrow.toDateString()) return false;
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (matchDate > weekFromNow) return false;
          break;
      }
    }
    
    return true;
  });

  const upcomingMatches = filteredMatches.filter(match => match.status === 'scheduled');
  const liveMatches = filteredMatches.filter(match => match.status === 'live');

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatus = (match: Match) => {
    switch (match.status) {
      case 'live':
        return (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-semibold text-xs">LIVE</span>
          </div>
        );
      case 'finished':
        return <span className="text-gray-400 text-xs">FT</span>;
      case 'postponed':
        return <span className="text-yellow-400 text-xs">POSTPONED</span>;
      default:
        return <span className="text-gray-400 text-xs">{formatMatchTime(match.startTime)}</span>;
    }
  };

  const handleQuickBet = (match: Match, marketType: 'home' | 'draw' | 'away', odds: number) => {
    let optionName = '';
    switch (marketType) {
      case 'home':
        optionName = `${match.homeTeam.shortName} Win`;
        break;
      case 'draw':
        optionName = 'Draw';
        break;
      case 'away':
        optionName = `${match.awayTeam.shortName} Win`;
        break;
    }

    addToBetSlip({
      matchId: match.id,
      matchName: `${match.homeTeam.shortName} vs ${match.awayTeam.shortName}`,
      marketName: 'Match Winner',
      optionName,
      odds
    });
  };

  const renderMatchCard = (match: Match, isFeatured = false) => {
    const markets = bettingMarkets[match.id] || [];
    const mainMarket = markets.find(m => m.type === 'match_winner');
    
    return (
      <motion.div
        key={match.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-6 border transition-all duration-300 hover:border-yellow-400/50 ${
          isFeatured 
            ? 'bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border-yellow-400/30'
            : 'bg-white/5 border-white/10'
        }`}
      >
        {/* Match Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {isFeatured && <Star className="w-4 h-4 text-yellow-400" />}
            <span className="text-gray-400 text-sm">{match.league}</span>
            {match.venue && <MapPin className="w-3 h-3 text-gray-500" />}
          </div>
          {getMatchStatus(match)}
        </div>

        {/* Teams */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {match.homeTeam.shortName.substring(0, 3)}
                </span>
              </div>
              <span className="text-white font-medium">{match.homeTeam.name}</span>
            </div>
            {match.status === 'live' && (
              <span className="text-2xl font-bold text-white">{match.homeScore}</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {match.awayTeam.shortName.substring(0, 3)}
                </span>
              </div>
              <span className="text-white font-medium">{match.awayTeam.name}</span>
            </div>
            {match.status === 'live' && (
              <span className="text-2xl font-bold text-white">{match.awayScore}</span>
            )}
          </div>
        </div>

        {/* Quick Bet Options */}
        {mainMarket && (
          <div className="grid grid-cols-3 gap-2">
            {mainMarket.options.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleQuickBet(match, 
                  index === 0 ? 'home' : index === 1 ? 'draw' : 'away', 
                  option.odds
                )}
                disabled={!option.isAvailable}
                className={`p-3 rounded-lg border transition-all ${
                  option.isAvailable
                    ? 'bg-slate-700/50 border-slate-600 hover:border-yellow-400 hover:bg-yellow-400/10'
                    : 'bg-slate-800/30 border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <div className="text-white text-xs font-medium mb-1">
                    {index === 1 ? 'Draw' : index === 0 ? 'Home' : 'Away'}
                  </div>
                  <div className="text-yellow-400 font-bold">
                    {option.odds.toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* View Markets Button */}
        <button
          onClick={() => loadBettingMarkets(match.id, match.sport)}
          className="w-full mt-4 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-lg py-2 text-white text-sm transition-colors"
        >
          View All Markets
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Mock Data Banner */}
        {usingMockData && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/30 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              <div>
                <p className="text-orange-200 font-medium">Demo Mode Active</p>
                <p className="text-orange-300/80 text-sm">
                  Using sample data due to API limitations. In production, this would show real matches and odds from live sports feeds.
                </p>
              </div>
            </div>
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Live Sports Betting
              </h1>
              <p className="text-gray-400 text-lg">
                Bet on live matches with real-time odds and comprehensive markets
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {/* Search */}
                <div className="relative flex-1 min-w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search teams, leagues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>

              {/* Expandable Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Sports Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sport</label>
                      <div className="flex flex-wrap gap-2">
                        {SPORTS.map(sport => (
                          <button
                            key={sport.id}
                            onClick={() => setSelectedSport(sport.id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedSport === sport.id
                                ? 'bg-yellow-400 text-black'
                                : 'bg-slate-700 text-white hover:bg-slate-600'
                            }`}
                          >
                            <span>{sport.icon}</span>
                            <span>{sport.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                      <div className="flex flex-wrap gap-2">
                        {TIME_FILTERS.map(filter => (
                          <button
                            key={filter.id}
                            onClick={() => setSelectedTimeFilter(filter.id)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              selectedTimeFilter === filter.id
                                ? 'bg-yellow-400 text-black'
                                : 'bg-slate-700 text-white hover:bg-slate-600'
                            }`}
                          >
                            <Calendar className="w-4 h-4" />
                            <span>{filter.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Live Betting Section */}
            {liveMatches.length > 0 && (
              <div>
                <LiveBetting selectedSport={selectedSport} />
              </div>
            )}

            {/* Featured Matches */}
            {featuredMatches.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <span>Featured Matches</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {featuredMatches.slice(0, 4).map(match => renderMatchCard(match, true))}
                </div>
              </div>
            )}

            {/* Upcoming Matches */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <Clock className="w-6 h-6" />
                <span>Upcoming Matches</span>
                <span className="text-gray-400 text-lg">({upcomingMatches.length})</span>
              </h2>

              {loadingMatches ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-8 bg-gray-700 rounded"></div>
                        <div className="h-8 bg-gray-700 rounded"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="h-12 bg-gray-700 rounded"></div>
                        <div className="h-12 bg-gray-700 rounded"></div>
                        <div className="h-12 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : upcomingMatches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingMatches.map(match => renderMatchCard(match))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Matches</h3>
                  <p className="text-gray-400">Check back later or try different filters</p>
                </div>
              )}
            </div>
          </div>

          {/* Bet Slip Sidebar */}
          <div className="lg:col-span-1">
            <BetSlip />
          </div>
        </div>
      </div>
    </div>
  );
};
