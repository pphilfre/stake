import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Activity, 
  TrendingUp, 
  Target,
  Award,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSports } from '../../contexts/SportsContext';
import { BetSlip } from './BetSlipNew';
import { Match, BettingMarket } from '../../services/sportsApi';

export const MatchDetails: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  
  const {
    matches,
    bettingMarkets,
    liveStats,
    teamPlayers,
    loadBettingMarkets,
    loadTeamPlayers,
    subscribeToMatch,
    addToBetSlip
  } = useSports();

  const [selectedCategory, setSelectedCategory] = useState<'main' | 'goals' | 'players' | 'specials'>('main');
  const [showStats, setShowStats] = useState(false);

  const match = matches.find(m => m.id === matchId);
  const markets = bettingMarkets[matchId || ''] || [];
  const stats = liveStats[matchId || ''];
  const homeTeamPlayers = teamPlayers[match?.homeTeam.id || ''] || [];
  const awayTeamPlayers = teamPlayers[match?.awayTeam.id || ''] || [];

  useEffect(() => {
    if (!match) return;

    // Load betting markets
    loadBettingMarkets(match.id, match.sport);

    // Load team players for player props
    if (match.sport === 'soccer') {
      loadTeamPlayers(match.homeTeam.id, match.sport);
      loadTeamPlayers(match.awayTeam.id, match.sport);
    }

    // Subscribe to live updates if match is live
    if (match.status === 'live') {
      const unsubscribe = subscribeToMatch(match.id);
      return unsubscribe;
    }
  }, [match, loadBettingMarkets, loadTeamPlayers, subscribeToMatch]);

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Match Not Found</h1>
          <button
            onClick={() => navigate('/sportsbook')}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Sportsbook
          </button>
        </div>
      </div>
    );
  }

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatus = () => {
    switch (match.status) {
      case 'live':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-bold text-lg">LIVE</span>
            {match.minute && <span className="text-white">{match.minute}'</span>}
          </div>
        );
      case 'finished':
        return <span className="text-gray-400 text-lg">Full Time</span>;
      case 'postponed':
        return <span className="text-yellow-400 text-lg">Postponed</span>;
      default:
        return <span className="text-gray-400 text-lg">{formatMatchTime(match.startTime)}</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'main':
        return <Target className="w-5 h-5" />;
      case 'goals':
        return <Activity className="w-5 h-5" />;
      case 'players':
        return <Users className="w-5 h-5" />;
      case 'specials':
        return <Award className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const handleBetClick = (market: BettingMarket, optionId: string) => {
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

  const filteredMarkets = markets.filter(market => market.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-8">
              <button
                onClick={() => navigate('/sportsbook')}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-gray-400">{match.league}</span>
                  {match.venue && (
                    <>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">{match.venue}</span>
                      </div>
                    </>
                  )}
                </div>
                {getMatchStatus()}
              </div>
            </div>

            {/* Match Overview */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-600/50">
              <div className="grid grid-cols-3 gap-8 items-center">
                {/* Home Team */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {match.homeTeam.shortName.substring(0, 3)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{match.homeTeam.name}</h2>
                  {match.status === 'live' && (
                    <div className="text-4xl font-bold text-white">{match.homeScore}</div>
                  )}
                </div>

                {/* VS / Score */}
                <div className="text-center">
                  {match.status === 'live' ? (
                    <div className="text-6xl font-bold text-gray-400">:</div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-400">VS</div>
                  )}
                </div>

                {/* Away Team */}
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {match.awayTeam.shortName.substring(0, 3)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{match.awayTeam.name}</h2>
                  {match.status === 'live' && (
                    <div className="text-4xl font-bold text-white">{match.awayScore}</div>
                  )}
                </div>
              </div>

              {/* Live Stats Toggle */}
              {match.status === 'live' && match.sport === 'soccer' && stats && (
                <div className="mt-8 pt-6 border-t border-slate-600/50">
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="flex items-center space-x-2 mx-auto px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-white transition-colors"
                  >
                    <Activity className="w-4 h-4" />
                    <span>{showStats ? 'Hide' : 'Show'} Live Stats</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Statistics */}
            <AnimatePresence>
              {showStats && stats && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
                >
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Live Statistics</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-2">Possession</div>
                      <div className="text-2xl font-bold text-white">
                        {stats.possession.home}% - {stats.possession.away}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-2">Shots</div>
                      <div className="text-2xl font-bold text-white">
                        {stats.shots.home} - {stats.shots.away}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-2">Shots on Target</div>
                      <div className="text-2xl font-bold text-white">
                        {stats.shotsOnTarget.home} - {stats.shotsOnTarget.away}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-2">Corners</div>
                      <div className="text-2xl font-bold text-white">
                        {stats.corners.home} - {stats.corners.away}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Betting Markets */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-2xl font-bold text-white mb-6">Betting Markets</h3>

              {/* Category Tabs */}
              <div className="flex space-x-2 mb-8 overflow-x-auto">
                {['main', 'goals', 'players', 'specials'].map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category as any)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg whitespace-nowrap transition-colors ${
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
              <div className="space-y-6">
                {filteredMarkets.length > 0 ? (
                  filteredMarkets.map(market => (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">{market.name}</h4>
                        {market.isLive && (
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 text-sm font-semibold">LIVE</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-400 mb-6">{market.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {market.options.map(option => (
                          <button
                            key={option.id}
                            onClick={() => handleBetClick(market, option.id)}
                            disabled={!option.isAvailable}
                            className={`p-4 rounded-lg border transition-all duration-200 ${
                              option.isAvailable
                                ? 'bg-slate-700/50 border-slate-600 hover:border-yellow-400 hover:bg-yellow-400/10'
                                : 'bg-slate-800/30 border-slate-700 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <div className="text-center">
                              <div className="text-white font-medium mb-2">{option.name}</div>
                              <div className="flex items-center justify-center space-x-2">
                                {option.trend && (
                                  <TrendingUp className={`w-4 h-4 ${
                                    option.trend === 'up' ? 'text-green-400' : 
                                    option.trend === 'down' ? 'text-red-400' : 
                                    'text-gray-400'
                                  }`} />
                                )}
                                <span className="text-yellow-400 text-xl font-bold">
                                  {option.odds.toFixed(2)}
                                </span>
                              </div>
                              {option.line && (
                                <div className="text-gray-400 text-sm mt-1">
                                  Line: {option.line}
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Markets Available</h3>
                    <p className="text-gray-400">Markets for this category are not yet available</p>
                  </div>
                )}
              </div>
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
