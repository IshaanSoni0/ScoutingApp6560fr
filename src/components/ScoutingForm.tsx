import React, { useState } from 'react';
import { Match, User, ScoutingData } from '../types';
import { ArrowLeft, Save, Plus, Minus } from 'lucide-react';

interface ScoutingFormProps {
  match: Match;
  user: User;
  onSubmit: (data: Omit<ScoutingData, 'id' | 'timestamp' | 'synced'>) => void;
  onBack: () => void;
}

export const ScoutingForm: React.FC<ScoutingFormProps> = ({
  match,
  user,
  onSubmit,
  onBack,
}) => {
  const [l1Count, setL1Count] = useState(0);
  const [l2Count, setL2Count] = useState(0);
  const [l3Count, setL3Count] = useState(0);
  const [l4Count, setL4Count] = useState(0);
  const [climbStatus, setClimbStatus] = useState<'no-climb' | 'low-climb' | 'deep-climb'>('no-climb');
  const [notes, setNotes] = useState('');

  const getTeamToScout = (): number => {
    const teams = user.assignedAlliance === 'red' ? match.redTeams : match.blueTeams;
    return teams[user.assignedPosition - 1];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      matchNumber: match.matchNumber,
      teamNumber: getTeamToScout(),
      scouterUsername: user.username,
      l1Count,
      l2Count,
      l3Count,
      l4Count,
      climbStatus,
      notes: notes.trim() || undefined,
    });
  };

  const CounterButton: React.FC<{
    label: string;
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
  }> = ({ label, count, onIncrement, onDecrement }) => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">{label}</h3>
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onDecrement}
          disabled={count <= 0}
          className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-red-600 transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-3xl font-bold text-gray-900 min-w-[3rem] text-center">
          {count}
        </span>
        <button
          type="button"
          onClick={onIncrement}
          className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const teamToScout = getTeamToScout();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Matches
          </button>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-900">Match {match.matchNumber}</h2>
            <p className={`text-lg font-semibold ${
              user.assignedAlliance === 'red' ? 'text-red-600' : 'text-blue-600'
            }`}>
              Scouting Team {teamToScout}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <CounterButton
            label="L1"
            count={l1Count}
            onIncrement={() => setL1Count(l1Count + 1)}
            onDecrement={() => setL1Count(Math.max(0, l1Count - 1))}
          />
          <CounterButton
            label="L2"
            count={l2Count}
            onIncrement={() => setL2Count(l2Count + 1)}
            onDecrement={() => setL2Count(Math.max(0, l2Count - 1))}
          />
          <CounterButton
            label="L3"
            count={l3Count}
            onIncrement={() => setL3Count(l3Count + 1)}
            onDecrement={() => setL3Count(Math.max(0, l3Count - 1))}
          />
          <CounterButton
            label="L4"
            count={l4Count}
            onIncrement={() => setL4Count(l4Count + 1)}
            onDecrement={() => setL4Count(Math.max(0, l4Count - 1))}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Climb Status</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'no-climb', label: 'No Climb', color: 'bg-gray-500' },
              { value: 'low-climb', label: 'Low Climb', color: 'bg-yellow-500' },
              { value: 'deep-climb', label: 'Deep Climb', color: 'bg-green-500' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setClimbStatus(option.value as typeof climbStatus)}
                className={`py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  climbStatus === option.value
                    ? `${option.color} ring-2 ring-offset-2 ring-blue-500`
                    : `${option.color} opacity-60 hover:opacity-80`
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <label htmlFor="notes" className="block text-lg font-semibold text-gray-900 mb-3">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional observations..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-3"
        >
          <Save className="w-6 h-6" />
          Submit Scouting Data
        </button>
      </form>
    </div>
  );
};