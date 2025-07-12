import React from 'react';
import { Clock, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { RationingScenario, SustainabilityMetrics } from '../../types';

interface ScenarioCardProps {
  scenario: RationingScenario;
  metrics: SustainabilityMetrics;
  isSelected: boolean;
  onSelect: (scenarioId: string) => void;
  householdSize: number;
  minCalories: number;
}

export default function ScenarioCard({
  scenario,
  metrics,
  isSelected,
  onSelect,
  householdSize,
  minCalories,
}: ScenarioCardProps) {
  const duration = metrics.rationedUsageDays[scenario.id] || 0;
  const caloriesPerPerson = metrics.dailyCaloriesPerPerson[scenario.id] || 0;
  const isSafe = caloriesPerPerson >= minCalories;
  
  const getScenarioColor = () => {
    if (scenario.reductionPercentage === 0) return 'border-green-300 bg-green-50 dark:border-green-600 dark:bg-green-900/30 text-green-800 dark:text-green-200';
    if (scenario.reductionPercentage <= 25) return 'border-yellow-300 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200';
    if (scenario.reductionPercentage <= 50) return 'border-orange-300 bg-orange-50 dark:border-orange-600 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200';
    return 'border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/30 text-red-800 dark:text-red-200';
  };

  return (
    <div
      onClick={() => onSelect(scenario.id)}
      className={`
        p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${getScenarioColor()}
        ${isSelected ? 'ring-2 ring-green-500 ring-offset-2' : ''}
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{scenario.name}</h3>
          <p className="text-sm opacity-80 mt-1">{scenario.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          {isSafe ? (
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          )}
          {isSelected && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm opacity-75">Duration</span>
          </div>
          <span className="font-semibold">{duration} days</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="text-sm opacity-75">Calories/Person</span>
          </div>
          <span className={`font-semibold ${isSafe ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {Math.round(caloriesPerPerson)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm opacity-75">Reduction</span>
          <span className="font-semibold">{scenario.reductionPercentage}%</span>
        </div>
      </div>

      {!isSafe && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/50 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">Below Safe Minimum</span>
          </div>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            Caloric intake is below {minCalories} calories per day
          </p>
        </div>
      )}
    </div>
  );
}