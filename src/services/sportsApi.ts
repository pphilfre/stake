import axios from 'axios';

// Sports API configuration
const SPORTS_API_BASE = 'https://api.the-odds-api.com/v4';
const FOOTBALL_API_BASE = 'https://api.football-data.org/v4';
const NBA_API_BASE = 'https://api.balldontlie.io/v1';

// Types for different sports data
export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
  country?: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  stats?: {
    goals?: number;
    assists?: number;
    points?: number;
    rebounds?: number;
    cards?: number;
  };
}

export interface Match {
  id: string;
  sport: 'soccer' | 'basketball' | 'american_football' | 'baseball' | 'tennis' | 'hockey';
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  minute?: number;
  period?: string;
  homeScore?: number;
  awayScore?: number;
  featured: boolean;
  venue?: string;
  weather?: {
    condition: string;
    temperature: number;
  };
}

export interface BettingMarket {
  id: string;
  matchId: string;
  type: 'match_winner' | 'total_goals' | 'handicap' | 'first_goalscorer' | 'anytime_goalscorer' | 
        'correct_score' | 'both_teams_score' | 'player_props' | 'corners' | 'cards';
  name: string;
  description: string;
  options: BettingOption[];
  category: 'main' | 'goals' | 'players' | 'specials' | 'live';
  isLive: boolean;
}

export interface BettingOption {
  id: string;
  name: string;
  odds: number;
  line?: number; // For handicaps, totals
  playerId?: string; // For player props
  isAvailable: boolean;
  trend?: 'up' | 'down' | 'stable';
}

export interface LiveStats {
  matchId: string;
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
}

class SportsApiService {
  private footballApiKey: string;
  
  constructor() {
    // In production, these would come from environment variables
    this.footballApiKey = import.meta.env?.VITE_FOOTBALL_API_KEY || 'demo-key';
  }

  // Get live and upcoming matches
  async getMatches(sport?: string, live?: boolean): Promise<Match[]> {
    try {
      let matches: Match[] = [];
      
      if (sport === 'soccer') {
        matches = await this.getSoccerMatches(live);
      } else if (sport === 'basketball') {
        matches = await this.getBasketballMatches(live);
      } else {
        // Get matches for all sports
        const [soccer, basketball] = await Promise.all([
          this.getSoccerMatches(live).catch(() => []),
          this.getBasketballMatches(live).catch(() => [])
        ]);
        matches = [...soccer, ...basketball];
      }
      
      // If no matches were retrieved from APIs, use mock data
      if (matches.length === 0) {
        console.log('No matches from APIs, using mock data');
        return this.getMockMatches(sport, live);
      }
      
      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return this.getMockMatches(sport, live);
    }
  }

  private async getSoccerMatches(live?: boolean): Promise<Match[]> {
    try {
      // Using Football-Data.org API for soccer
      const competitions = ['PL', 'CL', 'PD', 'SA', 'BL1', 'FL1']; // Premier League, Champions League, etc.
      const matches: Match[] = [];

      for (const competition of competitions) {
        try {
          const response = await axios.get(`${FOOTBALL_API_BASE}/competitions/${competition}/matches`, {
            headers: {
              'X-Auth-Token': this.footballApiKey
            },
            params: {
              status: live ? 'LIVE,IN_PLAY' : 'SCHEDULED,LIVE,IN_PLAY',
              limit: 20
            },
            timeout: 5000 // 5 second timeout
          });

          const competitionMatches = response.data.matches.map((match: any) => ({
            id: match.id.toString(),
            sport: 'soccer' as const,
            league: response.data.competition?.name || competition,
            homeTeam: {
              id: match.homeTeam.id.toString(),
              name: match.homeTeam.name,
              shortName: match.homeTeam.shortName || match.homeTeam.name,
              logo: match.homeTeam.crest
            },
            awayTeam: {
              id: match.awayTeam.id.toString(),
              name: match.awayTeam.name,
              shortName: match.awayTeam.shortName || match.awayTeam.name,
              logo: match.awayTeam.crest
            },
            startTime: match.utcDate,
            status: this.mapFootballStatus(match.status),
            minute: match.minute,
            homeScore: match.score?.fullTime?.home,
            awayScore: match.score?.fullTime?.away,
            featured: competition === 'PL' || competition === 'CL',
            venue: match.venue
          }));

          matches.push(...competitionMatches);
        } catch (compError) {
          console.warn(`Failed to fetch ${competition} matches:`, compError);
          // Continue with other competitions
        }
      }

      return matches;
    } catch (error) {
      console.error('Error fetching soccer matches (using mock data):', error);
      // Return mock data specifically for soccer
      return this.getMockMatches('soccer', live);
    }
  }

