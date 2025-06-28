import React, { createContext, useContext, useState, useEffect } from 'react';

interface Currency {
  symbol: string;
  name: string;
  balance: number;
  usdRate: number;
}

interface WalletContextType {
  isConnected: boolean;
  currencies: Currency[];
  selectedCurrency: string;
  address: string;
  connect: () => void;
  disconnect: () => void;
  deposit: (amount: number, currency: string) => void;
  withdraw: (amount: number, currency: string) => void;
  updateBalance: (amount: number, currency?: string) => void;
  switchCurrency: (currency: string) => void;
  getBalance: (currency?: string) => number;
  convertToUSD: (amount: number, currency: string) => number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [currencies, setCurrencies] = useState<Currency[]>([
    { symbol: 'USD', name: 'US Dollar', balance: 1000, usdRate: 1 },
    { symbol: 'BTC', name: 'Bitcoin', balance: 0.1, usdRate: 45000 },
    { symbol: 'ETH', name: 'Ethereum', balance: 5, usdRate: 2500 },
  ]);
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Auto-connect wallet for demo purposes
    if (!isConnected) {
      connect();
    }
  }, []);

  useEffect(() => {
    // Save wallet state to localStorage
    if (isConnected) {
      const walletData = {
        isConnected: true,
        currencies,
        selectedCurrency,
        address
      };
      localStorage.setItem('wallet', JSON.stringify(walletData));
    }
  }, [isConnected, currencies, selectedCurrency, address]);

  useEffect(() => {
    // Load wallet state from localStorage
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        if (walletData.isConnected) {
          setIsConnected(walletData.isConnected);
          setCurrencies(walletData.currencies || currencies);
          setSelectedCurrency(walletData.selectedCurrency || 'USD');
          setAddress(walletData.address || '');
        }
      } catch (error) {
        console.error('Error loading wallet data:', error);
      }
    }
  }, []);

  const connect = () => {
    // Simulate wallet connection
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    
    setIsConnected(true);
    setAddress(mockAddress);
    
    console.log('Wallet connected with address:', mockAddress);
  };

  const disconnect = () => {
    setIsConnected(false);
    setCurrencies([
      { symbol: 'USD', name: 'US Dollar', balance: 1000, usdRate: 1 },
      { symbol: 'BTC', name: 'Bitcoin', balance: 0.1, usdRate: 45000 },
      { symbol: 'ETH', name: 'Ethereum', balance: 5, usdRate: 2500 },
    ]);
    setAddress('');
    localStorage.removeItem('wallet');
  };

  const deposit = (amount: number, currency: string = selectedCurrency) => {
    setCurrencies(prev => prev.map(c => 
      c.symbol === currency ? { ...c, balance: c.balance + amount } : c
    ));
    console.log(`Deposited ${amount} ${currency}`);
  };

  const withdraw = (amount: number, currency: string = selectedCurrency) => {
    const currencyData = currencies.find(c => c.symbol === currency);
    if (currencyData && amount <= currencyData.balance) {
      setCurrencies(prev => prev.map(c => 
        c.symbol === currency ? { ...c, balance: Math.max(0, c.balance - amount) } : c
      ));
      console.log(`Withdrew ${amount} ${currency}`);
    } else {
      console.log(`Insufficient balance for withdrawal of ${amount} ${currency}`);
    }
  };

  const updateBalance = (amount: number, currency: string = selectedCurrency) => {
    setCurrencies(prev => prev.map(c => 
      c.symbol === currency ? { ...c, balance: Math.max(0, c.balance + amount) } : c
    ));
    console.log(`Updated balance by ${amount} ${currency}. New balance:`, getBalance(currency) + amount);
  };

  const switchCurrency = (currency: string) => {
    setSelectedCurrency(currency);
    console.log('Switched to currency:', currency);
  };

  const getBalance = (currency: string = selectedCurrency) => {
    const currencyData = currencies.find(c => c.symbol === currency);
    const balance = currencyData?.balance || 0;
    return balance;
  };

  const convertToUSD = (amount: number, currency: string) => {
    const currencyData = currencies.find(c => c.symbol === currency);
    return currencyData ? amount * currencyData.usdRate : amount;
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      currencies,
      selectedCurrency,
      address,
      connect,
      disconnect,
      deposit,
      withdraw,
      updateBalance,
      switchCurrency,
      getBalance,
      convertToUSD
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};