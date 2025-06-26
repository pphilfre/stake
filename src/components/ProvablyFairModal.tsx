import React, { useState } from 'react';
import { X, Shield, Eye, Hash, Dice1 } from 'lucide-react';
import { useGame } from '../contexts/GameContext';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'how-it-works' | 'verify'>('how-it-works');
  const [clientSeed, setClientSeed] = useState('');
  const [serverSeed, setServerSeed] = useState('');
  const [nonce, setNonce] = useState('');
  const { generateProvablyFairSeed, verifyFairness } = useGame();

  if (!isOpen) return null;

  const generateSeeds = () => {
    setClientSeed(generateProvablyFairSeed());
    setServerSeed(generateProvablyFairSeed());
    setNonce(Math.floor(Math.random() * 1000000).toString());
  };

  const verifyResult = () => {
    const result = verifyFairness(clientSeed + serverSeed + nonce, { dice: 5 });
    alert(result ? 'Result is provably fair!' : 'Verification failed!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Provably Fair Gaming</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-white/5 p-1 mb-6">
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'how-it-works'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'verify'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Verify Results
          </button>
        </div>

        {/* How It Works Tab */}
        {activeTab === 'how-it-works' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-600/30">
              <h3 className="text-xl font-semibold text-white mb-4">What is Provably Fair?</h3>
              <p className="text-gray-300 mb-4">
                Provably fair gaming uses cryptographic algorithms to ensure that neither the player
                nor the house can manipulate game outcomes. Every result can be independently verified.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3">
                  <Hash className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">1. Server Seed</h4>
                <p className="text-gray-300 text-sm">
                  We generate a random server seed and provide you with its hash before the game.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-3">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">2. Client Seed</h4>
                <p className="text-gray-300 text-sm">
                  You provide your own client seed or let us generate one for you.
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <Dice1 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-white mb-2">3. Generate Result</h4>
                <p className="text-gray-300 text-sm">
                  The game result is generated using both seeds and a nonce counter.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h4 className="font-semibold text-white mb-4">Verification Process</h4>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Before playing, we show you the SHA-256 hash of our server seed</li>
                <li>You can set your own client seed or use our generated one</li>
                <li>After each bet, we combine server seed + client seed + nonce</li>
                <li>The result is generated using HMAC-SHA512 cryptographic function</li>
                <li>You can verify any result using the verification tool</li>
              </ol>
            </div>
          </div>
        )}

        {/* Verify Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Verify Game Results</h3>
              <p className="text-gray-300 mb-4">
                Enter the game details to verify the fairness of any result.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Seed
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={clientSeed}
                    onChange={(e) => setClientSeed(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                    placeholder="Enter client seed"
                  />
                  <button
                    onClick={generateSeeds}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-3 rounded-lg transition-colors"
                  >
                    Generate
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Server Seed
                </label>
                <input
                  type="text"
                  value={serverSeed}
                  onChange={(e) => setServerSeed(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Enter server seed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nonce
                </label>
                <input
                  type="text"
                  value={nonce}
                  onChange={(e) => setNonce(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  placeholder="Enter nonce"
                />
              </div>

              <button
                onClick={verifyResult}
                disabled={!clientSeed || !serverSeed || !nonce}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Verify Result
              </button>
            </div>

            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-yellow-400">Security Note</span>
              </div>
              <p className="text-gray-300 text-sm">
                Always verify important wins and losses. Save your seeds and nonce values for future verification.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};