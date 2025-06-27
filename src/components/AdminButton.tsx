import { useState } from 'react';
import { Settings } from 'lucide-react';
import { AdminPanel } from './AdminPanel';

interface AdminButtonProps {
  gameId: string;
  className?: string;
}

export function AdminButton({ gameId, className = '' }: AdminButtonProps) {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAdminPanel(true)}
        className={`p-2 text-gray-400 hover:text-white transition-colors opacity-50 hover:opacity-100 ${className}`}
        title="Admin Panel"
      >
        <Settings className="w-4 h-4" />
      </button>
      
      <AdminPanel
        gameId={gameId}
        isVisible={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </>
  );
}
