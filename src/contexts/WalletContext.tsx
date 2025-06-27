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
    { symbol: 'USD', name: 'US Dollar', balance: 0, usdRate: 1 },
    { symbol: 'BTC', name: 'Bitcoin', balance: 0, usdRate: 45000 },
    { symbol: 'ETH', name: 'Ethereum', balance: 0, usdRate: 2500 },
  ]);
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Simulate wallet connection persistence
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      const walletData = JSON.parse(savedWallet);
      setIsConnected(walletData.isConnected);
      setCurrencies(walletData.currencies || currencies);
      setSelectedCurrency(walletData.selectedCurrency || 'USD');
      setAddress(walletData.address);
    }
  }, []);

  const connect = () => {
    // Simulate wallet connection
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    const initialCurrencies = [
      { symbol: 'USD', name: 'US Dollar', balance: Math.random() * 1000, usdRate: 1 },
      { symbol: 'BTC', name: 'Bitcoin', balance: Math.random() * 0.1, usdRate: 45000 },
      { symbol: 'ETH', name: 'Ethereum', balance: Math.random() * 5, usdRate: 2500 },
    ];
    
    setIsConnected(true);
    setCurrencies(initialCurrencies);
    setAddress(mockAddress);
    
    localStorage.setItem('wallet', JSON.stringify({
      isConnected: true,
      currencies: initialCurrencies,
      selectedCurrency,
      address: mockAddress
    }));
  };

  const disconnect = () => {
    setIsConnected(false);
    setCurrencies([
      { symbol: 'USD', name: 'US Dollar', balance: 0, usdRate: 1 },
      { symbol: 'BTC', name: 'Bitcoin', balance: 0, usdRate: 45000 },
      { symbol: 'ETH', name: 'Ethereum', balance: 0, usdRate: 2500 },
    ]);
    setAddress('');
    localStorage.removeItem('wallet');
  };

  const deposit = (amount: number, currency: string = selectedCurrency) => {
    setCurrencies(prev => prev.map(c => 
      c.symbol === currency ? { ...c, balance: c.balance + amount } : c
    ));
    updateLocalStorage();
  };

  const withdraw = (amount: number, currency: string = selectedCurrency) => {
    const currencyData = currencies.find(c => c.symbol === currency);
    if (currencyData && amount <= currencyData.balance) {
      setCurrencies(prev => prev.map(c => 
        c.symbol === currency ? { ...c, balance: c.balance - amount } : c
      ));
      updateLocalStorage();
    }
  };

  const updateBalance = (amount: number, currency: string = selectedCurrency) => {
    setCurrencies(prev => prev.map(c => 
      c.symbol === currency ? { ...c, balance: Math.max(0, c.balance + amount) } : c
    ));
    updateLocalStorage();
  };

  const switchCurrency = (currency: string) => {
    setSelectedCurrency(currency);
    updateLocalStorage();
  };

  const getBalance = (currency: string = selectedCurrency) => {
    const currencyData = currencies.find(c => c.symbol === currency);
    return currencyData?.balance || 0;
  };

  const convertToUSD = (amount: number, currency: string) => {
    const currencyData = currencies.find(c => c.symbol === currency);
    return currencyData ? amount * currencyData.usdRate : amount;
  };

  const updateLocalStorage = () => {
    if (isConnected) {
      localStorage.setItem('wallet', JSON.stringify({
        isConnected: true,
        currencies,
        selectedCurrency,
        address
      }));
    }
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