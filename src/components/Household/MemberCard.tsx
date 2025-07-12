import React, { useState } from 'react';
import { User, Calendar, Activity, Droplets, Heart, Shield, Edit2, Trash2, Phone, Award, Briefcase } from 'lucide-react';
import { HouseholdMember, HouseholdGroup } from '../../types';
import { usePrepper } from '../../context/PrepperContext';
import { medicalConditions, getCategoryColor, getCategoryIcon } from '../../data/medicalConditionsData';
import RequiredSuppliesDisplay from './RequiredSuppliesDisplay';

interface MemberCardProps {
  member: HouseholdMember;
  group?: HouseholdGroup;
  viewMode: 'grid' | 'list';
}

export default function MemberCard({ member, group, viewMode }: MemberCardProps) {
  const { dispatch } = usePrepper();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get required supplies for this member's medical conditions
  const getRequiredSupplies = () => {
    const allSupplies = new Set<string>();
    member.medicalConditions?.forEach(conditionName => {
      const condition = medicalConditions.find(c => c.name === conditionName);
      if (condition) {
        condition.requiredSupplies.forEach(supply => allSupplies.add(supply));
      }
    });
    return Array.from(allSupplies);
  };

  const handleDelete = () => {
    // Check if member has medical conditions with required supplies
    const requiredSupplies = getRequiredSupplies();
    if (requiredSupplies.length > 0) {
      const confirmDelete = window.confirm(
        `${member.name} has medical conditions that require supplies. Deleting this member will remove their requirements from the medical inventory. Continue?`
      );
      if (!confirmDelete) {
        setShowDeleteConfirm(false);
        return;
      }
    }
    
    dispatch({ type: 'DELETE_HOUSEHOLD_MEMBER', payload: member.id });
    setShowDeleteConfirm(false);
  };

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'sedentary': return 'text-slate-600 bg-slate-100';
      case 'light': return 'text-blue-600 bg-blue-100';
      case 'moderate': return 'text-green-600 bg-green-100';
      case 'active': return 'text-orange-600 bg-orange-100';
      case 'very_active': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getAgeGroup = (age: number) => {
    if (age < 13) return 'Child';
    if (age < 18) return 'Teen';
    if (age < 65) return 'Adult';
    return 'Senior';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-slate-800">{member.name}</h3>
                {group && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${group.color}-100 text-${group.color}-700`}>
                    {group.name}
                  </span>
                )}
                {group?.leader === member.id && (
                  <Shield className="h-4 w-4 text-yellow-600" title="Group Leader" />
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>{member.age} years • {getAgeGroup(member.age)}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${getActivityLevelColor(member.activityLevel)}`}>
                  {member.activityLevel}
                </span>
                <span>{member.dailyCalories} cal/day</span>
                <span>{member.dailyWaterLiters}L water/day</span>
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
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Member</h3>
              <p className="text-slate-600 mb-4">Are you sure you want to remove "{member.name}" from the household? This action cannot be undone.</p>
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
    <div className="bg-slate-50 rounded-lg p-6 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-slate-800">{member.name}</h3>
              {group?.leader === member.id && (
                <Shield className="h-4 w-4 text-yellow-600" title="Group Leader" />
              )}
            </div>
            <p className="text-sm text-slate-600">{member.age} years • {getAgeGroup(member.age)}</p>
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

      {group && (
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${group.color}-100 text-${group.color}-700`}>
            {group.name}
          </span>
        </div>
      )}

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">Activity Level</span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityLevelColor(member.activityLevel)}`}>
            {member.activityLevel}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">Daily Calories</span>
          </div>
          <span className="text-sm font-medium text-slate-800">{member.dailyCalories}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Droplets className="h-4 w-4 text-slate-500" />
            <span className="text-sm text-slate-600">Daily Water</span>
          </div>
          <span className="text-sm font-medium text-slate-800">{member.dailyWaterLiters}L</span>
        </div>
      </div>

      {member.skills && member.skills.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Skills</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {member.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {skill}
              </span>
            ))}
            {member.skills.length > 3 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                +{member.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {member.responsibilities && member.responsibilities.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Briefcase className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Responsibilities</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {member.responsibilities.slice(0, 2).map((resp, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                {resp}
              </span>
            ))}
            {member.responsibilities.length > 2 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                +{member.responsibilities.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {(member.medicalConditions && member.medicalConditions.length > 0) && (
        <div className="mb-3">
          <div className="flex items-center space-x-2 mb-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium text-slate-700">Medical</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {member.medicalConditions.slice(0, 2).map((conditionName, index) => {
              const condition = medicalConditions.find(c => c.name === conditionName);
              const categoryColor = condition ? getCategoryColor(condition.category) : 'bg-red-100 text-red-700 border-red-200';
              const categoryIcon = condition ? getCategoryIcon(condition.category) : '🏥';
              
              return (
                <span key={index} className={`px-2 py-1 text-xs rounded-full border ${categoryColor} flex items-center space-x-1`}>
                  <span>{categoryIcon}</span>
                  <span>{conditionName}</span>
                </span>
              );
            })}
            {member.medicalConditions.length > 2 && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                +{member.medicalConditions.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Required Medical Supplies */}
      {member.medicalConditions && member.medicalConditions.length > 0 && (
        <div className="mb-3">
          <RequiredSuppliesDisplay
            requiredSupplies={getRequiredSupplies()}
            memberName={member.name}
          />
        </div>
      )}

      {member.emergencyContact && (
        <div className="pt-3 border-t border-slate-200">
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-600">{member.emergencyContact}</span>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Delete Member</h3>
            <p className="text-slate-600 mb-4">Are you sure you want to remove "{member.name}" from the household? This action cannot be undone.</p>
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