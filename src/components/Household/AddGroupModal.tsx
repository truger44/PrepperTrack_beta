import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { HouseholdGroup } from '../../types';

interface AddGroupModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function AddGroupModal({ onClose, onSave }: AddGroupModalProps) {
  const { state, dispatch } = usePrepper();
  const { household } = state;
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    groupType: 'family' as 'family' | 'team' | 'skill' | 'location' | 'custom',
    leader: '',
    memberIds: [] as string[],
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberToggle = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGroup: HouseholdGroup = {
      id: Date.now().toString(),
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
      groupType: formData.groupType,
      memberIds: formData.memberIds,
      leader: formData.leader || undefined,
      createdDate: new Date().toISOString().split('T')[0],
    };

    dispatch({ type: 'ADD_HOUSEHOLD_GROUP', payload: newGroup });

    // Update members to assign them to this group
    formData.memberIds.forEach(memberId => {
      const member = household.find(m => m.id === memberId);
      if (member) {
        dispatch({ 
          type: 'UPDATE_HOUSEHOLD_MEMBER', 
          payload: { ...member, groupId: newGroup.id }
        });
      }
    });

    onSave();
  };

  const colors = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
  ];

  const groupTypes = [
    { value: 'family', label: 'Family', description: 'Related family members' },
    { value: 'team', label: 'Team', description: 'Working team or unit' },
    { value: 'skill', label: 'Skill Group', description: 'Members with similar skills' },
    { value: 'location', label: 'Location', description: 'Members in same location' },
    { value: 'custom', label: 'Custom', description: 'Custom grouping' },
  ];

  const availableMembers = household.filter(member => 
    formData.memberIds.includes(member.id) || !member.groupId
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Create New Group</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Group Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Core Family, Security Team"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Brief description of the group's purpose..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Group Type *
              </label>
              <select
                required
                value={formData.groupType}
                onChange={(e) => handleInputChange('groupType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {groupTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label} - {type.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Color Theme *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleInputChange('color', color.value)}
                    className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      formData.color === color.value
                        ? 'border-slate-400 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${color.class}`}></div>
                    <span className="text-sm">{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Group Members
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {availableMembers.length === 0 ? (
                  <p className="text-slate-500 text-sm">No available members to add</p>
                ) : (
                  availableMembers.map(member => (
                    <label key={member.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.memberIds.includes(member.id)}
                        onChange={() => handleMemberToggle(member.id)}
                        className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-800">{member.name}</span>
                        <span className="text-xs text-slate-500 ml-2">{member.age} years</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {formData.memberIds.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Group Leader
                </label>
                <select
                  value={formData.leader}
                  onChange={(e) => handleInputChange('leader', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">No Leader</option>
                  {formData.memberIds.map(memberId => {
                    const member = household.find(m => m.id === memberId);
                    return member ? (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ) : null;
                  })}
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>Create Group</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}