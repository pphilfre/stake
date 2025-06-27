import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play } from 'lucide-react';
import { 
  Bodies, 
  Body, 
  Composite, 
  Engine, 
  Events, 
  Render, 
  Runner, 
  World 
} from 'matter-js';
import { useWallet } from '../../contexts/WalletContext';
import { useGame } from '../../contexts/GameContext';
import { AdminButton } from '../AdminButton';

export const PlinkoGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState('1');
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [rows, setRows] = useState(16);
  const [isDropping, setIsDropping] = useState(false);
  const [gameHistory, setGameHistory] = useState<Array<{multiplier: number, won: boolean}>>([]);
  const [lastResult, setLastResult] = useState<{multiplier: number, bucket: number} | null>(null);
  const [ballsInGame, setBallsInGame] = useState(0);
  
  const { currencies, selectedCurrency, getBalance, updateBalance, switchCurrency } = useWallet();
  const { updateStats, generateProvablyFairSeed } = useGame();
  
  const engineRef = useRef<Engine | null>(null);
  const renderRef = useRef<Render | null>(null);
  const runnerRef = useRef<Runner | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  // Game configuration
  const config = {
    world: {
      width: 600,
      height: 800
    },
    pins: {
      startPins: 3,
      pinGap: 35,
      pinSize: 4
    },
    ball: {
      ballSize: 8
    },
    colors: {
      background: 'transparent',
      pin: '#8B5CF6',
      ball: '#F59E0B'
    }
  };

  // Multipliers for different risk levels and rows
  const getMultipliers = () => {
    const multipliers = {
      low: {
        8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        12: [8.4, 3, 1.9, 1.2, 1, 0.7, 0.7, 1, 1.2, 1.9, 3, 8.4],
        16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16]
      },
      medium: {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110]
      },
      high: {
        8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
        12: [76, 18, 5, 1.9, 0.4, 0.2, 0.1, 0.2, 0.4, 1.9, 5, 18, 76],
        16: [420, 130, 26, 9, 4, 2, 0.2, 0.2, 0.1, 0.2, 0.2, 2, 4, 9, 26, 130, 420]
      }
    };
    return multipliers[riskLevel][rows as keyof typeof multipliers[typeof riskLevel]];
  };

  const getBucketColor = (multiplier: number) => {
    if (multiplier >= 10) return 'from-red-500 to-red-700';
    if (multiplier >= 3) return 'from-orange-500 to-orange-700';
    if (multiplier >= 1) return 'from-green-500 to-green-700';
    return 'from-gray-500 to-gray-700';
  };

  // Initialize physics engine
  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Create engine
    const engine = Engine.create();
    engine.gravity.y = 1;
    engineRef.current = engine;

    // Create render
    const render = Render.create({
      element: gameContainerRef.current,
      engine: engine,
      options: {
        width: config.world.width,
        height: config.world.height,
        background: config.colors.background,
        wireframes: false,
        showVelocity: false,
        showAngleIndicator: false
      }
    });
    renderRef.current = render;

    // Create runner
    const runner = Runner.create();
    runnerRef.current = runner;

    // Start renderer and runner
    Render.run(render);
    Runner.run(runner, engine);

    return () => {
      if (renderRef.current) {
        renderRef.current.canvas.remove();
        renderRef.current.textures = {};
      }
      if (engineRef.current) {
        World.clear(engineRef.current.world, true);
        Engine.clear(engineRef.current);
      }
    };
  }, [rows]);

  // Create pins and walls
  useEffect(() => {
    if (!engineRef.current) return;

    const { world } = engineRef.current;
    const { width: worldWidth, height: worldHeight } = config.world;
    const { startPins, pinGap, pinSize } = config.pins;

    // Clear existing bodies
    World.clear(world, false);

    // Create pins
    const pins: Body[] = [];
    for (let l = 0; l < rows; l++) {
      const linePins = startPins + l;
      const lineWidth = linePins * pinGap;
      for (let i = 0; i < linePins; i++) {
        const pinX = worldWidth / 2 - lineWidth / 2 + i * pinGap + pinGap / 2;
        const pinY = 150 + l * pinGap;

        const pin = Bodies.circle(pinX, pinY, pinSize, {
          label: `pin-${l}-${i}`,
          render: {
            fillStyle: config.colors.pin
          },
          isStatic: true
        });
        pins.push(pin);
      }
    }

    // Create walls
    const leftWall = Bodies.rectangle(-10, worldHeight / 2, 20, worldHeight, {
      isStatic: true,
      render: { visible: false }
    });

    const rightWall = Bodies.rectangle(worldWidth + 10, worldHeight / 2, 20, worldHeight, {
      isStatic: true,
      render: { visible: false }
    });

    const floor = Bodies.rectangle(worldWidth / 2, worldHeight + 10, worldWidth * 2, 20, {
      label: 'floor',
      isStatic: true,
      render: { visible: false }
    });

    // Create multiplier buckets
    const multipliers = getMultipliers();
    const bucketWidth = worldWidth / multipliers.length;
    const multiplierBodies: Body[] = [];

    multipliers.forEach((multiplier, index) => {
      const bucketX = bucketWidth * index + bucketWidth / 2;
      const bucketY = worldHeight - 100;
      
      const bucket = Bodies.rectangle(bucketX, bucketY, bucketWidth - 2, 20, {
        label: `bucket-${index}-${multiplier}`,
        isStatic: true,
        render: {
          fillStyle: multiplier >= 1 ? '#10B981' : '#EF4444'
        }
      });
      multiplierBodies.push(bucket);
    });

    // Add all bodies to world
    Composite.add(world, [...pins, leftWall, rightWall, floor, ...multiplierBodies]);

    // Collision detection
    Events.on(engineRef.current, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        const ball = bodyA.label.includes('ball') ? bodyA : bodyB.label.includes('ball') ? bodyB : null;
        const bucket = bodyA.label.includes('bucket') ? bodyA : bodyB.label.includes('bucket') ? bodyB : null;

        if (ball && bucket) {
          // Ball hit bucket
          const bucketData = bucket.label.split('-');
          const bucketIndex = parseInt(bucketData[1]);
          const multiplier = parseFloat(bucketData[2]);
          
          // Remove ball
          World.remove(world, ball);
          setBallsInGame(prev => prev - 1);
          
          // Calculate result
          const betValue = parseFloat(ball.label.split('-')[1]);
          const won = multiplier >= 1;
          const winAmount = betValue * multiplier;
          
          if (won) {
            updateBalance(winAmount);
          }
          
          setLastResult({ multiplier, bucket: bucketIndex });
          updateStats(betValue, won);
          setGameHistory(prev => [...prev.slice(-9), { multiplier, won }]);
          
          setTimeout(() => {
            setIsDropping(false);
          }, 500);
        }
      }
    });

  }, [rows, riskLevel]);

  const addBall = useCallback((ballValue: number) => {
    if (!engineRef.current || ballsInGame >= 10) return;

    const { world } = engineRef.current;
    const { width: worldWidth } = config.world;
    const { ballSize } = config.ball;

    setBallsInGame(prev => prev + 1);

    // Random starting position
    const ballX = worldWidth / 2 + (Math.random() - 0.5) * 50;
    
    const ball = Bodies.circle(ballX, 50, ballSize, {
      label: `ball-${ballValue}`,
      render: {
        fillStyle: config.colors.ball
      },
      restitution: 0.8,
      friction: 0.1,
      frictionAir: 0.01
    });

    Composite.add(world, ball);
  }, [ballsInGame]);

  const dropBall = async () => {
    const balance = getBalance();
    if (parseFloat(betAmount) > balance || parseFloat(betAmount) <= 0 || isDropping) {
      return;
    }

    setIsDropping(true);
    updateBalance(-parseFloat(betAmount));
    generateProvablyFairSeed();
    
    addBall(parseFloat(betAmount));
  };

  const formatBalance = (amount: number) => {
    if (selectedCurrency === 'BTC') return amount.toFixed(8);
    if (selectedCurrency === 'ETH') return amount.toFixed(6);
    return amount.toFixed(2);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Game Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Plinko Board */}
          <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 relative overflow-hidden">
            <div 
              ref={gameContainerRef}
              className="mx-auto"
              style={{ width: config.world.width, height: config.world.height }}
            />
            
            {/* Multiplier Labels */}
            <div className="flex justify-center mt-4">
              {getMultipliers().map((multiplier, index) => (
                <div
                  key={index}
                  className={`flex-1 text-center py-2 mx-0.5 rounded ${
                    lastResult?.bucket === index 
                      ? 'bg-yellow-500 text-black' 
                      : `bg-gradient-to-b ${getBucketColor(multiplier)} text-white`
                  }`}
                >
                  <div className="text-xs font-bold">
                    {multiplier}x
                  </div>
                </div>
              ))}
            </div>

            {/* Result Display */}
            {lastResult && (
              <div className="text-center mt-4">
                <div className={`text-2xl font-bold mb-2 ${
                  lastResult.multiplier >= 1 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {lastResult.multiplier}x
                </div>
                <div className="text-white">
                  {lastResult.multiplier >= 1 ? 'WIN' : 'LOSS'}: {formatBalance(parseFloat(betAmount) * lastResult.multiplier)} {selectedCurrency}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Game Controls</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Currency</label>
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Bet Amount</label>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Enter bet amount"
                  step={selectedCurrency === 'BTC' ? '0.00000001' : selectedCurrency === 'ETH' ? '0.000001' : '0.01'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="low" className="bg-slate-800">Low Risk</option>
                  <option value="medium" className="bg-slate-800">Medium Risk</option>
                  <option value="high" className="bg-slate-800">High Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rows</label>
                <select
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value={8} className="bg-slate-800">8 Rows</option>
                  <option value={12} className="bg-slate-800">12 Rows</option>
                  <option value={16} className="bg-slate-800">16 Rows</option>
                </select>
              </div>

              <button
                onClick={dropBall}
                disabled={isDropping || parseFloat(betAmount) > getBalance() || parseFloat(betAmount) <= 0}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>{isDropping ? 'Dropping...' : 'Drop Ball'}</span>
              </button>
            </div>
          </div>

          {/* Game Info */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Game Info</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-300">Balance</span>
                <span className="text-white font-semibold">{formatBalance(getBalance())} {selectedCurrency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Balls in Game</span>
                <span className="text-white font-semibold">{ballsInGame}</span>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          {gameHistory.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Games</h3>
              <div className="space-y-2">
                {gameHistory.map((game, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      game.won ? 'bg-green-600/20 border border-green-600/30' : 'bg-red-600/20 border border-red-600/30'
                    }`}
                  >
                    <div className="text-white text-sm font-medium">{game.multiplier}x</div>
                    <div className={`text-sm font-semibold ${game.won ? 'text-green-400' : 'text-red-400'}`}>
                      {game.won ? 'WIN' : 'LOSS'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Button */}
      <div className="fixed top-4 right-4">
        <AdminButton gameId="plinko" />
      </div>
    </div>
  );
};
