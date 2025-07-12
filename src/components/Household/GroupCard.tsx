import React, { useState } from 'react';
import { Users, Crown, Calendar, Edit2, Trash2, UserPlus } from 'lucide-react';
import { HouseholdGroup, HouseholdMember } from '../../types';
import { usePrepper } from '../../context/PrepperContext';

interface GroupCardProps {
  group: HouseholdGroup;
  members: HouseholdMember[];
  viewMode: 'grid' | 'list';
}

export default function GroupCard({ group, members, viewMode }: GroupCardProps) {
  const { dispatch } = usePrepper();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    dispatch({ type: 'DELETE_HOUSEHOLD_GROUP', payload: group.id });
    setShowDeleteConfirm(false);
  };

  const leader = members.find(member => member.id === group.leader);
  const totalCalories = members.reduce((sum, member) => sum + member.dailyCalories, 0);
  const totalWater = members.reduce((sum, member) => sum + member.dailyWaterLiters, 0);

  const getGroupTypeColor = (type: string) => {
    switch (type) {
      case 'family': return 'text-blue-600 bg-blue-100';
      case 'team': return 'text-green-600 bg-green-100';
      case 'skill': return 'text-purple-600 bg-purple-100';
      case 'location': return 'text-orange-600 bg-orange-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg p-6 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-${group.color}-100 rounded-full flex items-center justify-center`}>
              <Users className={`h-6 w-6 text-${group.color}-600`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-800">{group.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGroupTypeColor(group.groupType)}`}>
                  {group.groupType}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>{members.length} members</span>
                {leader && (
                  <div className="flex items-center space-x-1">
                    <Crown className="h-3 w-3 text-yellow-600" />
                    <span>{leader.name}</span>
                  </div>
                )}
                <span>{totalCalories} cal/day</span>
                <span>{totalWater.toFixed(1)}L water/day</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Edit2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Group</h3>
              <p className="text-slate-600 mb-4">Are you sure you want to delete "{group.name}"? Members will be ungrouped but not deleted.</p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-${group.color}-100 rounded-full flex items-center justify-center`}>
            <Users className={`h-6 w-6 text-${group.color}-600`} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{group.name}</h3>
            <p className="text-sm text-slate-600">{members.length} members</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getGroupTypeColor(group.groupType)}`}>
          {group.groupType}
        </span>
      </div>

      {group.description && (
        <p className="text-sm text-slate-600 mb-4">{group.description}</p>
      )}

      <div className="space-y-3 mb-4">
        {leader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-slate-600">Leader</span>
            </div>
            <span className="text-sm font-medium text-slate-800">{leader.name}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">Daily Calories</span>
          </div>
          <span className="text-sm font-medium text-slate-800">{totalCalories.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">Daily Water</span>
          </div>
          <span className="text-sm font-medium text-slate-800">{totalWater.toFixed(1)}L</span>
        </div>
      </div>

      {members.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h4 className="text-sm font-medium text-slate-700 mb-2">Members</h4>
          <div className="space-y-2">
            {members.slice(0, 3).map(member => (
              <div key={member.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{member.name}</span>
                <span className="text-slate-500">{member.age}y</span>
              </div>
            ))}
            {members.length > 3 && (
              <div className="text-xs text-slate-500">
                +{members.length - 3} more members
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Created {new Date(group.createdDate).toLocaleDateString()}</span>
          <button className="flex items-center space-x-1 text-green-600 hover:text-green-700">
            <UserPlus className="h-3 w-3" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Group</h3>
            <p className="text-slate-600 mb-4">Are you sure you want to delete "{group.name}"? Members will be ungrouped but not deleted.</p>
            <div className="flex space-x-3">
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}