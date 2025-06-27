import React, { useState, useEffect } from 'react';
import { Play, RotateCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../contexts/GameContext';
import { useAdmin } from '../../contexts/AdminContext';
import { AdminButton } from '../AdminButton';

export const RouletteGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState('1');
  const [selectedBets, setSelectedBets] = useState<{[key: string]: number}>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<boolean | null>(null);
  const [gameHistory, setGameHistory] = useState<number[]>([]);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(false);
  const [autoplayRounds, setAutoplayRounds] = useState(10);
  const [autoplayCount, setAutoplayCount] = useState(0);
  const [lastBets, setLastBets] = useState<{[key: string]: number}>({});
  
  const { currencies, selectedCurrency, getBalance, updateBalance, switchCurrency } = useWallet();
  const { updateStats, generateProvablyFairSeed } = useGame();
  const { gameSettings } = useAdmin();

  const rouletteNumbers = [
    { number: 0, color: 'green' },
    { number: 32, color: 'red' }, { number: 15, color: 'black' }, { number: 19, color: 'red' },
    { number: 4, color: 'black' }, { number: 21, color: 'red' }, { number: 2, color: 'black' },
    { number: 25, color: 'red' }, { number: 17, color: 'black' }, { number: 34, color: 'red' },
    { number: 6, color: 'black' }, { number: 27, color: 'red' }, { number: 13, color: 'black' },
    { number: 36, color: 'red' }, { number: 11, color: 'black' }, { number: 30, color: 'red' },
    { number: 8, color: 'black' }, { number: 23, color: 'red' }, { number: 10, color: 'black' },
    { number: 5, color: 'red' }, { number: 24, color: 'black' }, { number: 16, color: 'red' },
    { number: 33, color: 'black' }, { number: 1, color: 'red' }, { number: 20, color: 'black' },
    { number: 14, color: 'red' }, { number: 31, color: 'black' }, { number: 9, color: 'red' },
    { number: 22, color: 'black' }, { number: 18, color: 'red' }, { number: 29, color: 'black' },
    { number: 7, color: 'red' }, { number: 28, color: 'black' }, { number: 12, color: 'red' },
    { number: 35, color: 'black' }, { number: 3, color: 'red' }, { number: 26, color: 'black' }
  ];

  const betTypes = [
    { name: 'Red', multiplier: 2, color: 'bg-red-600' },
    { name: 'Black', multiplier: 2, color: 'bg-black' },
    { name: 'Even', multiplier: 2, color: 'bg-blue-600' },
    { name: 'Odd', multiplier: 2, color: 'bg-purple-600' },
    { name: '1-18', multiplier: 2, color: 'bg-green-600' },
    { name: '19-36', multiplier: 2, color: 'bg-orange-600' },
  ];

  useEffect(() => {
    if (isAutoplaying && !isSpinning && autoplayCount > 0) {
      const totalBet = Object.values(lastBets).reduce((sum, bet) => sum + bet, 0);
      if (getBalance() < totalBet) {
        setIsAutoplaying(false);
        return;
      }
      setSelectedBets(lastBets);
    } else if (isAutoplaying && autoplayCount <= 0) {
      setIsAutoplaying(false);
    }
  }, [isAutoplaying, isSpinning, autoplayCount]);

  useEffect(() => {
    if (isAutoplaying && !isSpinning && Object.keys(selectedBets).length > 0 && autoplayCount > 0) {
      spin();
    }
  }, [isAutoplaying, isSpinning, selectedBets]);

  const placeBet = (betType: string) => {
    const amount = parseFloat(betAmount);
    const balance = getBalance();
    if (amount > balance || amount <= 0) return;

    setSelectedBets(prev => ({
      ...prev,
      [betType]: (prev[betType] || 0) + amount
    }));
  };

  const clearBets = () => {
    setSelectedBets({});
  };

  const spin = async () => {
    const totalBet = Object.values(selectedBets).reduce((sum, bet) => sum + bet, 0);
    const balance = getBalance();
    if (totalBet > balance || totalBet <= 0) return;

    setIsSpinning(true);
    updateBalance(-totalBet);

    // Generate provably fair result
    generateProvablyFairSeed();
    const spinResult = Math.floor(Math.random() * 37);

    // Find the index of the winning number in our array
    const winningIndex = rouletteNumbers.findIndex(n => n.number === spinResult);
    const anglePerSegment = 360 / rouletteNumbers.length;
    const winningAngle = winningIndex * anglePerSegment;

    // Calculate how much we need to rotate to get the winning number to the top (0 degrees)
    // We want the winning number to be at the top, so we calculate the angle to get there
    const currentNormalizedRotation = wheelRotation % 360;
    const targetAngle = 360 - winningAngle; // Angle to position winning number at top
    let rotationNeeded = targetAngle - currentNormalizedRotation;
    
    // Ensure we always rotate in a positive direction and add multiple full rotations
    if (rotationNeeded <= 0) rotationNeeded += 360;
    rotationNeeded += 1440; // Add 4 full rotations for the spinning effect

    const finalWheelRotation = wheelRotation + rotationNeeded;
    const finalBallRotation = ballRotation - 2160; // 6 full rotations opposite direction

    setWheelRotation(finalWheelRotation);
    setBallRotation(finalBallRotation);

    // Simulate spinning animation
    await new Promise(resolve => setTimeout(resolve, 3000));

    setResult(spinResult);
    setIsSpinning(false);

    const resultData = rouletteNumbers.find(n => n.number === spinResult);
    let totalWin = 0;
    let hasWon = false;

    // Check winning bets
    Object.entries(selectedBets).forEach(([betType, amount]) => {
      let isWinner = false;
      let multiplier = 1;

      switch (betType) {
        case 'Red':
          isWinner = resultData?.color === 'red';
          multiplier = 2;
          break;
        case 'Black':
          isWinner = resultData?.color === 'black';
          multiplier = 2;
          break;
        case 'Even':
          isWinner = spinResult > 0 && spinResult % 2 === 0;
          multiplier = 2;
          break;
        case 'Odd':
          isWinner = spinResult > 0 && spinResult % 2 === 1;
          multiplier = 2;
          break;
        case '1-18':
          isWinner = spinResult >= 1 && spinResult <= 18;
          multiplier = 2;
          break;
        case '19-36':
          isWinner = spinResult >= 19 && spinResult <= 36;
          multiplier = 2;
          break;
      }

      if (isWinner) {
        totalWin += amount * multiplier;
        hasWon = true;
      }
    });

    if (totalWin > 0) {
      updateBalance(totalWin);
    }

    setLastWin(hasWon);
    updateStats(totalBet, hasWon);
    if (isAutoplaying) {
      setAutoplayCount(c => c - 1);
    }
    setGameHistory(prev => [...prev.slice(-9), spinResult]);
    setSelectedBets({});
  };

  const getNumberColor = (num: number) => {
    const numberData = rouletteNumbers.find(n => n.number === num);
    if (numberData?.color === 'red') return 'bg-red-600';
    if (numberData?.color === 'black') return 'bg-gray-900';
    return 'bg-green-600';
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
          {/* 3D Roulette Wheel */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 text-center">
            <div className="relative w-96 h-96 mx-auto mb-8">
              {/* Wheel Base */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-900 to-amber-700 shadow-2xl">
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-800 to-amber-600">
                  
                  {/* Wheel Segments */}
                  <div className="absolute inset-6 rounded-full overflow-hidden">
                    {rouletteNumbers.map((num, index) => {
                      const angle = 360 / rouletteNumbers.length;
                      const rotation = index * angle;
                      return (
                        <div
                          key={`segment-${num.number}`}
                          className={`absolute inset-0 ${
                            num.color === 'red' ? 'bg-red-700/30' : 
                            num.color === 'black' ? 'bg-gray-800/30' : 'bg-green-700/30'
                          }`}
                          style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((angle * Math.PI) / 180)}% ${50 - 50 * Math.cos((angle * Math.PI) / 180)}%)`,
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: 'center center',
                          }}
                        />
                      );
                    })}
                  </div>
                  {/* Wheel Numbers */}
                  <motion.div
                    className="absolute inset-6 rounded-full"
                    animate={{ rotate: wheelRotation }}
                    transition={{ duration: isSpinning ? 3 : 0, ease: "easeOut" }}
                    style={{ transformOrigin: 'center center' }}
                  >
                    {rouletteNumbers.map((num, index) => {
                      const angle = (index * 360) / rouletteNumbers.length;
                      const radius = 140; // Adjusted distance from center for bigger wheel
                      const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                      const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
                      
                      return (
                        <div
                          key={num.number}
                          className={`absolute w-8 h-8 flex items-center justify-center text-white text-sm font-bold rounded-sm ${
                            num.color === 'red' ? 'bg-red-600' : 
                            num.color === 'black' ? 'bg-gray-900' : 'bg-green-600'
                          }`}
                          style={{
                            left: `calc(50% + ${x}px - 16px)`,
                            top: `calc(50% + ${y}px - 16px)`,
                            transform: `rotate(${-wheelRotation}deg)`, // Counter-rotate to keep numbers flat
                          }}
                        >
                          {num.number}
                        </div>
                      );
                    })}
                  </motion.div>
                </div>
              </div>

              {/* Pointer to indicate winning position */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-yellow-400"></div>
              </div>

              {/* Ball */}
              <motion.div
                className="absolute w-4 h-4 bg-white rounded-full shadow-lg z-10"
                style={{ 
                  left: 'calc(50% - 8px)',
                  top: 'calc(50% - 8px - 160px)',
                  transformOrigin: '8px 160px'
                }}
                animate={{ rotate: ballRotation }}
                transition={{ duration: isSpinning ? 3 : 0, ease: "easeOut" }}
              />

              {/* Center Hub */}
              <div className="absolute top-1/2 left-1/2 w-20 h-20 -mt-10 -ml-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-lg flex items-center justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full" />
              </div>

              {/* Wheel Markers */}
              <div className="absolute inset-0">
                {rouletteNumbers.map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-8 bg-yellow-400/50"
                    style={{
                      top: '12px',
                      left: '50%',
                      transformOrigin: '0 180px',
                      transform: `translateX(-50%) rotate(${i * (360 / rouletteNumbers.length)}deg)`,
                    }}
                  />
                ))}
              </div>
            </div>
            
            {result !== null && (
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">{result}</div>
                <div className={`text-lg font-semibold ${lastWin ? 'text-green-400' : 'text-red-400'}`}>
                  {lastWin ? 'You Won!' : 'You Lost!'}
                </div>
              </div>
            )}
          </div>

          {/* Betting Board */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                  disabled={isAutoplaying}
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={clearBets}
                  disabled={isSpinning || isAutoplaying}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Clear Bets
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Rounds
                </label>
                <input
                  type="number"
                  value={autoplayRounds}
                  onChange={(e) => setAutoplayRounds(parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Number of rounds"
                  disabled={isAutoplaying}
                />
              </div>
              <button
                onClick={() => {
                  if (isAutoplaying) {
                    setIsAutoplaying(false);
                  } else {
                    if (Object.keys(selectedBets).length === 0) return;
                    setLastBets(selectedBets);
                    setAutoplayCount(autoplayRounds);
                    setIsAutoplaying(true);
                  }
                }}
                disabled={isSpinning && !isAutoplaying}
                className={`w-full self-end ${isAutoplaying ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700'} disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2`}
              >
                <RotateCw className={`w-5 h-5 ${isAutoplaying ? 'animate-spin' : ''}`} />
                <span>{isAutoplaying ? `Stop Autoplay (${autoplayCount})` : 'Start Autoplay'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {betTypes.map((bet) => (
                <button
                  key={bet.name}
                  onClick={() => placeBet(bet.name)}
                  disabled={isSpinning || isAutoplaying}
                  className={`${bet.color} hover:opacity-80 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all relative`}
                >
                  <span>{bet.name}</span>
                  <span className="block text-xs">{bet.multiplier}x</span>
                  {selectedBets[bet.name] && (
                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {formatBalance(selectedBets[bet.name])}
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={spin}
              disabled={isSpinning || Object.keys(selectedBets).length === 0 || isAutoplaying}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>{isSpinning ? 'Spinning...' : 'Spin'}</span>
            </button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Current Bets */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Current Bets</h3>
            {Object.keys(selectedBets).length === 0 ? (
              <p className="text-gray-400">No bets placed</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(selectedBets).map(([betType, amount]) => (
                  <div key={betType} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                    <span className="text-white">{betType}</span>
                    <span className="text-yellow-400 font-semibold">{formatBalance(amount)} {selectedCurrency}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-yellow-400 font-bold">
                      {formatBalance(Object.values(selectedBets).reduce((sum, bet) => sum + bet, 0))} {selectedCurrency}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Game Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Game Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Balance</span>
                <span className="text-white font-semibold">{formatBalance(getBalance())} {selectedCurrency}</span>
              </div>
            </div>
          </div>

          {/* Recent Numbers */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Numbers</h3>
            <div className="grid grid-cols-5 gap-2">
              {gameHistory.map((num, index) => (
                <div
                  key={index}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${getNumberColor(num)}`}
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Button */}
      <div className="fixed top-4 right-4">
        <AdminButton gameId="roulette" />
      </div>
    </div>
  );
};