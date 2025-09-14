import { ScoutingData } from '../types';

// This would typically connect to a Google Apps Script endpoint
const SHEETS_ENDPOINT = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

export const sheets = {
  syncData: async (data: ScoutingData[]): Promise<boolean> => {
    try {
      // In a real implementation, you'd replace this with your Google Apps Script URL
      console.log('Syncing data to Google Sheets:', data);
      
      // Simulate API call
      const response = await fetch(SHEETS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync data');
      }

      return true;
    } catch (error) {
      console.error('Error syncing to Google Sheets:', error);
      return false;
    }
  },

  testConnection: async (): Promise<boolean> => {
    try {
      // Test if we can reach the Google Sheets endpoint
      const response = await fetch(SHEETS_ENDPOINT + '?test=true');
      return response.ok;
    } catch {
      return false;
    }
  }
};

// Mock data for development - replace with real match data
export const getMockMatches = () => [
  {
    matchNumber: 1,
    redTeams: [1234, 5678, 9012] as [number, number, number],
    blueTeams: [3456, 7890, 1357] as [number, number, number],
  },
  {
    matchNumber: 2,
    redTeams: [2468, 1357, 9753] as [number, number, number],
    blueTeams: [8642, 1234, 5678] as [number, number, number],
  },
  {
    matchNumber: 3,
    redTeams: [7890, 3456, 2468] as [number, number, number],
    blueTeams: [9012, 9753, 8642] as [number, number, number],
  },
];