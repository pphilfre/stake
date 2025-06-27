# Live Sports Betting System

A comprehensive, production-ready live sports betting platform with real-time odds, extensive markets, and professional-grade features.

## Features

### 🏟️ Real Sports Data Integration
- **Multiple Sports APIs**: Football-Data.org, Ball Don't Lie (NBA), The Odds API
- **Live Match Data**: Real-time scores, match statistics, and live updates
- **Comprehensive Coverage**: Soccer (Premier League, Champions League, La Liga, etc.), Basketball (NBA), and more
- **Real Venue Information**: Stadium/arena details and match conditions

### 📊 Advanced Betting Markets
- **Match Winner**: Home/Draw/Away betting with live odds
- **Goals Markets**: Over/Under, Both Teams to Score, Correct Score
- **Player Props**: First/Anytime Goalscorer, Player statistics
- **Live Betting**: In-play markets with constantly updating odds
- **Special Markets**: Corners, cards, and event-specific bets

### 🎯 Betting Features
- **Multiple Bet Types**: Single bets, accumulators, and system bets
- **Live Odds**: Real-time updates with trend indicators
- **Quick Stake**: Percentage-based stake selection
- **Bet Slip Management**: Add, remove, and modify selections
- **Balance Integration**: Crypto wallet integration with multiple currencies

### 📱 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Real-time Updates**: Live scores and odds via WebSocket connections
- **Advanced Filtering**: By sport, time, league, and search
- **Live Statistics**: Detailed match stats for informed betting
- **Smooth Animations**: Professional UI with Framer Motion

### 🔧 Technical Implementation

#### Architecture
```
/src
├── services/
│   └── sportsApi.ts          # API service layer
├── contexts/
│   └── SportsContext.tsx     # State management
├── components/
│   ├── SportsbookNew.tsx     # Main sportsbook interface
│   └── sports/
│       ├── LiveBettingNew.tsx # Live betting component
│       ├── BetSlipNew.tsx     # Bet slip management
│       └── MatchDetails.tsx   # Individual match pages
```

#### Data Flow
1. **API Integration**: Multiple sports APIs for comprehensive data
2. **Real-time Updates**: WebSocket connections for live data
3. **State Management**: React Context for global state
4. **Caching**: Efficient data caching and update strategies

### 🚀 Getting Started

#### Prerequisites
- Node.js 18+
- API Keys (optional for demo):
  - Football-Data.org API key
  - The Odds API key

#### Installation
```bash
# Install dependencies
npm install axios @types/node

# Set environment variables (optional)
echo "VITE_FOOTBALL_API_KEY=your_api_key_here" >> .env
echo "VITE_ODDS_API_KEY=your_api_key_here" >> .env

# Start development server
npm run dev
```

#### Usage
1. Navigate to `/sportsbook` to view the main betting interface
2. Browse live and upcoming matches
3. Use filters to find specific sports, leagues, or timeframes
4. Click on matches to view detailed betting markets
5. Add selections to bet slip and place bets

### 🏗️ API Integration

#### Supported APIs
- **Football-Data.org**: European soccer leagues
- **Ball Don't Lie**: NBA basketball data
- **The Odds API**: Comprehensive odds data
- **Custom Mock Data**: Fallback for development

#### Example API Response
```typescript
interface Match {
  id: string;
  sport: 'soccer' | 'basketball' | 'american_football';
  league: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished';
  homeScore?: number;
  awayScore?: number;
  featured: boolean;
}
```

### 🎲 Betting Markets

#### Main Markets
- **Match Winner**: 1X2 betting for soccer, Moneyline for other sports
- **Handicap**: Asian handicap and point spreads
- **Totals**: Over/Under goals, points, or other statistics

#### Player Markets
- **Goalscorers**: First and anytime goalscorer markets
- **Player Props**: Individual player statistics and performances
- **Cards/Fouls**: Disciplinary actions and infractions

#### Live Markets
- **In-Play Betting**: Markets available during live matches
- **Next Goal**: Who will score the next goal
- **Live Totals**: Updated totals based on current score

### 📈 Live Features

#### Real-time Updates
- Match scores updated every 5 seconds
- Odds movements with visual indicators
- Live statistics (possession, shots, corners, etc.)
- Match events (goals, cards, substitutions)

#### WebSocket Integration
```typescript
// Subscribe to live match updates
const unsubscribe = sportsApi.subscribeToLiveUpdates(matchId, (data) => {
  // Handle live data updates
  updateMarkets(data.markets);
  updateStats(data.stats);
});
```

### 🎨 UI Components

#### LiveBetting Component
- Displays currently live matches
- Expandable market views
- Live statistics integration
- Real-time odds updates

#### BetSlip Component
- Single and accumulator bet support
- Quick stake percentage buttons
- Balance validation
- Bet confirmation system

#### MatchDetails Component
- Individual match pages
- Comprehensive market coverage
- Live statistics display
- Category-based market organization

### 🔒 Security & Validation

#### Bet Validation
- Balance checks before bet placement
- Market availability validation
- Odds change protection
- Rate limiting for API calls

#### Error Handling
- Graceful API failure handling
- Fallback to mock data
- User-friendly error messages
- Retry mechanisms for failed requests

### 📊 Performance

#### Optimization Features
- Lazy loading for market data
- Efficient re-rendering with React.memo
- Debounced search and filters
- Optimized WebSocket connections

#### Caching Strategy
- Market data caching (5-minute TTL)
- Match data caching (30-second TTL)
- Player data caching (1-hour TTL)
- Odds history for trend analysis

### 🧪 Testing

#### Test Coverage
- Unit tests for API service
- Integration tests for betting flow
- E2E tests for user workflows
- Performance testing for live updates

#### Mock Data
Comprehensive mock data included for:
- Soccer matches (Premier League, Champions League)
- Basketball games (NBA)
- Betting markets and odds
- Live statistics and updates

### 🚀 Production Deployment

#### Environment Setup
```bash
# Production environment variables
VITE_FOOTBALL_API_KEY=production_api_key
VITE_ODDS_API_KEY=production_odds_key
VITE_APP_ENV=production
```

#### Performance Considerations
- CDN for static assets
- Redis caching for API responses
- WebSocket scaling with Socket.IO clusters
- Database optimization for bet history

### 📋 Roadmap

#### Upcoming Features
- [ ] Tennis and Baseball integration
- [ ] Bet builder for custom markets
- [ ] Cash out functionality
- [ ] Bet history and analytics
- [ ] Push notifications for bet results
- [ ] Social betting features

#### API Enhancements
- [ ] More sports data providers
- [ ] Enhanced live statistics
- [ ] Injury and team news integration
- [ ] Weather data for outdoor sports

This sports betting system provides a professional-grade foundation for live sports betting with real API integrations, comprehensive markets, and production-ready features.
