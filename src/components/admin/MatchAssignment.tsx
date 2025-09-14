import React, { useState, useEffect } from 'react';
import { Competition, Match } from '../../types';
import { blueAlliance } from '../../utils/blueAlliance';
import { storage } from '../../utils/storage';
import { Search, Calendar, Download, CheckCircle } from 'lucide-react';

interface MatchAssignmentProps {
  selectedEvent: string | null;
  onEventSelect: (eventKey: string) => void;
}

export const MatchAssignment: React.FC<MatchAssignmentProps> = ({
  selectedEvent,
  onEventSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (selectedEvent) {
      loadMatches(selectedEvent);
    }
  }, [selectedEvent]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const results = await blueAlliance.searchEvents(currentYear, searchTerm);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching events:', error);
    }
    setLoading(false);
  };

  const loadMatches = async (eventKey: string) => {
    setLoadingMatches(true);
    try {
      const eventMatches = await blueAlliance.getEventMatches(eventKey);
      setMatches(eventMatches);
    } catch (error) {
      console.error('Error loading matches:', error);
    }
    setLoadingMatches(false);
  };

  const handleSelectEvent = async (event: Competition) => {
    onEventSelect(event.key);
    storage.saveSelectedEvent(event.key);
    await loadMatches(event.key);
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleLoadMatches = () => {
    if (matches.length > 0) {
      storage.saveMatches(matches);
      // Force a page reload to update the main app with new matches
      window.location.reload();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Assignment</h2>

      <div className="space-y-6">
        {/* Event Search */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Search for Competition</h3>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for FRC events (e.g., 'Silicon Valley Regional')"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Searching {currentYear} FRC events using The Blue Alliance API
          </p>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Search Results</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {searchResults.map((event) => (
                <div
                  key={event.key}
                  className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectEvent(event)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.name}</h4>
                      <p className="text-sm text-gray-600">
                        {event.event_code.toUpperCase()} • {formatDate(event.start_date)} - {formatDate(event.end_date)}
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Event and Matches */}
        {selectedEvent && (
          <div className="bg-white border rounded-lg">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Selected Event</h3>
                  <p className="text-gray-600">{selectedEvent}</p>
                </div>
                {matches.length > 0 && (
                  <button
                    onClick={handleLoadMatches}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Load {matches.length} Matches for Scouters
                  </button>
                )}
              </div>
            </div>

            {loadingMatches ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading matches from The Blue Alliance...</p>
              </div>
            ) : matches.length > 0 ? (
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    Qualification Matches ({matches.length})
                  </h4>
                  <div className="text-sm text-gray-600">
                    {matches.filter(m => m.completed).length} completed, {matches.filter(m => !m.completed).length} upcoming
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {matches.map((match) => (
                    <div
                      key={match.matchNumber}
                      className={`p-3 border rounded-lg ${
                        match.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-900">
                          Match {match.matchNumber}
                        </h5>
                        {match.completed && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-red-600 font-medium">Red:</span>
                          <div className="flex gap-1 mt-1">
                            {match.redTeams.map((team, idx) => (
                              <span
                                key={team}
                                className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs"
                              >
                                {team}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="text-blue-600 font-medium">Blue:</span>
                          <div className="flex gap-1 mt-1">
                            {match.blueTeams.map((team, idx) => (
                              <span
                                key={team}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                              >
                                {team}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No matches found for this event.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};