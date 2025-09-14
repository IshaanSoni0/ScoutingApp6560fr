export interface User {
  username: string;
  assignedTeam: number;
  assignedAlliance: 'red' | 'blue';
  assignedPosition: number; // 1, 2, or 3 for alliance position
}

export interface AdminScouter {
  id: string;
  name: string;
  assignedAlliance: 'red' | 'blue';
  assignedPosition: number;
  status: 'remote' | 'in-person' | 'not-scouting';
}

export interface Competition {
  key: string;
  name: string;
  event_code: string;
  year: number;
  start_date: string;
  end_date: string;
}

export interface BlueAllianceMatch {
  key: string;
  comp_level: string;
  set_number: number;
  match_number: number;
  alliances: {
    red: {
      team_keys: string[];
      score: number;
    };
    blue: {
      team_keys: string[];
      score: number;
    };
  };
  winning_alliance: string;
}

export interface Match {
  matchNumber: number;
  redTeams: [number, number, number];
  blueTeams: [number, number, number];
  completed?: boolean;
  eventKey?: string;
  blueAllianceKey?: string;
}

export interface ScoutingData {
  id: string;
  matchNumber: number;
  teamNumber: number;
  scouterUsername: string;
  timestamp: number;
  l1Count: number;
  l2Count: number;
  l3Count: number;
  l4Count: number;
  climbStatus: 'no-climb' | 'low-climb' | 'deep-climb';
  notes?: string;
  synced: boolean;
  eventKey?: string;
}

export interface AppState {
  user: User | null;
  matches: Match[];
  scoutingData: ScoutingData[];
  currentMatch: Match | null;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  isAdmin: boolean;
  adminScouters: AdminScouter[];
  selectedEvent: string | null;
}