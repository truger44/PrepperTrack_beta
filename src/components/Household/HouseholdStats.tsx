import React from 'react';
import { Users, Activity, Droplets, Heart, Award, Shield } from 'lucide-react';
import { HouseholdMember, HouseholdGroup } from '../../types';

interface HouseholdStatsProps {
  members: HouseholdMember[];
  groups: HouseholdGroup[];
  totalCalories: number;
  totalWater: number;
}

export default function HouseholdStats({ members, groups, totalCalories, totalWater }: HouseholdStatsProps) {
  const children = members.filter(member => member.age < 18).length;
  const adults = members.filter(member => member.age >= 18 && member.age < 65).length;
  const seniors = members.filter(member => member.age >= 65).length;
  
  const membersWithMedical = members.filter(member => 
    member.medicalConditions && member.medicalConditions.length > 0
  ).length;
  
  const skillfulMembers = members.filter(member => 
    member.skills && member.skills.length > 0
  ).length;
  
  const groupLeaders = groups.filter(group => group.leader).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Total Members</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{members.length}</p>
            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-2">
              <span>{children} children</span>
              <span>{adults} adults</span>
              <span>{seniors} seniors</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Daily Calories</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{totalCalories.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">
              Avg: {Math.round(totalCalories / (members.length || 1))} per person
            </p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50">
            <Activity className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Daily Water</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{totalWater.toFixed(1)}L</p>
            <p className="text-xs text-slate-500 mt-2">
              Avg: {(totalWater / (members.length || 1)).toFixed(1)}L per person
            </p>
          </div>
          <div className="p-3 rounded-lg bg-blue-50">
            <Droplets className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Groups</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{groups.length}</p>
            <p className="text-xs text-slate-500 mt-2">
              {groupLeaders} with leaders
            </p>
          </div>
          <div className="p-3 rounded-lg bg-green-50">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Medical Needs</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{membersWithMedical}</p>
            <p className="text-xs text-slate-500 mt-2">
              {((membersWithMedical / (members.length || 1)) * 100).toFixed(0)}% of household
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-50">
            <Heart className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">Skilled Members</p>
            <p className="text-3xl font-bold text-slate-800 mt-1">{skillfulMembers}</p>
            <p className="text-xs text-slate-500 mt-2">
              {((skillfulMembers / (members.length || 1)) * 100).toFixed(0)}% with skills
            </p>
          </div>
          <div className="p-3 rounded-lg bg-purple-50">
            <Award className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  );
}