  private async getBasketballMatches(_live?: boolean): Promise<Match[]> {
    try {
      // Using Ball Don't Lie API for NBA
      const response = await axios.get(`${NBA_API_BASE}/games`, {
        params: {
          'dates[]': new Date().toISOString().split('T')[0],
          per_page: 25
        },
        timeout: 5000 // 5 second timeout
      });

      return response.data.data.map((game: any) => ({
        id: game.id.toString(),
        sport: 'basketball' as const,
        league: 'NBA',
        homeTeam: {
          id: game.home_team.id.toString(),
          name: game.home_team.full_name,
          shortName: game.home_team.abbreviation,
        },
        awayTeam: {
          id: game.visitor_team.id.toString(),
          name: game.visitor_team.full_name,
          shortName: game.visitor_team.abbreviation,
        },
        startTime: game.date,
        status: game.status === 'Final' ? 'finished' : 
                game.status === 'In Progress' ? 'live' : 'scheduled',
        homeScore: game.home_team_score,
        awayScore: game.visitor_team_score,
        featured: true,
        period: game.period ? `Q${game.period}` : undefined
      }));
    } catch (error) {
      console.error('Error fetching basketball matches (using mock data):', error);
      // Return mock data specifically for basketball
      return this.getMockMatches('basketball', _live);
    }
  }

  // Get betting markets for a specific match
  async getBettingMarkets(matchId: string, sport: string): Promise<BettingMarket[]> {
    try {
      // This would integrate with a real odds API
      return this.getMockBettingMarkets(matchId, sport);
    } catch (error) {
      console.error('Error fetching betting markets:', error);
      return this.getMockBettingMarkets(matchId, sport);
    }
  }

  // Get live statistics for a match
  async getLiveStats(matchId: string): Promise<LiveStats | null> {
    try {
      // This would integrate with a real stats API
      return this.getMockLiveStats(matchId);
    } catch (error) {
      console.error('Error fetching live stats:', error);
      return null;
    }
  }

  // Get players for a team (for player props betting)
  async getTeamPlayers(teamId: string, sport: string): Promise<Player[]> {
    try {
      if (sport === 'soccer') {
        const response = await axios.get(`${FOOTBALL_API_BASE}/teams/${teamId}`, {
          headers: {
            'X-Auth-Token': this.footballApiKey
          }
        });
        
        return response.data.squad?.map((player: any) => ({
          id: player.id.toString(),
          name: player.name,
          position: player.position,
          team: teamId
        })) || [];
      }
      
      return this.getMockPlayers(teamId, sport);
    } catch (error) {
      console.error('Error fetching team players:', error);
      return this.getMockPlayers(teamId, sport);
    }
  }

