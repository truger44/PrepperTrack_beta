import React from 'react';
import { Globe, Calendar, Droplets, Activity, AlertTriangle, Target, Shield, Info } from 'lucide-react';
import { PrepperSettings, ClimateZone } from '../../types';
import { usePrepper } from '../../context/PrepperContext';
import { calculateSustainabilityMetrics, calculateWaterNeedsWithSafetyMargin, calculatePreparednessStatus } from '../../utils/calculations';

interface GeneralSettingsProps {
  settings: PrepperSettings;
  onSettingsChange: (settings: Partial<PrepperSettings>) => void;
}

export default function GeneralSettings({ settings, onSettingsChange }: GeneralSettingsProps) {
  const { state } = usePrepper();
  const { inventory, household, rationingScenarios } = state;

  // Calculate current metrics to show impact of settings
  const currentMetrics = calculateSustainabilityMetrics(inventory, household, rationingScenarios, settings);
  const currentWaterWithMargin = calculateWaterNeedsWithSafetyMargin(household, settings);
  const baseDailyWater = household.reduce((sum, member) => sum + member.dailyWaterLiters, 0);
  const preparednessStatus = calculatePreparednessStatus(currentMetrics.normalUsageDays, settings.preparednessGoalDays);

  const climateZones: { value: ClimateZone; label: string; description: string }[] = [
    { value: 'temperate', label: 'Temperate', description: 'Moderate climate with seasonal variations' },
    { value: 'hot_dry', label: 'Hot & Dry', description: 'Desert or arid climate conditions' },
    { value: 'hot_humid', label: 'Hot & Humid', description: 'Tropical or subtropical climate' },
    { value: 'cold', label: 'Cold', description: 'Cold climate with harsh winters' },
  ];

  const preparednessGoalOptions = [
    { value: 30, label: '30 Days', description: 'Basic emergency preparedness' },
    { value: 60, label: '60 Days', description: 'Extended emergency coverage' },
    { value: 90, label: '90 Days', description: 'Recommended minimum preparedness' },
    { value: 180, label: '6 Months', description: 'Long-term preparedness' },
    { value: 365, label: '1 Year', description: 'Maximum self-sufficiency' },
  ];

  const calorieOptions = [
    { value: 1000, label: '1,000 cal/day', description: 'Survival minimum (short-term only)' },
    { value: 1200, label: '1,200 cal/day', description: 'Recommended minimum for adults' },
    { value: 1500, label: '1,500 cal/day', description: 'Conservative safe minimum' },
    { value: 1800, label: '1,800 cal/day', description: 'Moderate activity level' },
  ];

  const waterMarginOptions = [
    { value: 1.0, label: '1.0x', description: 'Minimum required (no safety buffer)' },
    { value: 1.2, label: '1.2x', description: 'Recommended safety margin' },
    { value: 1.5, label: '1.5x', description: 'Conservative approach' },
    { value: 2.0, label: '2.0x', description: 'Maximum safety buffer' },
  ];

  return (
    <div className="space-y-8">
      {/* Current Status Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Current Preparedness Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-slate-800">Goal Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{preparednessStatus.percentage.toFixed(1)}%</p>
            <p className="text-sm text-slate-600">{currentMetrics.normalUsageDays} of {settings.preparednessGoalDays} days</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Droplets className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-slate-800">Water Safety</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{settings.waterSafetyMargin}x</p>
            <p className="text-sm text-slate-600">{(currentWaterWithMargin - baseDailyWater).toFixed(1)}L/day buffer</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-slate-800">Min Calories</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{settings.minimumCaloriesPerDay}</p>
            <p className="text-sm text-slate-600">Safety threshold</p>
          </div>
        </div>
      </div>

      {/* Climate Zone Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Climate Zone</h3>
            <p className="text-sm text-slate-600">Your local climate affects water and food requirements</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {climateZones.map((zone) => (
            <button
              key={zone.value}
              onClick={() => onSettingsChange({ climateZone: zone.value })}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                settings.climateZone === zone.value
                  ? 'border-blue-500 bg-blue-50 text-blue-800'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="font-medium mb-1">{zone.label}</div>
              <div className={`text-sm ${
                settings.climateZone === zone.value ? 'text-blue-600' : 'text-slate-500'
              }`}>
                {zone.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Preparedness Goal */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Target className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Preparedness Goal</h3>
            <p className="text-sm text-slate-600">Target number of days your supplies should last</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Target Duration</span>
            <span className="text-lg font-bold text-green-600">{settings.preparednessGoalDays} days</span>
          </div>
          
          <input
            type="range"
            min="7"
            max="365"
            step="7"
            value={settings.preparednessGoalDays}
            onChange={(e) => onSettingsChange({ preparednessGoalDays: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {preparednessGoalOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSettingsChange({ preparednessGoalDays: option.value })}
                className={`p-3 rounded-lg border text-center transition-all ${
                  settings.preparednessGoalDays === option.value
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className={`text-xs mt-1 ${
                  settings.preparednessGoalDays === option.value ? 'text-green-600' : 'text-slate-500'
                }`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>

          {/* Goal Impact Display */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Goal Impact</span>
            </div>
            <p className="text-sm text-green-700">
              With your current supplies lasting {currentMetrics.normalUsageDays} days, you are at{' '}
              <strong>{preparednessStatus.percentage.toFixed(1)}%</strong> of your {settings.preparednessGoalDays}-day goal.
              {preparednessStatus.percentage < 100 && (
                <span> You need {Math.ceil((settings.preparednessGoalDays - currentMetrics.normalUsageDays) * baseDailyWater / 3.78541)} more gallons of water and food for {settings.preparednessGoalDays - currentMetrics.normalUsageDays} additional days.</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Water Safety Margin */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Water Safety Margin</h3>
            <p className="text-sm text-slate-600">Additional water storage multiplier for safety and emergencies</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Safety Multiplier</span>
            <span className="text-lg font-bold text-blue-600">{settings.waterSafetyMargin.toFixed(1)}x</span>
          </div>
          
          <input
            type="range"
            min="1.0"
            max="2.0"
            step="0.1"
            value={settings.waterSafetyMargin}
            onChange={(e) => onSettingsChange({ waterSafetyMargin: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {waterMarginOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSettingsChange({ waterSafetyMargin: option.value })}
                className={`p-3 rounded-lg border text-center transition-all ${
                  Math.abs(settings.waterSafetyMargin - option.value) < 0.05
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className={`text-xs mt-1 ${
                  Math.abs(settings.waterSafetyMargin - option.value) < 0.05 ? 'text-blue-600' : 'text-slate-500'
                }`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          
          {/* Water Margin Impact Display */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Droplets className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Water Safety Impact</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <p><strong>Base Need:</strong> {baseDailyWater.toFixed(1)}L/day</p>
                <p><strong>With Margin:</strong> {currentWaterWithMargin.toFixed(1)}L/day</p>
              </div>
              <div>
                <p><strong>Safety Buffer:</strong> {(currentWaterWithMargin - baseDailyWater).toFixed(1)}L/day</p>
                <p><strong>Purpose:</strong> Emergency reserves, stress consumption, contamination backup</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimum Calories */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Activity className="h-6 w-6 text-orange-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Minimum Daily Calories</h3>
            <p className="text-sm text-slate-600">Safety threshold for rationing scenarios</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Minimum Calories per Person</span>
            <span className="text-lg font-bold text-orange-600">{settings.minimumCaloriesPerDay.toLocaleString()}</span>
          </div>
          
          <input
            type="range"
            min="800"
            max="2000"
            step="50"
            value={settings.minimumCaloriesPerDay}
            onChange={(e) => onSettingsChange({ minimumCaloriesPerDay: parseInt(e.target.value) })}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {calorieOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSettingsChange({ minimumCaloriesPerDay: option.value })}
                className={`p-3 rounded-lg border text-center transition-all ${
                  settings.minimumCaloriesPerDay === option.value
                    ? 'border-orange-500 bg-orange-50 text-orange-800'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className={`text-xs mt-1 ${
                  settings.minimumCaloriesPerDay === option.value ? 'text-orange-600' : 'text-slate-500'
                }`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
          
          {settings.minimumCaloriesPerDay < 1200 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Warning</span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                Caloric intake below 1,200 calories per day is dangerous for extended periods and should only be used in extreme emergencies.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Current Configuration Summary */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h4 className="font-semibold text-slate-800 mb-4">Current Configuration Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Climate Zone:</span>
              <span className="text-sm font-medium text-slate-800 capitalize">
                {settings.climateZone.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Preparedness Goal:</span>
              <span className="text-sm font-medium text-slate-800">{settings.preparednessGoalDays} days</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Minimum Calories:</span>
              <span className="text-sm font-medium text-slate-800">{settings.minimumCaloriesPerDay.toLocaleString()}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Water Safety Margin:</span>
              <span className="text-sm font-medium text-slate-800">{settings.waterSafetyMargin.toFixed(1)}x</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}