import React, { createContext, useContext, useState, useEffect } from 'react';

interface WalletContextType {
  isConnected: boolean;
  balance: number;
  address: string;
  connect: () => void;
  disconnect: () => void;
  deposit: (amount: number) => void;
  withdraw: (amount: number) => void;
  updateBalance: (amount: number) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState('');

  useEffect(() => {
    // Simulate wallet connection persistence
    const savedWallet = localStorage.getItem('wallet');
    if (savedWallet) {
      const walletData = JSON.parse(savedWallet);
      setIsConnected(walletData.isConnected);
      setBalance(walletData.balance);
      setAddress(walletData.address);
    }
  }, []);

  const connect = () => {
    // Simulate wallet connection
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    const mockBalance = Math.random() * 1000;
    
    setIsConnected(true);
    setBalance(mockBalance);
    setAddress(mockAddress);
    
    localStorage.setItem('wallet', JSON.stringify({
      isConnected: true,
      balance: mockBalance,
      address: mockAddress
    }));
  };

  const disconnect = () => {
    setIsConnected(false);
    setBalance(0);
    setAddress('');
    localStorage.removeItem('wallet');
  };

  const deposit = (amount: number) => {
    const newBalance = balance + amount;
    setBalance(newBalance);
    localStorage.setItem('wallet', JSON.stringify({
      isConnected: true,
      balance: newBalance,
      address
    }));
  };

  const withdraw = (amount: number) => {
    if (amount <= balance) {
      const newBalance = balance - amount;
      setBalance(newBalance);
      localStorage.setItem('wallet', JSON.stringify({
        isConnected: true,
        balance: newBalance,
        address
      }));
    }
  };

  const updateBalance = (amount: number) => {
    const newBalance = Math.max(0, balance + amount);
    setBalance(newBalance);
    localStorage.setItem('wallet', JSON.stringify({
      isConnected: true,
      balance: newBalance,
      address
    }));
  };

  return (
    <WalletContext.Provider value={{
      isConnected,
      balance,
      address,
      connect,
      disconnect,
      deposit,
      withdraw,
      updateBalance
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