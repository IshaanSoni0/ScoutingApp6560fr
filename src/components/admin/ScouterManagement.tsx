import React, { useState } from 'react';
import { AdminScouter } from '../../types';
import { Plus, Trash2, Edit3, Check, X } from 'lucide-react';

interface ScouterManagementProps {
  scouters: AdminScouter[];
  onUpdateScouters: (scouters: AdminScouter[]) => void;
}

export const ScouterManagement: React.FC<ScouterManagementProps> = ({
  scouters,
  onUpdateScouters,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newScouter, setNewScouter] = useState({
    name: '',
    assignedAlliance: 'red' as 'red' | 'blue',
    assignedPosition: 1,
    status: 'in-person' as 'remote' | 'in-person' | 'not-scouting',
  });

  const handleAddScouter = () => {
    if (!newScouter.name.trim()) return;

    const scouter: AdminScouter = {
      id: Date.now().toString(),
      name: newScouter.name.trim(),
      assignedAlliance: newScouter.assignedAlliance,
      assignedPosition: newScouter.assignedPosition,
      status: newScouter.status,
    };

    onUpdateScouters([...scouters, scouter]);
    setNewScouter({
      name: '',
      assignedAlliance: 'red',
      assignedPosition: 1,
      status: 'in-person',
    });
    setShowAddForm(false);
  };

  const handleUpdateScouter = (id: string, updates: Partial<AdminScouter>) => {
    const updated = scouters.map(scouter =>
      scouter.id === id ? { ...scouter, ...updates } : scouter
    );
    onUpdateScouters(updated);
    setEditingId(null);
  };

  const handleDeleteScouter = (id: string) => {
    const updated = scouters.filter(scouter => scouter.id !== id);
    onUpdateScouters(updated);
    setDeleteConfirm(null);
  };

  const getAssignmentText = (alliance: 'red' | 'blue', position: number) => {
    return `${alliance.charAt(0).toUpperCase() + alliance.slice(1)} ${position}`;
  };

  const getStatusColor = (status: AdminScouter['status']) => {
    switch (status) {
      case 'in-person': return 'bg-green-100 text-green-800';
      case 'remote': return 'bg-blue-100 text-blue-800';
      case 'not-scouting': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Scouter Management</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Scouter
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Scouter</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newScouter.name}
                onChange={(e) => setNewScouter({ ...newScouter, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Scouter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alliance</label>
              <select
                value={newScouter.assignedAlliance}
                onChange={(e) => setNewScouter({ ...newScouter, assignedAlliance: e.target.value as 'red' | 'blue' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="red">Red</option>
                <option value="blue">Blue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select
                value={newScouter.assignedPosition}
                onChange={(e) => setNewScouter({ ...newScouter, assignedPosition: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={newScouter.status}
                onChange={(e) => setNewScouter({ ...newScouter, status: e.target.value as AdminScouter['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="in-person">In Person</option>
                <option value="remote">Remote</option>
                <option value="not-scouting">Not Scouting</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddScouter}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Add Scouter
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {scouters.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No scouters added yet. Click "Add Scouter" to get started.</p>
          </div>
        ) : (
          scouters.map((scouter) => (
            <div key={scouter.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{scouter.name}</h3>
                  <p className="text-sm text-gray-600">
                    Assignment: {getAssignmentText(scouter.assignedAlliance, scouter.assignedPosition)}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(scouter.status)}`}>
                  {scouter.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {editingId === scouter.id ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={scouter.assignedAlliance}
                      onChange={(e) => handleUpdateScouter(scouter.id, { assignedAlliance: e.target.value as 'red' | 'blue' })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="red">Red</option>
                      <option value="blue">Blue</option>
                    </select>
                    <select
                      value={scouter.assignedPosition}
                      onChange={(e) => handleUpdateScouter(scouter.id, { assignedPosition: Number(e.target.value) })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                    <select
                      value={scouter.status}
                      onChange={(e) => handleUpdateScouter(scouter.id, { status: e.target.value as AdminScouter['status'] })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="in-person">In Person</option>
                      <option value="remote">Remote</option>
                      <option value="not-scouting">Not Scouting</option>
                    </select>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingId(scouter.id)}
                      className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(scouter.id)}
                      className="p-2 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this scouter? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDeleteScouter(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};