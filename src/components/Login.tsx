import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, Users, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  getUserAssignment: (username: string) => User | null;
}

export const Login: React.FC<LoginProps> = ({ onLogin, getUserAssignment }) => {
  const [username, setUsername] = useState('');
  const [assignedTeam, setAssignedTeam] = useState<number>(1);
  const [assignedAlliance, setAssignedAlliance] = useState<'red' | 'blue'>('red');
  const [assignedPosition, setAssignedPosition] = useState<number>(1);
  const [isAdminAssigned, setIsAdminAssigned] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    // Check for admin login
    if (username.trim() === 'admin6560') {
      const user: User = {
        username: username.trim(),
        assignedTeam: 0,
        assignedAlliance: 'red',
        assignedPosition: 1,
      };
      onLogin(user);
      return;
    }

    // Check if user is assigned by admin
    const adminAssignment = getUserAssignment(username.trim());
    if (adminAssignment) {
      onLogin(adminAssignment);
      return;
    }

    const user: User = {
      username: username.trim(),
      assignedTeam,
      assignedAlliance,
      assignedPosition,
    };

    onLogin(user);
  };

  // Check if username has admin assignment
  const checkAdminAssignment = (name: string) => {
    const assignment = getUserAssignment(name);
    setIsAdminAssigned(!!assignment);
    if (assignment) {
      setAssignedAlliance(assignment.assignedAlliance);
      setAssignedPosition(assignment.assignedPosition);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FRC Scouting</h1>
          <p className="text-gray-600 mt-2">Login to start scouting matches</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  checkAdminAssignment(e.target.value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>
          </div>

          {!isAdminAssigned && username.trim() !== 'admin6560' && (
            <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="alliance" className="block text-sm font-medium text-gray-700 mb-2">
                Alliance
              </label>
              <select
                id="alliance"
                value={assignedAlliance}
                onChange={(e) => setAssignedAlliance(e.target.value as 'red' | 'blue')}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="red">Red</option>
                <option value="blue">Blue</option>
              </select>
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
                Position
              </label>
              <select
                id="position"
                value={assignedPosition}
                onChange={(e) => setAssignedPosition(Number(e.target.value))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
          </div>
          )}

          {isAdminAssigned && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Admin Assignment Found:</strong> You are assigned to scout position {assignedPosition} of the {assignedAlliance} alliance.
              </p>
            </div>
          )}

          {username.trim() === 'admin6560' && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">
                <strong>Admin Login:</strong> You will access the administrative dashboard.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Login
          </button>
        </form>

        {!isAdminAssigned && username.trim() !== 'admin6560' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> You'll scout the team in position {assignedPosition} of the {assignedAlliance} alliance for each match.
          </p>
        </div>
        )}
      </div>
    </div>
  );
};