import { ScoutingData, User, Match, AdminScouter } from '../types';

const STORAGE_KEYS = {
  USER: 'frc_scouting_user',
  MATCHES: 'frc_scouting_matches',
  SCOUTING_DATA: 'frc_scouting_data',
  ADMIN_SCOUTERS: 'frc_scouting_admin_scouters',
  SELECTED_EVENT: 'frc_scouting_selected_event',
};

export const storage = {
  saveUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getUser: (): User | null => {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  saveMatches: (matches: Match[]) => {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  },

  getMatches: (): Match[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return stored ? JSON.parse(stored) : [];
  },

  saveScoutingData: (data: ScoutingData[]) => {
    localStorage.setItem(STORAGE_KEYS.SCOUTING_DATA, JSON.stringify(data));
  },

  getScoutingData: (): ScoutingData[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.SCOUTING_DATA);
    return stored ? JSON.parse(stored) : [];
  },

  saveAdminScouters: (scouters: AdminScouter[]) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_SCOUTERS, JSON.stringify(scouters));
  },

  getAdminScouters: (): AdminScouter[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.ADMIN_SCOUTERS);
    return stored ? JSON.parse(stored) : [];
  },

  saveSelectedEvent: (eventKey: string) => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_EVENT, eventKey);
  },

  getSelectedEvent: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_EVENT);
  },

  addScoutingEntry: (entry: ScoutingData) => {
    const existing = storage.getScoutingData();
    const updated = [...existing, entry];
    storage.saveScoutingData(updated);
    return updated;
  },

  updateScoutingEntry: (id: string, updates: Partial<ScoutingData>) => {
    const existing = storage.getScoutingData();
    const updated = existing.map(entry => 
      entry.id === id ? { ...entry, ...updates } : entry
    );
    storage.saveScoutingData(updated);
    return updated;
  },

  getUnsyncedData: (): ScoutingData[] => {
    return storage.getScoutingData().filter(entry => !entry.synced);
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};