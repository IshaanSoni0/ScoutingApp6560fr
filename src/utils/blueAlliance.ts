import { Competition, BlueAllianceMatch, Match } from '../types';

const BASE_URL = 'https://www.thebluealliance.com/api/v3';

// Using public API - no auth header needed for basic endpoints
const headers = {
  'X-TBA-Auth-Key': 'frc-scouting-app-v1', // Simple identifier for public API
};

export const blueAlliance = {
  searchEvents: async (year: number, searchTerm: string): Promise<Competition[]> => {
    try {
      const response = await fetch(`${BASE_URL}/events/${year}`, { headers });
      if (!response.ok) throw new Error('Failed to fetch events');
      
      const events = await response.json();
      
      return events
        .filter((event: any) => 
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.event_code.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map((event: any) => ({
          key: event.key,
          name: event.name,
          event_code: event.event_code,
          year: event.year,
          start_date: event.start_date,
          end_date: event.end_date,
        }));
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    }
  },

  getEventMatches: async (eventKey: string): Promise<Match[]> => {
    try {
      const response = await fetch(`${BASE_URL}/event/${eventKey}/matches`, { headers });
      if (!response.ok) throw new Error('Failed to fetch matches');
      
      const matches = await response.json();
      
      return matches
        .filter((match: BlueAllianceMatch) => match.comp_level === 'qm') // Only qualification matches
        .sort((a: BlueAllianceMatch, b: BlueAllianceMatch) => a.match_number - b.match_number)
        .map((match: BlueAllianceMatch) => ({
          matchNumber: match.match_number,
          redTeams: match.alliances.red.team_keys.map(key => parseInt(key.replace('frc', ''))) as [number, number, number],
          blueTeams: match.alliances.blue.team_keys.map(key => parseInt(key.replace('frc', ''))) as [number, number, number],
          eventKey,
          blueAllianceKey: match.key,
          completed: match.winning_alliance !== '',
        }));
    } catch (error) {
      console.error('Error fetching event matches:', error);
      return [];
    }
  },

  getTeamEventStats: async (eventKey: string, teamNumber: number) => {
    try {
      const response = await fetch(`${BASE_URL}/team/frc${teamNumber}/event/${eventKey}/status`, { headers });
      if (!response.ok) return null;
      
      const status = await response.json();
      return {
        rank: status.qual?.ranking?.rank || null,
        record: status.qual?.ranking?.record || null,
      };
    } catch (error) {
      console.error('Error fetching team stats:', error);
      return null;
    }
  },

  getEventRankings: async (eventKey: string) => {
    try {
      const response = await fetch(`${BASE_URL}/event/${eventKey}/rankings`, { headers });
      if (!response.ok) return [];
      
      const rankings = await response.json();
      return rankings.rankings || [];
    } catch (error) {
      console.error('Error fetching rankings:', error);
      return [];
    }
  }
};