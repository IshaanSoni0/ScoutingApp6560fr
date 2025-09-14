import React, { useState, useEffect, useCallback } from 'react';
import { AppState, Match, ScoutingData, User, AdminScouter } from './types';
import { storage } from './utils/storage';
import { sheets, getMockMatches } from './utils/sheets';
import { Login } from './components/Login';
import { Header } from './components/Header';
import { MatchList } from './components/MatchList';
import { ScoutingForm } from './components/ScoutingForm';
import { AdminDashboard } from './components/admin/AdminDashboard';

function App() {
  const [appState, setAppState] = useState<AppState>({
    user: null,
    matches: [],
    scoutingData: [],
    currentMatch: null,
    isOnline: navigator.onLine,
    syncStatus: 'idle',
    isAdmin: false,
    adminScouters: [],
    selectedEvent: null,
  });

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  // Load saved data on mount
  useEffect(() => {
    const savedUser = storage.getUser();
    const savedMatches = storage.getMatches();
    const savedScoutingData = storage.getScoutingData();
    const savedAdminScouters = storage.getAdminScouters();
    const savedSelectedEvent = storage.getSelectedEvent();

    setAppState(prev => ({
      ...prev,
      user: savedUser,
      matches: savedMatches.length > 0 ? savedMatches : getMockMatches(),
      scoutingData: savedScoutingData,
      adminScouters: savedAdminScouters,
      selectedEvent: savedSelectedEvent,
    }));

    // Save mock matches if no matches exist
    if (savedMatches.length === 0) {
      storage.saveMatches(getMockMatches());
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setAppState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setAppState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = useCallback((user: User) => {
    const isAdmin = user.username === 'admin6560';
    storage.saveUser(user);
    setAppState(prev => ({ ...prev, user, isAdmin }));
  }, []);

  const handleLogout = useCallback(() => {
    storage.clearAll();
    setAppState({
      user: null,
      matches: getMockMatches(),
      scoutingData: [],
      currentMatch: null,
      isOnline: navigator.onLine,
      syncStatus: 'idle',
      isAdmin: false,
      adminScouters: [],
      selectedEvent: null,
    });
  }, []);

  const handleUpdateScouters = useCallback((scouters: AdminScouter[]) => {
    storage.saveAdminScouters(scouters);
    setAppState(prev => ({ ...prev, adminScouters: scouters }));
  }, []);

  const handleEventSelect = useCallback((eventKey: string) => {
    storage.saveSelectedEvent(eventKey);
    setAppState(prev => ({ ...prev, selectedEvent: eventKey }));
  }, []);

  const handleSelectMatch = useCallback((match: Match) => {
    setAppState(prev => ({ ...prev, currentMatch: match }));
  }, []);

  const handleBackToMatches = useCallback(() => {
    setAppState(prev => ({ ...prev, currentMatch: null }));
  }, []);

  const syncData = useCallback(async () => {
    if (!appState.isOnline) {
      console.log('Cannot sync while offline');
      return;
    }

    const unsyncedData = storage.getUnsyncedData();
    if (unsyncedData.length === 0) {
      setAppState(prev => ({ ...prev, syncStatus: 'success' }));
      return;
    }

    setAppState(prev => ({ ...prev, syncStatus: 'syncing' }));

    try {
      const success = await sheets.syncData(unsyncedData);
      
      if (success) {
        // Mark all unsynced data as synced
        const updatedData = appState.scoutingData.map(entry => 
          entry.synced ? entry : { ...entry, synced: true }
        );
        storage.saveScoutingData(updatedData);
        
        setAppState(prev => ({ 
          ...prev, 
          scoutingData: updatedData,
          syncStatus: 'success'
        }));
      } else {
        setAppState(prev => ({ ...prev, syncStatus: 'error' }));
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setAppState(prev => ({ ...prev, syncStatus: 'error' }));
    }

    // Reset sync status after 3 seconds
    setTimeout(() => {
      setAppState(prev => ({ ...prev, syncStatus: 'idle' }));
    }, 3000);
  }, [appState.isOnline, appState.scoutingData]);

  const handleScoutingSubmit = useCallback(async (data: Omit<ScoutingData, 'id' | 'timestamp' | 'synced'>) => {
    const newEntry: ScoutingData = {
      ...data,
      id: `${data.matchNumber}-${data.teamNumber}-${Date.now()}`,
      timestamp: Date.now(),
      synced: false,
      eventKey: appState.selectedEvent || undefined,
    };

    const updatedData = storage.addScoutingEntry(newEntry);
    setAppState(prev => ({ 
      ...prev, 
      scoutingData: updatedData,
      currentMatch: null
    }));

    // Attempt to sync immediately if online
    if (appState.isOnline) {
      setTimeout(() => syncData(), 500);
    }
  }, [appState.isOnline, appState.selectedEvent, syncData]);

  // Check if user should be assigned based on admin scouters
  const getUserAssignment = useCallback((username: string): User | null => {
    const adminScouter = appState.adminScouters.find(s => s.name.toLowerCase() === username.toLowerCase());
    if (adminScouter) {
      return {
        username,
        assignedTeam: 0, // Will be determined by match
        assignedAlliance: adminScouter.assignedAlliance,
        assignedPosition: adminScouter.assignedPosition,
      };
    }
    return null;
  }, [appState.adminScouters]);

  const unsyncedCount = appState.scoutingData.filter(entry => !entry.synced).length;
  const scoutedMatches = appState.scoutingData.map(entry => entry.matchNumber);

  if (!appState.user) {
    return (
      <Login 
        onLogin={handleLogin} 
        getUserAssignment={getUserAssignment}
      />
    );
  }

  if (appState.isAdmin) {
    return (
      <AdminDashboard
        adminScouters={appState.adminScouters}
        onUpdateScouters={handleUpdateScouters}
        onLogout={handleLogout}
        selectedEvent={appState.selectedEvent}
        onEventSelect={handleEventSelect}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={appState.user}
        isOnline={appState.isOnline}
        syncStatus={appState.syncStatus}
        unsyncedCount={unsyncedCount}
        onSync={syncData}
        onLogout={handleLogout}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-6">
        {appState.currentMatch ? (
          <ScoutingForm
            match={appState.currentMatch}
            user={appState.user}
            onSubmit={handleScoutingSubmit}
            onBack={handleBackToMatches}
          />
        ) : (
          <MatchList
            matches={appState.matches}
            user={appState.user}
            onSelectMatch={handleSelectMatch}
            scoutedMatches={scoutedMatches}
          />
        )}
      </main>
    </div>
  );
}

export default App;