import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Casino } from './components/Casino';
import { Sportsbook } from './components/SportsbookNew';
import { WalletProvider } from './contexts/WalletContext';
import { GameProvider } from './contexts/GameContext';
import { AdminProvider } from './contexts/AdminContext';
import { SportsProvider } from './contexts/SportsContext';

function App() {
  return (
    <WalletProvider>
      <GameProvider>
        <AdminProvider>
          <SportsProvider>
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
          </SportsProvider>
        </AdminProvider>
      </GameProvider>
    </WalletProvider>
  );
}

export default App;