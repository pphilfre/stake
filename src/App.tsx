import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Hero } from './components/Hero'
import { Casino } from './components/Casino'
import { WalletProvider } from './contexts/WalletContext'
import { GameProvider } from './contexts/GameContext'
import { AdminProvider } from './contexts/AdminContext'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <GameProvider>
          <AdminProvider>
            <Router>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <Header />
                <Routes>
                  <Route path="/" element={<Hero />} />
                  <Route path="/casino" element={<Casino />} />
                </Routes>
              </div>
            </Router>
          </AdminProvider>
        </GameProvider>
      </WalletProvider>
    </AuthProvider>
  )
}

export default App