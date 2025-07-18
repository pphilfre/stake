import React, { useState } from 'react'
import { X, Wallet, ArrowUpRight, ArrowDownLeft, Copy, Check, Bitcoin, Feather as Ethereum, DollarSign, QrCode, Plus, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useWallet } from '../../contexts/WalletContext'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [copied, setCopied] = useState(false)
  const { currencies, selectedCurrency, address, deposit, withdraw, disconnect, switchCurrency, getBalance } = useWallet()

  if (!isOpen) return null

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeposit = () => {
    if (amount && parseFloat(amount) > 0) {
      deposit(parseFloat(amount), currency)
      setAmount('')
      setActiveTab('overview')
    }
  }

  const handleWithdraw = () => {
    const balance = getBalance(currency)
    if (amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance) {
      withdraw(parseFloat(amount), currency)
      setAmount('')
      setActiveTab('overview')
    }
  }

  const getCurrencyIcon = (symbol: string) => {
    switch (symbol) {
      case 'BTC': return Bitcoin
      case 'ETH': return Ethereum
      default: return DollarSign
    }
  }

  const formatBalance = (amount: number, currencySymbol: string) => {
    if (currencySymbol === 'BTC') return amount.toFixed(8)
    if (currencySymbol === 'ETH') return amount.toFixed(6)
    return amount.toFixed(2)
  }

  const getTotalUSDValue = () => {
    return currencies.reduce((total, curr) => {
      return total + (curr.balance * curr.usdRate)
    }, 0)
  }

  const quickAmounts = [10, 25, 50, 100]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 w-full max-w-2xl border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'deposit', label: 'Deposit' },
            { id: 'withdraw', label: 'Withdraw' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  ${getTotalUSDValue().toFixed(2)}
                </div>
                <div className="text-gray-300 text-lg">Total Balance (USD)</div>
              </div>
            </div>

            {/* Currency Balances */}
            <div className="space-y-4">
              {currencies.map((curr) => {
                const Icon = getCurrencyIcon(curr.symbol)
                return (
                  <div
                    key={curr.symbol}
                    className={`flex items-center justify-between p-6 rounded-xl border transition-all cursor-pointer ${
                      selectedCurrency === curr.symbol
                        ? 'bg-yellow-500/10 border-yellow-500'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    }`}
                    onClick={() => switchCurrency(curr.symbol)}
                  >
                    <div className="flex items-center space-x-4">
                      <Icon className="w-10 h-10 text-yellow-500" />
                      <div>
                        <div className="text-white font-semibold text-lg">{curr.symbol}</div>
                        <div className="text-gray-400">{curr.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold text-lg">
                        {formatBalance(curr.balance, curr.symbol)}
                      </div>
                      <div className="text-gray-400">
                        ${(curr.balance * curr.usdRate).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-300 text-lg">Wallet Address</span>
                <button
                  onClick={handleCopyAddress}
                  className="text-yellow-500 hover:text-yellow-400 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <div className="text-white font-mono break-all">
                {address.slice(0, 20)}...{address.slice(-10)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('deposit')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <ArrowDownLeft className="w-5 h-5" />
                <span>Deposit</span>
              </button>
              <button
                onClick={() => setActiveTab('withdraw')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <ArrowUpRight className="w-5 h-5" />
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
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <p className="text-center text-gray-300">
                Scan QR code or use the address below to deposit
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Currency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {currencies.map((curr) => {
                  const Icon = getCurrencyIcon(curr.symbol)
                  return (
                    <button
                      key={curr.symbol}
                      onClick={() => setCurrency(curr.symbol)}
                      className={`flex items-center space-x-2 p-4 rounded-lg border transition-all ${
                        currency === curr.symbol
                          ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                          : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="font-medium">{curr.symbol}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Enter amount"
                step={currency === 'BTC' ? '0.00000001' : currency === 'ETH' ? '0.000001' : '0.01'}
              />
              
              <div className="grid grid-cols-4 gap-2 mt-3">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors"
                  >
                    ${quickAmount}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all"
            >
              Simulate Deposit
            </button>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Currency
              </label>
              <div className="grid grid-cols-3 gap-3">
                {currencies.map((curr) => {
                  const Icon = getCurrencyIcon(curr.symbol)
                  return (
                    <button
                      key={curr.symbol}
                      onClick={() => setCurrency(curr.symbol)}
                      className={`flex items-center space-x-2 p-4 rounded-lg border transition-all ${
                        currency === curr.symbol
                          ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                          : 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="font-medium">{curr.symbol}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {formatBalance(getBalance(currency), currency)} {currency}
                </div>
                <div className="text-gray-300">Available Balance</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Withdrawal Address
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Enter destination address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Enter amount"
                max={getBalance(currency)}
                step={currency === 'BTC' ? '0.00000001' : currency === 'ETH' ? '0.000001' : '0.01'}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-gray-400">
                  Max: {formatBalance(getBalance(currency), currency)} {currency}
                </span>
                <button
                  onClick={() => setAmount(getBalance(currency).toString())}
                  className="text-yellow-500 hover:text-yellow-400 text-sm font-medium transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > getBalance(currency)}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-lg transition-all"
            >
              Withdraw
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}