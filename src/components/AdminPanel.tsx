import React, { useState } from 'react';
import { X, Settings, Lock, Unlock, RotateCcw, Save } from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';

interface AdminPanelProps {
  gameId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function AdminPanel({ gameId, isVisible, onClose }: AdminPanelProps) {
  const { 
    isAdminAuthenticated, 
    authenticateAdmin, 
    logoutAdmin, 
    gameSettings, 
    updateGameSettings, 
    resetGameSettings 
  } = useAdmin();
  
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [tempSettings, setTempSettings] = useState(gameSettings[gameId] || {});

  if (!isVisible) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authenticateAdmin(pin)) {
      setPin('');
      setPinError('');
      setTempSettings(gameSettings[gameId] || {});
    } else {
      setPinError('Invalid PIN code');
      setPin('');
    }
  };

  const handleSettingChange = (key: string, value: number | boolean) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateGameSettings(gameId, tempSettings);
  };

  const handleReset = () => {
    resetGameSettings(gameId);
    setTempSettings(gameSettings[gameId]);
  };

  const handleLogout = () => {
    logoutAdmin();
    setPin('');
    setPinError('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAdminAuthenticated ? (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-4">
              <Lock className="w-4 h-4" />
              <span className="text-sm">Admin access required</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Enter PIN Code
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="****"
                maxLength={4}
              />
              {pinError && (
                <p className="text-red-400 text-sm mt-1">{pinError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Authenticate
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <Unlock className="w-4 h-4" />
                <span className="text-sm">Admin authenticated</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                {gameId} Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Win Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={tempSettings.winRate || 50}
                    onChange={(e) => handleSettingChange('winRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    House Edge (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.1"
                    value={tempSettings.houseEdge || 2.5}
                    onChange={(e) => handleSettingChange('houseEdge', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Bet
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={tempSettings.minBet || 1}
                      onChange={(e) => handleSettingChange('minBet', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Bet
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={tempSettings.maxBet || 1000}
                      onChange={(e) => handleSettingChange('maxBet', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Payout
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={tempSettings.maxPayout || 10000}
                    onChange={(e) => handleSettingChange('maxPayout', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-md text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Game Enabled
                  </label>
                  <button
                    onClick={() => handleSettingChange('enabled', !tempSettings.enabled)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      tempSettings.enabled
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    {tempSettings.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              
              <button
                onClick={handleReset}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
