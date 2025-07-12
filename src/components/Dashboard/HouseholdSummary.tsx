import React from 'react';
import { User, Activity, Droplets } from 'lucide-react';
import { HouseholdMember } from '../../types';

interface HouseholdSummaryProps {
  members: HouseholdMember[];
}

export default function HouseholdSummary({ members }: HouseholdSummaryProps) {
  const totalCalories = members.reduce((sum, member) => sum + member.dailyCalories, 0);
  const totalWater = members.reduce((sum, member) => sum + member.dailyWaterLiters, 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Household Members</h2>
      
      {members.length === 0 ? (
        <div className="text-center py-8">
          <User className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300">No household members</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add members to calculate needs</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{member.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{member.age} years old</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{member.dailyCalories} cal/day</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{member.dailyWaterLiters}L water</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-600">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Daily Calories</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalCalories.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Droplets className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Daily Water</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalWater.toFixed(1)}L</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}