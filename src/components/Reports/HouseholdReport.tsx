import React from 'react';
import { Users, Crown, Activity, Heart, Award, Briefcase } from 'lucide-react';
import { HouseholdMember, HouseholdGroup } from '../../types';

interface HouseholdReportProps {
  household: HouseholdMember[];
  groups: HouseholdGroup[];
}

export default function HouseholdReport({ household, groups }: HouseholdReportProps) {
  const totalCalories = household.reduce((sum, member) => sum + member.dailyCalories, 0);
  const totalWater = household.reduce((sum, member) => sum + member.dailyWaterLiters, 0);
  
  const ageGroups = {
    children: household.filter(m => m.age < 18).length,
    adults: household.filter(m => m.age >= 18 && m.age < 65).length,
    seniors: household.filter(m => m.age >= 65).length,
  };

  const activityLevels = household.reduce((acc, member) => {
    acc[member.activityLevel] = (acc[member.activityLevel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const membersWithMedical = household.filter(m => m.medicalConditions && m.medicalConditions.length > 0);
  const membersWithSkills = household.filter(m => m.skills && m.skills.length > 0);

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-6 border border-blue-200 dark:border-blue-600">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-200">Total Members</span>
          </div>
          <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{household.length}</p>
          <p className="text-sm text-blue-600 dark:text-blue-300">Household size</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/50 rounded-lg p-6 border border-green-200 dark:border-green-600">
          <div className="flex items-center space-x-3 mb-3">
            <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-200">Daily Calories</span>
          </div>
          <p className="text-3xl font-bold text-green-800 dark:text-green-200">{totalCalories.toLocaleString()}</p>
          <p className="text-sm text-green-600 dark:text-green-300">Total household</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="h-6 w-6 text-purple-600" />
            <span className="font-semibold text-purple-800">Groups</span>
          </div>
          <p className="text-3xl font-bold text-purple-800">{groups.length}</p>
          <p className="text-sm text-purple-600">Organizational units</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center space-x-3 mb-3">
            <Heart className="h-6 w-6 text-orange-600" />
            <span className="font-semibold text-orange-800">Medical Needs</span>
          </div>
          <p className="text-3xl font-bold text-orange-800">{membersWithMedical.length}</p>
          <p className="text-sm text-orange-600">Members with conditions</p>
        </div>
      </div>

      {/* Age Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Age Distribution</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800">Children (0-17)</span>
              <span className="text-lg font-bold text-slate-600">{ageGroups.children}</span>
            </div>
            <div className="bg-slate-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${household.length > 0 ? (ageGroups.children / household.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800">Adults (18-64)</span>
              <span className="text-lg font-bold text-slate-600">{ageGroups.adults}</span>
            </div>
            <div className="bg-slate-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${household.length > 0 ? (ageGroups.adults / household.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-800">Seniors (65+)</span>
              <span className="text-lg font-bold text-slate-600">{ageGroups.seniors}</span>
            </div>
            <div className="bg-slate-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${household.length > 0 ? (ageGroups.seniors / household.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Levels */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Activity Levels</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(activityLevels).map(([level, count]) => (
            <div key={level} className="bg-slate-50 rounded-lg p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-800">{count}</p>
                <p className="text-sm font-medium text-slate-600 capitalize">{level.replace('_', ' ')}</p>
                <div className="mt-2 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${household.length > 0 ? (count / household.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Groups Overview */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Groups Overview</h3>
        <div className="space-y-4">
          {groups.map((group) => {
            const groupMembers = household.filter(m => m.groupId === group.id);
            const leader = groupMembers.find(m => m.id === group.leader);
            
            return (
              <div key={group.id} className="bg-slate-50 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-4 h-4 rounded-full bg-${group.color}-500`}></div>
                      <h4 className="text-lg font-semibold text-slate-800">{group.name}</h4>
                      <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-xs">
                        {group.groupType}
                      </span>
                    </div>
                    {group.description && (
                      <p className="text-slate-600 mb-3">{group.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">{groupMembers.length}</p>
                    <p className="text-sm text-slate-600">members</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Members</h5>
                    <div className="space-y-1">
                      {groupMembers.slice(0, 3).map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          {leader?.id === member.id && <Crown className="h-3 w-3 text-yellow-600" />}
                          <span className="text-sm text-slate-600">{member.name}</span>
                          <span className="text-xs text-slate-500">({member.age}y)</span>
                        </div>
                      ))}
                      {groupMembers.length > 3 && (
                        <p className="text-xs text-slate-500">+{groupMembers.length - 3} more</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Daily Needs</h5>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Calories</span>
                        <span className="text-sm font-medium text-slate-800">
                          {groupMembers.reduce((sum, m) => sum + m.dailyCalories, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Water</span>
                        <span className="text-sm font-medium text-slate-800">
                          {groupMembers.reduce((sum, m) => sum + m.dailyWaterLiters, 0).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-700 mb-2">Capabilities</h5>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">With Skills</span>
                        <span className="text-sm font-medium text-slate-800">
                          {groupMembers.filter(m => m.skills && m.skills.length > 0).length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Medical Needs</span>
                        <span className="text-sm font-medium text-slate-800">
                          {groupMembers.filter(m => m.medicalConditions && m.medicalConditions.length > 0).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Member List */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Detailed Member Information</h3>
        <div className="bg-slate-50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Age</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Activity</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Daily Needs</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Group</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Skills</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Medical</th>
                </tr>
              </thead>
              <tbody>
                {household.map((member) => {
                  const group = groups.find(g => g.id === member.groupId);
                  const isLeader = group?.leader === member.id;
                  
                  return (
                    <tr key={member.id} className="border-b border-slate-100 hover:bg-white transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {isLeader && <Crown className="h-4 w-4 text-yellow-600" />}
                          <span className="font-medium text-slate-800">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{member.age} years</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-xs capitalize">
                          {member.activityLevel.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div>{member.dailyCalories} cal</div>
                          <div className="text-slate-500">{member.dailyWaterLiters}L water</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {group ? (
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full bg-${group.color}-500`}></div>
                            <span className="text-sm text-slate-600">{group.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Ungrouped</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.skills?.slice(0, 2).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                              {skill}
                            </span>
                          ))}
                          {(member.skills?.length || 0) > 2 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              +{(member.skills?.length || 0) - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.medicalConditions?.slice(0, 1).map((condition, index) => (
                            <span key={index} className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                              {condition}
                            </span>
                          ))}
                          {(member.medicalConditions?.length || 0) > 1 && (
                            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
                              +{(member.medicalConditions?.length || 0) - 1}
                            </span>
                          )}
                          {(!member.medicalConditions || member.medicalConditions.length === 0) && (
                            <span className="text-sm text-slate-400">None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}