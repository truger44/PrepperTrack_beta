import React from 'react';
import { Calendar, TrendingUp, AlertTriangle, Users, Target } from 'lucide-react';
import { SustainabilityMetrics, RationingScenario, HouseholdMember } from '../../types';

interface SustainabilityReportProps {
  metrics: SustainabilityMetrics;
  scenarios: RationingScenario[];
  household: HouseholdMember[];
}

export default function SustainabilityReport({ metrics, scenarios, household }: SustainabilityReportProps) {
  const totalHouseholdCalories = household.reduce((sum, member) => sum + member.dailyCalories, 0);
  const avgCaloriesPerPerson = household.length > 0 ? totalHouseholdCalories / household.length : 0;

  return (
    <div className="space-y-8">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-6 border border-blue-200 dark:border-blue-600">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-blue-800 dark:text-blue-200">Normal Usage</span>
          </div>
          <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{metrics.normalUsageDays}</p>
          <p className="text-sm text-blue-600 dark:text-blue-300">Days of supply</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900/50 rounded-lg p-6 border border-green-200 dark:border-green-600">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-800 dark:text-green-200">Household Size</span>
          </div>
          <p className="text-3xl font-bold text-green-800 dark:text-green-200">{household.length}</p>
          <p className="text-sm text-green-600 dark:text-green-300">Total members</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/50 rounded-lg p-6 border border-orange-200 dark:border-orange-600">
          <div className="flex items-center space-x-3 mb-3">
            <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <span className="font-semibold text-orange-800 dark:text-orange-200">Daily Calories</span>
          </div>
          <p className="text-3xl font-bold text-orange-800 dark:text-orange-200">{Math.round(avgCaloriesPerPerson)}</p>
          <p className="text-sm text-orange-600 dark:text-orange-300">Average per person</p>
        </div>
      </div>

      {/* Rationing Scenarios Analysis */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Rationing Scenarios Analysis</h3>
        <div className="bg-slate-50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Scenario</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Reduction</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Duration (Days)</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Calories/Person</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Safety Status</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => {
                  const duration = metrics.rationedUsageDays[scenario.id] || 0;
                  const caloriesPerPerson = metrics.dailyCaloriesPerPerson[scenario.id] || 0;
                  const isSafe = caloriesPerPerson >= 1200;
                  
                  return (
                    <tr key={scenario.id} className="border-b border-slate-100 hover:bg-white transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{scenario.name}</p>
                          <p className="text-sm text-slate-600">{scenario.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          scenario.reductionPercentage === 0 ? 'bg-green-100 text-green-800' :
                          scenario.reductionPercentage <= 25 ? 'bg-yellow-100 text-yellow-800' :
                          scenario.reductionPercentage <= 50 ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {scenario.reductionPercentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">{duration}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isSafe ? 'text-green-600' : 'text-red-600'}`}>
                          {Math.round(caloriesPerPerson)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {isSafe ? (
                            <div className="flex items-center space-x-2 text-green-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium">Safe</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 text-red-600">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm font-medium">Critical</span>
                            </div>
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

      {/* Duration Comparison Chart */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Supply Duration Comparison</h3>
        <div className="space-y-4">
          {scenarios.map((scenario) => {
            const duration = metrics.rationedUsageDays[scenario.id] || 0;
            const maxDuration = Math.max(...Object.values(metrics.rationedUsageDays));
            const percentage = maxDuration > 0 ? (duration / maxDuration) * 100 : 0;
            
            return (
              <div key={scenario.id} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-800">{scenario.name}</span>
                  <span className="text-lg font-bold text-slate-600">{duration} days</span>
                </div>
                <div className="bg-slate-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      scenario.reductionPercentage === 0 ? 'bg-green-500' :
                      scenario.reductionPercentage <= 25 ? 'bg-yellow-500' :
                      scenario.reductionPercentage <= 50 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-2 text-sm text-slate-600">
                  <span>{scenario.reductionPercentage}% reduction</span>
                  <span>{Math.round(metrics.dailyCaloriesPerPerson[scenario.id] || 0)} cal/person</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning Flags */}
      {metrics.warningFlags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Active Warnings</h3>
          <div className="space-y-3">
            {metrics.warningFlags.map((warning, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border flex items-start space-x-3 ${
                  warning.type === 'critical' ? 'bg-red-50 border-red-200' :
                  warning.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <AlertTriangle className={`h-5 w-5 mt-1 flex-shrink-0 ${
                  warning.type === 'critical' ? 'text-red-600' :
                  warning.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div className="flex-1">
                  <p className={`font-medium ${
                    warning.type === 'critical' ? 'text-red-800' :
                    warning.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {warning.category}
                  </p>
                  <p className={`text-sm ${
                    warning.type === 'critical' ? 'text-red-700' :
                    warning.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    {warning.message}
                  </p>
                  {warning.daysRemaining !== undefined && (
                    <p className={`text-xs mt-1 ${
                      warning.type === 'critical' ? 'text-red-600' :
                      warning.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {warning.daysRemaining > 0 
                        ? `${warning.daysRemaining} days remaining`
                        : `Expired ${Math.abs(warning.daysRemaining)} days ago`
                      }
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recommendations</h3>
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="space-y-3">
            {metrics.normalUsageDays < 30 && (
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-800">Increase Food Supplies</p>
                  <p className="text-sm text-blue-700">Current supplies last only {metrics.normalUsageDays} days. Consider increasing food storage to reach your preparedness goals.</p>
                </div>
              </div>
            )}
            
            {metrics.warningFlags.some(w => w.type === 'critical') && (
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-800">Address Critical Issues</p>
                  <p className="text-sm text-blue-700">You have critical warnings that need immediate attention. Review expired items and dangerous rationing scenarios.</p>
                </div>
              </div>
            )}
            
            {scenarios.some(s => (metrics.dailyCaloriesPerPerson[s.id] || 0) < 1200) && (
              <div className="flex items-start space-x-3">
                <Users className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium text-blue-800">Review Rationing Plans</p>
                  <p className="text-sm text-blue-700">Some rationing scenarios provide dangerously low caloric intake. Consider alternative strategies or increase food supplies.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}