  // Subscribe to live updates for a match
  subscribeToLiveUpdates(matchId: string, callback: (data: any) => void): () => void {
    // In a real implementation, this would use WebSocket connections
    const interval = setInterval(async () => {
      try {
        const [markets, stats] = await Promise.all([
          this.getBettingMarkets(matchId, 'soccer'),
          this.getLiveStats(matchId)
        ]);
        
        callback({ markets, stats });
      } catch (error) {
        console.error('Error in live update:', error);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }

  private mapFootballStatus(status: string): Match['status'] {
    switch (status) {
      case 'SCHEDULED':
      case 'TIMED':
        return 'scheduled';
      case 'LIVE':
      case 'IN_PLAY':
      case 'PAUSED':
        return 'live';
      case 'FINISHED':
        return 'finished';
      case 'POSTPONED':
      case 'CANCELLED':
        return 'postponed';
      default:
        return 'scheduled';
    }
  }

  // Mock data methods for development/fallback
  private getMockMatches(sport?: string, live?: boolean): Match[] {
    const now = new Date();
    const mockMatches: Match[] = [
      // Soccer matches
      {
        id: '1',
        sport: 'soccer',
        league: 'Premier League',
        homeTeam: { id: '1', name: 'Manchester City', shortName: 'MCI' },
        awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
        startTime: new Date(now.getTime() - 60 * 60 * 1000).toISOString(), // 1 hour ago
        status: 'live',
        minute: 67,
        homeScore: 1,
        awayScore: 2,
        featured: true,
        venue: 'Etihad Stadium'
      },
      {
        id: '2',
        sport: 'soccer',
        league: 'Champions League',
        homeTeam: { id: '5', name: 'Barcelona', shortName: 'BAR' },
        awayTeam: { id: '6', name: 'Real Madrid', shortName: 'RMA' },
        startTime: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 mins ago
        status: 'live',
        minute: 34,
        homeScore: 0,
        awayScore: 1,
        featured: true,
        venue: 'Camp Nou'
      },
      {
        id: '3',
        sport: 'soccer',
        league: 'Premier League',
        homeTeam: { id: '7', name: 'Arsenal', shortName: 'ARS' },
        awayTeam: { id: '8', name: 'Chelsea', shortName: 'CHE' },
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        status: 'scheduled',
        featured: true,
        venue: 'Emirates Stadium'
      },
      {
        id: '4',
        sport: 'soccer',
        league: 'La Liga',
        homeTeam: { id: '9', name: 'Atletico Madrid', shortName: 'ATM' },
        awayTeam: { id: '10', name: 'Sevilla', shortName: 'SEV' },
        startTime: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
        status: 'scheduled',
        featured: false,
        venue: 'Wanda Metropolitano'
      },
      {
        id: '5',
        sport: 'soccer',
        league: 'Serie A',
        homeTeam: { id: '11', name: 'Juventus', shortName: 'JUV' },
        awayTeam: { id: '12', name: 'AC Milan', shortName: 'MIL' },
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'finished',
        homeScore: 2,
        awayScore: 1,
        featured: true,
        venue: 'Allianz Stadium'
      },
      
      // Basketball matches
      {
        id: '6',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: { id: '13', name: 'Los Angeles Lakers', shortName: 'LAL' },
        awayTeam: { id: '14', name: 'Golden State Warriors', shortName: 'GSW' },
        startTime: new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        status: 'scheduled',
        featured: true,
        venue: 'Crypto.com Arena'
      },
      {
        id: '7',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: { id: '15', name: 'Boston Celtics', shortName: 'BOS' },
        awayTeam: { id: '16', name: 'Miami Heat', shortName: 'MIA' },
        startTime: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45 mins ago
        status: 'live',
        period: 'Q3',
        homeScore: 78,
        awayScore: 82,
        featured: true,
        venue: 'TD Garden'
      },
      {
        id: '8',
        sport: 'basketball',
        league: 'NBA',
        homeTeam: { id: '17', name: 'Phoenix Suns', shortName: 'PHX' },
        awayTeam: { id: '18', name: 'Denver Nuggets', shortName: 'DEN' },
        startTime: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        status: 'finished',
        homeScore: 115,
        awayScore: 108,
        featured: false,
        venue: 'Footprint Center'
      }
    ];

    return mockMatches.filter(match => {
      if (sport && match.sport !== sport) return false;
      if (live && match.status !== 'live') return false;
      return true;
    });
  }

  private getMockBettingMarkets(matchId: string, sport: string): BettingMarket[] {
    if (sport === 'soccer') {
      return [
        {
          id: 'winner-' + matchId,
          matchId,
          type: 'match_winner',
          name: 'Match Winner',
          description: 'Who will win the match?',
          category: 'main',
          isLive: true,
          options: [
            { id: 'home', name: 'Home Win', odds: 2.10, isAvailable: true, trend: 'down' },
            { id: 'draw', name: 'Draw', odds: 3.40, isAvailable: true, trend: 'up' },
            { id: 'away', name: 'Away Win', odds: 3.20, isAvailable: true, trend: 'stable' }
          ]
        },
        {
          id: 'total-goals-' + matchId,
          matchId,
          type: 'total_goals',
          name: 'Total Goals',
          description: 'Over/Under 2.5 goals',
          category: 'goals',
          isLive: true,
          options: [
            { id: 'over', name: 'Over 2.5', odds: 1.85, line: 2.5, isAvailable: true, trend: 'up' },
            { id: 'under', name: 'Under 2.5', odds: 1.95, line: 2.5, isAvailable: true, trend: 'down' }
          ]
        },
        {
          id: 'first-goalscorer-' + matchId,
          matchId,
          type: 'first_goalscorer',
          name: 'First Goalscorer',
          description: 'Who will score the first goal?',
          category: 'players',
          isLive: false,
          options: [
            { id: 'haaland', name: 'Erling Haaland', odds: 4.50, playerId: 'player1', isAvailable: true },
            { id: 'salah', name: 'Mohamed Salah', odds: 5.00, playerId: 'player2', isAvailable: true },
            { id: 'no-goal', name: 'No Goalscorer', odds: 12.00, isAvailable: true }
          ]
        },
        {
          id: 'anytime-goalscorer-' + matchId,
          matchId,
          type: 'anytime_goalscorer',
          name: 'Anytime Goalscorer',
          description: 'Player to score at any time',
          category: 'players',
          isLive: true,
          options: [
            { id: 'haaland-anytime', name: 'Erling Haaland', odds: 2.20, playerId: 'player1', isAvailable: true },
            { id: 'salah-anytime', name: 'Mohamed Salah', odds: 2.50, playerId: 'player2', isAvailable: true },
            { id: 'mane-anytime', name: 'Sadio Mané', odds: 3.00, playerId: 'player3', isAvailable: true }
          ]
        }
      ];
    } else {
      return [
        {
          id: 'winner-' + matchId,
          matchId,
          type: 'match_winner',
          name: 'Match Winner',
          description: 'Who will win the game?',
          category: 'main',
          isLive: true,
          options: [
            { id: 'home', name: 'Home Win', odds: 1.90, isAvailable: true },
            { id: 'away', name: 'Away Win', odds: 1.90, isAvailable: true }
          ]
        }
      ];
    }
  }

  private getMockLiveStats(matchId: string): LiveStats {
    return {
      matchId,
      possession: { home: 58, away: 42 },
      shots: { home: 12, away: 8 },
      shotsOnTarget: { home: 5, away: 3 },
      corners: { home: 6, away: 4 },
      fouls: { home: 8, away: 11 },
      yellowCards: { home: 2, away: 3 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 3, away: 1 }
    };
  }

  private getMockPlayers(teamId: string, sport: string): Player[] {
    if (sport === 'soccer') {
      return [
        { id: 'player1', name: 'Erling Haaland', position: 'Forward', team: teamId },
        { id: 'player2', name: 'Kevin De Bruyne', position: 'Midfielder', team: teamId },
        { id: 'player3', name: 'Virgil van Dijk', position: 'Defender', team: teamId }
      ];
    } else {
      return [
        { id: 'player1', name: 'LeBron James', position: 'Forward', team: teamId },
        { id: 'player2', name: 'Anthony Davis', position: 'Center', team: teamId }
      ];
    }
  }
}

export const sportsApi = new SportsApiService();
