import React from 'react';
import { Match, User } from '../types';
import { Play, CheckCircle, Users } from 'lucide-react';

interface MatchListProps {
  matches: Match[];
  user: User;
  onSelectMatch: (match: Match) => void;
  scoutedMatches: number[];
}

export const MatchList: React.FC<MatchListProps> = ({ 
  matches, 
  user, 
  onSelectMatch,
  scoutedMatches 
}) => {
  const getTeamForUser = (match: Match): number => {
    const teams = user.assignedAlliance === 'red' ? match.redTeams : match.blueTeams;
    return teams[user.assignedPosition - 1];
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-600">
        <h3 className="font-semibold text-gray-900">Your Assignment</h3>
        <p className="text-gray-600 text-sm">
          Scouting position {user.assignedPosition} of the{' '}
          <span className={`font-medium ${user.assignedAlliance === 'red' ? 'text-red-600' : 'text-blue-600'}`}>
            {user.assignedAlliance}
          </span>{' '}
          alliance
        </p>
      </div>

      {matches.map((match) => {
        const teamToScout = getTeamForUser(match);
        const isCompleted = scoutedMatches.includes(match.matchNumber);
        
        return (
          <div
            key={match.matchNumber}
            className={`bg-white rounded-lg shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
              isCompleted 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => onSelectMatch(match)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Match {match.matchNumber}
                  </h3>
                  {isCompleted && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    user.assignedAlliance === 'red' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    Team {teamToScout}
                  </span>
                  {!isCompleted && <Play className="w-5 h-5 text-blue-600" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">Red Alliance</p>
                  <div className="flex gap-2">
                    {match.redTeams.map((team, idx) => (
                      <span
                        key={team}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.assignedAlliance === 'red' && idx === user.assignedPosition - 1
                            ? 'bg-red-600 text-white'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {team}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">Blue Alliance</p>
                  <div className="flex gap-2">
                    {match.blueTeams.map((team, idx) => (
                      <span
                        key={team}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.assignedAlliance === 'blue' && idx === user.assignedPosition - 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};