import React, { useState, useEffect } from 'react';
import { ScoutingData } from '../../types';
import { storage } from '../../utils/storage';
import { blueAlliance } from '../../utils/blueAlliance';
import { BarChart3, TrendingUp, Filter } from 'lucide-react';

interface DataAnalysisProps {
  selectedEvent: string | null;
}

interface TeamStats {
  teamNumber: number;
  matchCount: number;
  avgL1: number;
  avgL2: number;
  avgL3: number;
  avgL4: number;
  totalScore: number;
  climbStats: {
    'no-climb': number;
    'low-climb': number;
    'deep-climb': number;
  };
  rank: number | null;
}

export const DataAnalysis: React.FC<DataAnalysisProps> = ({ selectedEvent }) => {
  const [scoutingData, setScoutingData] = useState<ScoutingData[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats[]>([]);
  const [sortBy, setSortBy] = useState<keyof TeamStats>('totalScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterClimb, setFilterClimb] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedEvent]);

  const loadData = async () => {
    setLoading(true);
    const allData = storage.getScoutingData();
    const filteredData = selectedEvent 
      ? allData.filter(data => data.eventKey === selectedEvent)
      : allData;
    
    setScoutingData(filteredData);
    await calculateTeamStats(filteredData);
    setLoading(false);
  };

  const calculateTeamStats = async (data: ScoutingData[]) => {
    const teamMap = new Map<number, ScoutingData[]>();
    
    data.forEach(entry => {
      if (!teamMap.has(entry.teamNumber)) {
        teamMap.set(entry.teamNumber, []);
      }
      teamMap.get(entry.teamNumber)!.push(entry);
    });

    const stats: TeamStats[] = [];
    
    for (const [teamNumber, entries] of teamMap) {
      const matchCount = entries.length;
      const totalL1 = entries.reduce((sum, e) => sum + e.l1Count, 0);
      const totalL2 = entries.reduce((sum, e) => sum + e.l2Count, 0);
      const totalL3 = entries.reduce((sum, e) => sum + e.l3Count, 0);
      const totalL4 = entries.reduce((sum, e) => sum + e.l4Count, 0);
      
      const climbStats = {
        'no-climb': entries.filter(e => e.climbStatus === 'no-climb').length,
        'low-climb': entries.filter(e => e.climbStatus === 'low-climb').length,
        'deep-climb': entries.filter(e => e.climbStatus === 'deep-climb').length,
      };

      // Get team ranking if event is selected
      let rank = null;
      if (selectedEvent) {
        try {
          const teamStats = await blueAlliance.getTeamEventStats(selectedEvent, teamNumber);
          rank = teamStats?.rank || null;
        } catch (error) {
          console.error('Error fetching team rank:', error);
        }
      }

      stats.push({
        teamNumber,
        matchCount,
        avgL1: totalL1 / matchCount,
        avgL2: totalL2 / matchCount,
        avgL3: totalL3 / matchCount,
        avgL4: totalL4 / matchCount,
        totalScore: (totalL1 + totalL2 + totalL3 + totalL4) / matchCount,
        climbStats,
        rank,
      });
    }

    setTeamStats(stats);
  };

  const handleSort = (field: keyof TeamStats) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedStats = teamStats
    .filter(team => {
      if (filterClimb === 'all') return true;
      const climbType = filterClimb as keyof typeof team.climbStats;
      return team.climbStats[climbType] > 0;
    })
    .sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const SortButton: React.FC<{ field: keyof TeamStats; children: React.ReactNode }> = ({ field, children }) => (
    <button
      onClick={() => handleSort(field)}
      className={`text-left font-medium hover:text-blue-600 transition-colors ${
        sortBy === field ? 'text-blue-600' : 'text-gray-700'
      }`}
    >
      {children}
      {sortBy === field && (
        <span className="ml-1">
          {sortOrder === 'asc' ? '↑' : '↓'}
        </span>
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading data analysis...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Analysis</h2>
          {selectedEvent && (
            <p className="text-gray-600">Event: {selectedEvent}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={filterClimb}
              onChange={(e) => setFilterClimb(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Teams</option>
              <option value="no-climb">No Climb</option>
              <option value="low-climb">Low Climb</option>
              <option value="deep-climb">Deep Climb</option>
            </select>
          </div>
        </div>
      </div>

      {scoutingData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No scouting data available for analysis.</p>
          {!selectedEvent && (
            <p className="text-sm mt-2">Select an event in the "Assign Matches" tab to filter data.</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="teamNumber">Team</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="rank">Rank</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="matchCount">Matches</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="avgL1">Avg L1</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="avgL2">Avg L2</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="avgL3">Avg L3</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="avgL4">Avg L4</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton field="totalScore">Total Avg</SortButton>
                  </th>
                  <th className="px-4 py-3 text-left">Climb Stats</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAndSortedStats.map((team) => (
                  <tr key={team.teamNumber} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-blue-600">
                      {team.teamNumber}
                    </td>
                    <td className="px-4 py-3">
                      {team.rank ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          #{team.rank}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{team.matchCount}</td>
                    <td className="px-4 py-3">{team.avgL1.toFixed(1)}</td>
                    <td className="px-4 py-3">{team.avgL2.toFixed(1)}</td>
                    <td className="px-4 py-3">{team.avgL3.toFixed(1)}</td>
                    <td className="px-4 py-3">{team.avgL4.toFixed(1)}</td>
                    <td className="px-4 py-3 font-semibold">{team.totalScore.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          No: {team.climbStats['no-climb']}
                        </span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                          Low: {team.climbStats['low-climb']}
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          Deep: {team.climbStats['deep-climb']}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredAndSortedStats.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Top Scorer</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              Team {filteredAndSortedStats[0]?.teamNumber}
            </p>
            <p className="text-sm text-blue-700">
              {filteredAndSortedStats[0]?.totalScore.toFixed(1)} avg points
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">Most Matches</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {Math.max(...filteredAndSortedStats.map(t => t.matchCount))} matches
            </p>
            <p className="text-sm text-green-700">
              Team {filteredAndSortedStats.find(t => t.matchCount === Math.max(...filteredAndSortedStats.map(t => t.matchCount)))?.teamNumber}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Teams Analyzed</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {filteredAndSortedStats.length}
            </p>
            <p className="text-sm text-purple-700">
              {scoutingData.length} total data points
            </p>
          </div>
        </div>
      )}
    </div>
  );
};