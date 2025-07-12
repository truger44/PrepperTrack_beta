import React from 'react';
import { Calculator, Users, Apple, Droplets } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { calculateSustainabilityMetrics } from '../../utils/calculations';
import { RationingScenario } from '../../types';
import ScenarioCard from './ScenarioCard';
import RationCalculator from './RationCalculator';

export default function RationPlanning() {
  const { state, dispatch } = usePrepper();
  const { inventory, household, settings, rationingScenarios, selectedRationingScenario } = state;

  const metrics = calculateSustainabilityMetrics(inventory, household, rationingScenarios, settings);
  const selectedScenario = rationingScenarios.find(s => s.id === selectedRationingScenario);

  const handleScenarioSelect = (scenarioId: string) => {
    dispatch({ type: 'SET_RATIONING_SCENARIO', payload: scenarioId });
  };

  const handleScenarioUpdate = (scenarioId: string, updates: Partial<RationingScenario>) => {
    // Check if scenario exists, if not create it
    const existingScenario = rationingScenarios.find(s => s.id === scenarioId);
    
    if (existingScenario) {
      const updatedScenario = { ...existingScenario, ...updates };
      dispatch({ type: 'UPDATE_RATIONING_SCENARIO', payload: updatedScenario });
    } else {
      const newScenario: RationingScenario = {
        id: scenarioId,
        name: updates.name || 'Custom Scenario',
        reductionPercentage: updates.reductionPercentage || 0,
        description: updates.description || 'Custom rationing scenario',
        ...updates
      };
      dispatch({ type: 'ADD_RATIONING_SCENARIO', payload: newScenario });
    }
    
    // Auto-select the updated/created scenario
    dispatch({ type: 'SET_RATIONING_SCENARIO', payload: scenarioId });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Ration Planning</h1>
        <p className="text-slate-600">Plan and analyze different rationing scenarios for emergency situations</p>
      </div>

      {/* Current Scenario Overview  */}
      {selectedScenario && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Current Scenario: {selectedScenario.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Calculator className="h-6 w-6 text-blue-600" />
                <span className="font-medium text-slate-800">Duration</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {metrics.rationedUsageDays[selectedRationingScenario] || 0} days
              </p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Apple className="h-6 w-6 text-orange-600" />
                <span className="font-medium text-slate-800">Calories/Person</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(metrics.dailyCaloriesPerPerson[selectedRationingScenario] || 0)}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Users className="h-6 w-6 text-purple-600" />
                <span className="font-medium text-slate-800">Reduction</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {selectedScenario.reductionPercentage}%
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-2">
                <Droplets className="h-6 w-6 text-green-600" />
                <span className="font-medium text-slate-800">Status</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {(metrics.dailyCaloriesPerPerson[selectedRationingScenario] || 0) >= settings.minimumCaloriesPerDay ? 'Safe' : 'Warning'}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-slate-700">{selectedScenario.description}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rationing Scenarios */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Rationing Scenarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rationingScenarios.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                metrics={metrics}
                isSelected={selectedRationingScenario === scenario.id}
                onSelect={handleScenarioSelect}
                householdSize={household.length}
                minCalories={settings.minimumCaloriesPerDay}
              />
            ))}
          </div>
        </div>

        {/* Ration Calculator */}
        <div>
          <RationCalculator
            inventory={inventory}
            household={household}
            selectedScenario={selectedScenario}
            onScenarioUpdate={handleScenarioUpdate}
          />
        </div>
      </div>
    </div>
  );
}