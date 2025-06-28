import React, { useState, useEffect } from 'react';
import { Play, RotateCw, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useAuth } from '../../contexts/AuthContext';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminButton } from '../AdminButton';

interface Card {
  suit: string;
  rank: string;
  value: number;
}

export const BlackjackGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState('1');
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [playerCards, setPlayerCards] = useState<Card[]>([]);
  const [dealerCards, setDealerCards] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [canDoubleDown, setCanDoubleDown] = useState(false);
  const [gameHistory, setGameHistory] = useState<Array<{result: string, playerScore: number, dealerScore: number}>>([]);
  
  const { currencies, selectedCurrency, getBalance, updateBalance, switchCurrency } = useWallet();
  const { recordGameResult, gameResults } = useAuth();
  const { gameSettings } = useAdmin();

  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  const createDeck = (): Card[] => {
    const deck: Card[] = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        let value = parseInt(rank);
        if (rank === 'A') value = 11;
        else if (['J', 'Q', 'K'].includes(rank)) value = 10;
        deck.push({ suit, rank, value });
      });
    });
    return deck.sort(() => Math.random() - 0.5);
  };

  const calculateScore = (cards: Card[]): number => {
    let score = 0;
    let aces = 0;
    
    cards.forEach(card => {
      if (card.rank === 'A') {
        aces++;
        score += 11;
      } else {
        score += card.value;
      }
    });
    
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }
    
    return score;
  };

  const dealInitialCards = () => {
    const balance = getBalance();
    const currentSettings = gameSettings.blackjack || { minBet: 1, maxBet: 1000, winRate: 48, enabled: true };
    
    if (!currentSettings.enabled) {
      alert('This game is currently disabled.');
      return;
    }
    
    if (parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0) return;
    if (parseFloat(betAmount) < currentSettings.minBet || parseFloat(betAmount) > currentSettings.maxBet) {
      alert(`Bet amount must be between ${currentSettings.minBet} and ${currentSettings.maxBet}`);
      return;
    }

    const deck = createDeck();
    const playerInitial = [deck[0], deck[2]];
    const dealerInitial = [deck[1], deck[3]];
    
    setPlayerCards(playerInitial);
    setDealerCards(dealerInitial);
    setPlayerScore(calculateScore(playerInitial));
    setDealerScore(calculateScore([dealerInitial[0]])); // Only show first card
    setGameState('playing');
    setResult(null);
    setCanDoubleDown(true);
    updateBalance(-parseFloat(betAmount));
  };

  const hit = () => {
    const deck = createDeck();
    const newCard = deck[Math.floor(Math.random() * deck.length)];
    const newPlayerCards = [...playerCards, newCard];
    const newScore = calculateScore(newPlayerCards);
    
    setPlayerCards(newPlayerCards);
    setPlayerScore(newScore);
    setCanDoubleDown(false);
    
    if (newScore > 21) {
      endGame('bust');
    }
  };

  const stand = () => {
    let newDealerCards = [...dealerCards];
    let newDealerScore = calculateScore(newDealerCards);
    
    // Dealer draws to 17
    while (newDealerScore < 17) {
      const deck = createDeck();
      const newCard = deck[Math.floor(Math.random() * deck.length)];
      newDealerCards.push(newCard);
      newDealerScore = calculateScore(newDealerCards);
    }
    
    setDealerCards(newDealerCards);
    setDealerScore(newDealerScore);
    
    // Determine winner
    if (newDealerScore > 21) {
      endGame('dealer-bust');
    } else if (playerScore > newDealerScore) {
      endGame('win');
    } else if (playerScore < newDealerScore) {
      endGame('lose');
    } else {
      endGame('push');
    }
  };

  const doubleDown = () => {
    const balance = getBalance();
    if (parseFloat(betAmount) > balance) return;
    
    updateBalance(-parseFloat(betAmount));
    setBetAmount((parseFloat(betAmount) * 2).toString());
    hit();
    if (playerScore <= 21) {
      setTimeout(() => stand(), 1000);
    }
  };

  const endGame = async (gameResult: string) => {
    setGameState('finished');
    setResult(gameResult);
    
    let winAmount = 0;
    let won = false;
    
    switch (gameResult) {
      case 'win':
      case 'dealer-bust':
        winAmount = parseFloat(betAmount) * 2;
        won = true;
        break;
      case 'blackjack':
        winAmount = parseFloat(betAmount) * 2.5;
        won = true;
        break;
      case 'push':
        winAmount = parseFloat(betAmount);
        won = true;
        break;
    }
    
    if (winAmount > 0) {
      updateBalance(winAmount);
    }
    
    // Record game result
    await recordGameResult('blackjack', parseFloat(betAmount), winAmount, selectedCurrency, {
      playerScore,
      dealerScore: calculateScore(dealerCards),
      result: gameResult,
      playerCards,
      dealerCards
    });
    
    setGameHistory(prev => [...prev.slice(-9), { 
      result: gameResult, 
      playerScore: playerScore, 
      dealerScore: calculateScore(dealerCards) 
    }]);
  };

  const newGame = () => {
    setGameState('betting');
    setPlayerCards([]);
    setDealerCards([]);
    setPlayerScore(0);
    setDealerScore(0);
    setResult(null);
    setCanDoubleDown(false);
  };

  const getCardColor = (suit: string) => {
    return suit === '♥' || suit === '♦' ? 'text-red-500' : 'text-black';
  };

  const getResultMessage = () => {
    switch (result) {
      case 'win':
      case 'dealer-bust':
        return 'You Win!';
      case 'blackjack':
        return 'Blackjack!';
      case 'lose':
      case 'bust':
        return 'You Lose!';
      case 'push':
        return 'Push!';
      default:
        return '';
    }
  };

  const formatBalance = (amount: number) => {
    if (selectedCurrency === 'BTC') return amount.toFixed(8);
    if (selectedCurrency === 'ETH') return amount.toFixed(6);
    return amount.toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Table */}
          <div className="bg-gradient-to-br from-green-800/30 to-green-900/30 backdrop-blur-sm rounded-2xl p-8 border border-green-600/30 relative overflow-hidden">
            {/* Table felt pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="felt" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="2" fill="white" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#felt)" />
              </svg>
            </div>
            
            <div className="relative z-10">
              {/* Dealer Cards */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Dealer {gameState === 'finished' ? `(${calculateScore(dealerCards)})` : `(${dealerScore})`}
                </h3>
                <div className="flex space-x-2">
                  {dealerCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -20, rotateY: 180 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                      className="relative"
                    >
                      {gameState === 'playing' && index === 1 ? (
                        <div className="w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center border-2 border-blue-500 shadow-lg">
                          <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
                        </div>
                      ) : (
                        <div className="w-16 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-lg relative overflow-hidden">
                          {/* Card background pattern */}
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                          <div className="text-center relative z-10">
                            <div className={`text-2xl font-bold ${getCardColor(card.suit)}`}>
                              {card.rank}
                            </div>
                            <div className={`text-xl ${getCardColor(card.suit)}`}>
                              {card.suit}
                            </div>
                          </div>
                          {/* Corner decorations */}
                          <div className={`absolute top-1 left-1 text-xs font-bold ${getCardColor(card.suit)}`}>
                            {card.rank}
                          </div>
                          <div className={`absolute bottom-1 right-1 text-xs font-bold transform rotate-180 ${getCardColor(card.suit)}`}>
                            {card.rank}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Player Cards */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  You ({playerScore})
                </h3>
                <div className="flex space-x-2">
                  {playerCards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, rotateY: 180 }}
                      animate={{ opacity: 1, y: 0, rotateY: 0 }}
                      transition={{ delay: index * 0.2, duration: 0.6 }}
                      className="relative"
                    >
                      <div className="w-16 h-24 bg-white rounded-lg flex items-center justify-center border-2 border-gray-300 shadow-lg relative overflow-hidden">
                        {/* Card background pattern */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white"></div>
                        <div className="text-center relative z-10">
                          <div className={`text-2xl font-bold ${getCardColor(card.suit)}`}>
                            {card.rank}
                          </div>
                          <div className={`text-xl ${getCardColor(card.suit)}`}>
                            {card.suit}
                          </div>
                        </div>
                        {/* Corner decorations */}
                        <div className={`absolute top-1 left-1 text-xs font-bold ${getCardColor(card.suit)}`}>
                          {card.rank}
                        </div>
                        <div className={`absolute bottom-1 right-1 text-xs font-bold transform rotate-180 ${getCardColor(card.suit)}`}>
                          {card.rank}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Result */}
              {result && (
                <div className="text-center mt-6">
                  <div className={`text-3xl font-bold ${
                    ['win', 'dealer-bust', 'blackjack'].includes(result) ? 'text-green-400' : 
                    result === 'push' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {getResultMessage()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            {gameState === 'betting' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => switchCurrency(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                    >
                      {currencies.map(currency => (
                        <option key={currency.symbol} value={currency.symbol} className="bg-slate-800">
                          {currency.symbol} - {currency.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Bet Amount
                    </label>
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                      placeholder="Enter bet amount"
                      step={selectedCurrency === 'BTC' ? '0.00000001' : selectedCurrency === 'ETH' ? '0.000001' : '0.01'}
                    />
                  </div>
                </div>
                
                <button
                  onClick={dealInitialCards}
                  disabled={parseFloat(betAmount) > getBalance() || parseFloat(betAmount) <= 0}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Deal Cards</span>
                </button>
              </div>
            )}

            {gameState === 'playing' && (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={hit}
                  disabled={playerScore >= 21}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hit</span>
                </button>
                <button
                  onClick={stand}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
                >
                  <Minus className="w-4 h-4" />
                  <span>Stand</span>
                </button>
                {canDoubleDown && (
                  <button
                    onClick={doubleDown}
                    disabled={parseFloat(betAmount) > getBalance()}
                    className="col-span-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
                  >
                    Double Down
                  </button>
                )}
              </div>
            )}

            {gameState === 'finished' && (
              <button
                onClick={newGame}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-4 rounded-lg transition-all"
              >
                New Game
              </button>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Game Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Game Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Current Bet</span>
                <span className="text-white font-semibold">{betAmount} {selectedCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Balance</span>
                <span className="text-white font-semibold">{formatBalance(getBalance())} {selectedCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Blackjack Pays</span>
                <span className="text-white font-semibold">3:2</span>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Games</h3>
            <div className="space-y-2">
              {gameResults.filter(result => result.game_type === 'blackjack').slice(0, 10).map((result, index) => (
                <div
                  key={result.id || index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.win_amount > result.bet_amount ? 'bg-green-600/20 border border-green-600/30' : 
                    result.win_amount === result.bet_amount ? 'bg-yellow-600/20 border border-yellow-600/30' : 
                    'bg-red-600/20 border border-red-600/30'
                  }`}
                >
                  <div>
                    <div className="text-white text-sm font-medium capitalize">
                      {result.game_data?.result || 'blackjack'}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {result.game_data?.playerScore || '?'} vs {result.game_data?.dealerScore || '?'}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${
                    result.win_amount > result.bet_amount ? 'text-green-400' : 
                    result.win_amount === result.bet_amount ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {result.win_amount > result.bet_amount ? 'WIN' : 
                     result.win_amount === result.bet_amount ? 'PUSH' : 'LOSS'}
                  </div>
                </div>
              ))}
              {gameResults.filter(result => result.game_type === 'blackjack').length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No games played yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Button */}
      <div className="fixed top-4 right-4">
        <AdminButton gameId="blackjack" />
      </div>
    </div>
  );
};