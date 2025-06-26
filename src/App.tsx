import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Casino } from './components/Casino';
import { Sportsbook } from './components/Sportsbook';
import { WalletProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';

function App() {
  return (
    <WalletProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
            <Header />
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/casino" element={<Casino />} />
              <Route path="/sportsbook" element={<Sportsbook />} />
            </Routes>
          </div>
        </Router>
      </GameProvider>
    </WalletProvider>
  );
}

export default App;