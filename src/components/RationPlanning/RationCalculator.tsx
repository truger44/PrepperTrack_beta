import React, { useState, useEffect } from 'react';
import { Calculator, Apple, Scale, Users, Target, AlertTriangle, CheckCircle, Droplets, Shield } from 'lucide-react';
import { InventoryItem, HouseholdMember, RationingScenario } from '../../types';
import { usePrepper } from '../../context/PrepperContext';
import { calculateWaterNeedsWithSafetyMargin } from '../../utils/calculations';

interface RationCalculatorProps {
  inventory: InventoryItem[];
  household: HouseholdMember[];
  selectedScenario?: RationingScenario;
  onScenarioUpdate?: (scenarioId: string, updates: Partial<RationingScenario>) => void;
}

export default function RationCalculator({ 
  inventory, 
  household, 
  selectedScenario,
  onScenarioUpdate 
}: RationCalculatorProps) {
  const { state } = usePrepper();
  const { settings } = state;
  
  const [calculatorDays, setCalculatorDays] = useState<number>(7);
  const [calculationResults, setCalculationResults] = useState<{
    feasible: boolean;
    reductionNeeded: number;
    adjustedCaloriesPerPerson: number;
    totalCaloriesAvailable: number;
    totalCaloriesNeeded: number;
    actualDuration: number;
    waterDuration: number;
    limitingFactor: 'food' | 'water';
  } | null>(null);
  
  const foodItems = inventory.filter(item => item.category.startsWith('Food'));
  const waterItems = inventory.filter(item => item.category === 'Water');
  const totalHouseholdCalories = household.reduce((sum, member) => sum + member.dailyCalories, 0);
  const dailyWaterWithMargin = calculateWaterNeedsWithSafetyMargin(household, settings);
  
  const calculateRationsForDays = (days: number) => {
    const targetDuration = days;
    const totalCaloriesNeeded = totalHouseholdCalories * targetDuration;
    const totalCaloriesAvailable = foodItems.reduce((sum, item) => 
      sum + (item.quantity * (item.caloriesPerUnit || 0)), 0);
    
    // Calculate water duration with safety margin
    const totalWaterInStock = waterItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalWaterInLiters = totalWaterInStock * 3.78541; // Convert gallons to liters
    const waterDuration = dailyWaterWithMargin > 0 ? Math.floor(totalWaterInLiters / dailyWaterWithMargin) : 0;
    
    if (totalCaloriesAvailable === 0 || totalHouseholdCalories === 0) {
      return { 
        feasible: false, 
        reductionNeeded: 100,
        adjustedCaloriesPerPerson: 0,
        totalCaloriesAvailable,
        totalCaloriesNeeded,
        actualDuration: 0,
        waterDuration,
        limitingFactor: 'food' as const
      };
    }
    
    const foodDuration = totalCaloriesAvailable / totalHouseholdCalories;
    const actualDuration = Math.min(foodDuration, waterDuration);
    const limitingFactor = foodDuration < waterDuration ? 'food' : 'water';
    
    const reductionNeeded = Math.max(0, 100 - (totalCaloriesAvailable / totalCaloriesNeeded) * 100);
    const feasible = reductionNeeded < 75; // Arbitrary threshold for feasibility
    const adjustedCaloriesPerPerson = (totalHouseholdCalories / household.length) * (1 - reductionNeeded / 100);
    
    return { 
      feasible, 
      reductionNeeded,
      adjustedCaloriesPerPerson,
      totalCaloriesAvailable,
      totalCaloriesNeeded,
      actualDuration,
      waterDuration,
      limitingFactor
    };
  };

  useEffect(() => {
    const results = calculateRationsForDays(calculatorDays);
    setCalculationResults(results);
  }, [calculatorDays, inventory, household, settings]);

  const handleDaysChange = (newDays: number) => {
    setCalculatorDays(newDays);
  };

  const createCustomScenario = () => {
    if (!calculationResults || !onScenarioUpdate) return;
    
    const customScenarioId = 'custom_calculated';
    const customScenario: Partial<RationingScenario> = {
      name: `Custom ${calculatorDays}-Day Plan`,
      reductionPercentage: Math.round(calculationResults.reductionNeeded),
      description: `Custom rationing plan for ${calculatorDays} days with ${Math.round(calculationResults.reductionNeeded)}% reduction`
    };
    
    onScenarioUpdate(customScenarioId, customScenario);
  };

  if (!calculationResults) return null;

  const { feasible, reductionNeeded, adjustedCaloriesPerPerson, totalCaloriesAvailable, actualDuration, waterDuration, limitingFactor } = calculationResults;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="h-6 w-6 text-green-600 dark:text-green-400" />
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Ration Calculator</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Target Duration (days)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="365"
              value={calculatorDays}
              onChange={(e) => handleDaysChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <input
              type="number"
              min="1"
              max="365"
              value={calculatorDays}
              onChange={(e) => handleDaysChange(parseInt(e.target.value) || 1)}
              className="w-20 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-slate-800 dark:text-slate-200">Calculation Results</h3>
            <div className="flex items-center space-x-2">
              {feasible ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <span className={`text-sm font-medium ${feasible ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {feasible ? 'Feasible' : 'Critical'}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Required Reduction</span>
              <span className={`font-semibold ${
                reductionNeeded > 75 ? 'text-red-600 dark:text-red-400' :
                reductionNeeded > 50 ? 'text-orange-600 dark:text-orange-400' :
                reductionNeeded > 25 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {reductionNeeded.toFixed(1)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Calories per Person</span>
              <span className={`font-semibold ${
                adjustedCaloriesPerPerson >= settings.minimumCaloriesPerDay ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {Math.round(adjustedCaloriesPerPerson)}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Food Duration Possible</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {(totalCaloriesAvailable / totalHouseholdCalories).toFixed(1)} days
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Water Duration (with safety)</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {waterDuration.toFixed(1)} days
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Limiting Factor</span>
              <span className={`font-semibold ${limitingFactor === 'water' ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {limitingFactor === 'water' ? 'Water Supply' : 'Food Supply'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Calories Available</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {totalCaloriesAvailable.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Water Safety Margin Info */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Water Safety Analysis</span>
          </div>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p><strong>Safety Margin:</strong> {settings.waterSafetyMargin}x multiplier applied</p>
            <p><strong>Daily Need with Margin:</strong> {dailyWaterWithMargin.toFixed(1)}L</p>
            <p><strong>Purpose:</strong> Accounts for stress, contamination, and emergency reserves</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Supply Coverage</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{Math.min(100, (actualDuration / calculatorDays) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                actualDuration >= calculatorDays ? 'bg-green-500' :
                actualDuration >= calculatorDays * 0.75 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (actualDuration / calculatorDays) * 100)}%` }}
            ></div>
          </div>
        </div>

        {selectedScenario && (
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Current Scenario</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{selectedScenario.name}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Reduction</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedScenario.reductionPercentage}%</span>
            </div>
          </div>
        )}

        {onScenarioUpdate && (
          <button
            onClick={createCustomScenario}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Target className="h-5 w-5" />
            <span>Create Custom Scenario</span>
          </button>
        )}

        <div className="space-y-3">
          <h3 className="font-medium text-slate-800 dark:text-slate-200">Quick Reference</h3>
          
          <div className="text-sm space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Household: {household.length} members
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Apple className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Food items: {foodItems.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Water items: {waterItems.length}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Scale className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Daily need: {totalHouseholdCalories.toLocaleString()} calories
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span className="text-slate-600 dark:text-slate-400">
                Water need (with safety): {dailyWaterWithMargin.toFixed(1)}L/day
              </span>
            </div>
          </div>
        </div>

        {adjustedCaloriesPerPerson < settings.minimumCaloriesPerDay && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Critical Warning</span>
            </div>
            <p className="text-xs text-red-700 dark:text-red-300">
              Caloric intake below {settings.minimumCaloriesPerDay} calories per day is dangerous and unsustainable for extended periods.
            </p>
          </div>
        )}

        {limitingFactor === 'water' && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Water Limitation</span>
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Your water supply (including {settings.waterSafetyMargin}x safety margin) is the limiting factor. 
              Consider increasing water storage or adjusting the safety margin in settings.
            </p>
          </div>
        )}

        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Note:</strong> Calculations include your {settings.waterSafetyMargin}x water safety margin and 
            {settings.minimumCaloriesPerDay} calorie minimum threshold. Consider individual dietary needs, 
            activity levels, and health conditions when planning rationing strategies.
          </p>
        </div>
      </div>
    </div>
  );
}