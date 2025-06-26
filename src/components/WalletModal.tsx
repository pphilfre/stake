import React, { useState } from 'react';
import { X, Wallet, ArrowUpRight, ArrowDownLeft, Copy, Check, Bitcoin, Feather as Ethereum, QrCode } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [copied, setCopied] = useState(false);
  const { balance, address, deposit, withdraw, disconnect } = useWallet();

  if (!isOpen) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = () => {
    if (amount && parseFloat(amount) > 0) {
      deposit(parseFloat(amount));
      setAmount('');
      setActiveTab('overview');
    }
  };

  const handleWithdraw = () => {
    if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance) {
      withdraw(parseFloat(amount));
      setAmount('');
      setActiveTab('overview');
    }
  };

  const currencies = [
    { symbol: 'BTC', name: 'Bitcoin', icon: Bitcoin, color: 'text-orange-400' },
    { symbol: 'ETH', name: 'Ethereum', icon: Ethereum, color: 'text-blue-400' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg bg-white/5 p-1 mb-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'deposit', label: 'Deposit' },
            { id: 'withdraw', label: 'Withdraw' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-400 text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl p-6 border border-green-600/30">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  ${balance.toFixed(2)}
                </div>
                <div className="text-gray-300">Total Balance</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300">Wallet Address</span>
                <button
                  onClick={handleCopyAddress}
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-white font-mono text-sm break-all">
                {address.slice(0, 20)}...{address.slice(-10)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('deposit')}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>Deposit</span>
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw</span>
              </button>
            </div>

            <button
              onClick={disconnect}
              className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-semibold py-3 rounded-lg transition-colors border border-red-600/30"
            >
              Disconnect Wallet
            </button>
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-center text-gray-300 text-sm">
                Scan QR code or use the address below to deposit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Currency
              </label>
              <div className="grid grid-cols-2 gap-2">
                {currencies.map((curr) => {
                  const Icon = curr.icon;
                  return (
                    <button
                      key={curr.symbol}
                      onClick={() => setCurrency(curr.symbol)}
                      className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                        currency === curr.symbol
                          ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${curr.color}`} />
                      <span>{curr.symbol}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                placeholder="Enter amount"
              />
            </div>

            <button
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Simulate Deposit
            </button>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-center">
                <div className="text-xl font-bold text-white mb-1">
                  ${balance.toFixed(2)}
                </div>
                <div className="text-gray-300 text-sm">Available Balance</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Withdrawal Address
              </label>
              <input
                type="text"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                placeholder="Enter destination address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                placeholder="Enter amount"
                max={balance}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-400">
                  Max: ${balance.toFixed(2)}
                </span>
                <button
                  onClick={() => setAmount(balance.toString())}
                  className="text-yellow-400 hover:text-yellow-300 text-sm"
                >
                  Max
                </button>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Withdraw
            </button>
          </div>
        )}
      </div>
    </div>
  );
};