import React, { useState } from 'react';
import { AdminScouter } from '../../types';
import { Users, BarChart3, Calendar, Shield } from 'lucide-react';
import { ScouterManagement } from './ScouterManagement';
import { DataAnalysis } from './DataAnalysis';
import { MatchAssignment } from './MatchAssignment';

interface AdminDashboardProps {
  adminScouters: AdminScouter[];
  onUpdateScouters: (scouters: AdminScouter[]) => void;
  onLogout: () => void;
  selectedEvent: string | null;
  onEventSelect: (eventKey: string) => void;
}

type AdminTab = 'scouters' | 'analysis' | 'matches';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminScouters,
  onUpdateScouters,
  onLogout,
  selectedEvent,
  onEventSelect,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('scouters');

  const tabs = [
    { id: 'scouters' as AdminTab, label: 'Assign Scouters', icon: Users },
    { id: 'analysis' as AdminTab, label: 'Analyze Data', icon: BarChart3 },
    { id: 'matches' as AdminTab, label: 'Assign Matches', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FRC Scouting Admin</h1>
                <p className="text-sm text-gray-600">Administrative Dashboard</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          {activeTab === 'scouters' && (
            <ScouterManagement
              scouters={adminScouters}
              onUpdateScouters={onUpdateScouters}
            />
          )}
          {activeTab === 'analysis' && (
            <DataAnalysis selectedEvent={selectedEvent} />
          )}
          {activeTab === 'matches' && (
            <MatchAssignment
              selectedEvent={selectedEvent}
              onEventSelect={onEventSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
};