import React from 'react';
import { User } from '../types';
import { Shield, Wifi, WifiOff, RefreshCw, LogOut } from 'lucide-react';

interface HeaderProps {
  user: User;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  unsyncedCount: number;
  onSync: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isOnline,
  syncStatus,
  unsyncedCount,
  onSync,
  onLogout,
}) => {
  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'syncing': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'syncing': return 'Syncing...';
      case 'success': return 'Synced';
      case 'error': return 'Sync Error';
      default: return unsyncedCount > 0 ? `${unsyncedCount} unsynced` : 'All synced';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">FRC Scouting</h1>
              <p className="text-sm text-gray-600">
                {user.username} • Position {user.assignedPosition} • {' '}
                <span className={user.assignedAlliance === 'red' ? 'text-red-600' : 'text-blue-600'}>
                  {user.assignedAlliance.toUpperCase()}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <div className="h-6 w-px bg-gray-300" />

            <button
              onClick={onSync}
              disabled={syncStatus === 'syncing'}
              className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                unsyncedCount > 0
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span className={getSyncStatusColor()}>
                {getSyncStatusText()}
              </span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};