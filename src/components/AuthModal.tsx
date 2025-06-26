import React, { useState } from 'react';
import { X, Mail, Wallet, Shield } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [authType, setAuthType] = useState<'email' | 'wallet'>('wallet');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { connect } = useWallet();

  if (!isOpen) return null;

  const handleEmailAuth = () => {
    // Simulate email authentication
    connect();
    onClose();
  };

  const handleWalletConnect = () => {
    // Simulate wallet connection
    connect();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Connect to 🥩 Steak</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex rounded-lg bg-white/5 p-1 mb-6">
          <button
            onClick={() => setAuthType('wallet')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authType === 'wallet'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Crypto Wallet
          </button>
          <button
            onClick={() => setAuthType('email')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              authType === 'email'
                ? 'bg-yellow-400 text-black'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Email
          </button>
        </div>

        {authType === 'wallet' ? (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-white font-medium">Secure & Anonymous</span>
              </div>
              <p className="text-gray-300 text-sm">
                Connect your crypto wallet for instant deposits and withdrawals
              </p>
            </div>
            <button
              onClick={handleWalletConnect}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Wallet className="w-5 h-5" />
              <span>Connect Wallet</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleEmailAuth}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Mail className="w-5 h-5" />
              <span>Sign In</span>
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            By connecting, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};