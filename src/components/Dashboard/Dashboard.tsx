import React, { useState } from 'react';
import { Users, Apple, Droplets, DollarSign, AlertTriangle, Calendar, Target, Shield, Zap, Waves, Brush as Virus, X } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { calculateSustainabilityMetrics, calculateWaterNeedsWithSafetyMargin, calculatePreparednessStatus, getPreparednessStatusColor, getPreparednessStatusBgColor, adjustInventoryForEmergency } from '../../utils/calculations';
import MetricCard from './MetricCard';
import WarningsList from './WarningsList';
import HouseholdSummary from './HouseholdSummary';
import EmergencyScenarioPanel from './EmergencyScenarioPanel';

export default function Dashboard() {
  const { state, dispatch } = usePrepper();
  const { inventory, household, settings, rationingScenarios, emergencyScenario } = state;
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Adjust inventory based on emergency scenario
  const adjustedInventory = emergencyScenario 
    ? adjustInventoryForEmergency(inventory, emergencyScenario) 
    : inventory;
  
  const metrics = calculateSustainabilityMetrics(adjustedInventory, household, rationingScenarios, settings);
  
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
  const totalItems = inventory.length;
  
  const foodItems = inventory.filter(item => item.category.startsWith('Food'));
  const waterItems = inventory.filter(item => item.category === 'Water');
  const totalWaterGallons = waterItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate water needs with safety margin
  const dailyWaterWithMargin = calculateWaterNeedsWithSafetyMargin(household, settings);
  const baseDailyWater = household.reduce((sum, member) => sum + member.dailyWaterLiters, 0);
  
  // Convert gallons to liters for calculation
  const totalWaterLiters = totalWaterGallons * 3.78541;
  const waterDaysWithMargin = dailyWaterWithMargin > 0 ? Math.floor(totalWaterLiters / dailyWaterWithMargin) : 0;
  const waterDaysWithoutMargin = baseDailyWater > 0 ? Math.floor(totalWaterLiters / baseDailyWater) : 0;
  
  // Calculate preparedness status
  const preparednessStatus = calculatePreparednessStatus(metrics.normalUsageDays, settings.preparednessGoalDays);
  
  const getStatusColor = (days: number): 'green' | 'yellow' | 'red' => {
    if (days >= settings.preparednessGoalDays) return 'green';
    if (days >= settings.preparednessGoalDays * 0.5) return 'yellow';
    return 'red';
  };

  const selectedScenario = rationingScenarios.find(s => s.id === state.selectedRationingScenario);
  const rationedDays = metrics.rationedUsageDays[state.selectedRationingScenario] || 0;

  const handleDeactivateEmergency = () => {
    dispatch({ type: 'DEACTIVATE_EMERGENCY' });
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">Preparedness Dashboard</h1>
          <div>
            {emergencyScenario ? (
              <button
                onClick={handleDeactivateEmergency}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>End Emergency</span>
              </button>
            ) : (
              <button
                onClick={() => setShowEmergencyModal(true)}
                className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Activate Emergency</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400">Monitor your survival readiness and supply sustainability</p>
      </div>

      {/* Emergency Scenario Alert */}
      {emergencyScenario && (
        <div className={`rounded-xl border-2 p-6 mb-8 ${
          emergencyScenario.type === 'power_outage' ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-600' :
          emergencyScenario.type === 'flood' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' :
          'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20">
                {emergencyScenario.type === 'power_outage' && <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />}
                {emergencyScenario.type === 'flood' && <Waves className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
                {emergencyScenario.type === 'pandemic' && <Virus className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  {emergencyScenario.type === 'power_outage' && 'Power Outage Emergency'}
                  {emergencyScenario.type === 'flood' && 'Flood Emergency'}
                  {emergencyScenario.type === 'pandemic' && 'Pandemic Emergency'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {emergencyScenario.type === 'power_outage' && `Active since ${new Date(emergencyScenario.startDate).toLocaleString()}`}
                  {emergencyScenario.type === 'flood' && `Active since ${new Date(emergencyScenario.startDate).toLocaleString()} • ${emergencyScenario.basementFlooded ? 'Basement flooded' : 'Basement secure'}`}
                  {emergencyScenario.type === 'pandemic' && `Active since ${new Date(emergencyScenario.startDate).toLocaleString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={handleDeactivateEmergency}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="End emergency"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Emergency Scenario Tips */}
          <div className="mt-4 p-4 bg-white/70 dark:bg-black/20 rounded-lg">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Emergency Tips</h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {emergencyScenario.tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="inline-block w-4 h-4 bg-green-500 dark:bg-green-600 rounded-full mt-1"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Emergency Impact */}
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg">
            <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Emergency Impact</h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {emergencyScenario.type === 'power_outage' && 
                `Refrigerated items will expire in ${emergencyScenario.duration || 30} hours if power is not restored. Your sustainability metrics have been adjusted accordingly.`
              }
              {emergencyScenario.type === 'flood' && 
                `${emergencyScenario.basementFlooded ? 'Items stored in the basement have been marked as inaccessible except for canned goods.' : 'Your basement is secure, but be prepared to move items if flooding worsens.'} Your sustainability metrics have been adjusted accordingly.`
              }
              {emergencyScenario.type === 'pandemic' && 
                'During a pandemic, your ability to resupply may be limited. Focus on maintaining isolation and proper hygiene.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Preparedness Goal Status */}
      <div className={`rounded-xl border-2 p-6 mb-8 ${getPreparednessStatusBgColor(preparednessStatus.status)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-white/50">
              <Target className={`h-8 w-8 ${getPreparednessStatusColor(preparednessStatus.status)}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">Preparedness Goal Status</h2>
              <p className="text-slate-600">
                {metrics.normalUsageDays} of {settings.preparednessGoalDays} days target
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${getPreparednessStatusColor(preparednessStatus.status)}`}>
              {preparednessStatus.percentage.toFixed(1)}%
            </div>
            <div className={`text-sm font-medium capitalize ${getPreparednessStatusColor(preparednessStatus.status)}`}>
              {preparednessStatus.status}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-white/50 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all ${
                preparednessStatus.status === 'excellent' || preparednessStatus.status === 'good' ? 'bg-green-500' :
                preparednessStatus.status === 'adequate' ? 'bg-yellow-500' :
                preparednessStatus.status === 'poor' ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, preparednessStatus.percentage)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Sustainability"
          value={`${metrics.normalUsageDays} days`}
          subtitle={`Goal: ${settings.preparednessGoalDays} days`}
          icon={Users}
          color={getStatusColor(metrics.normalUsageDays)}
        />
        
        <MetricCard
          title="Food Supply"
          value={`${Math.min(...foodItems.map(item => {
            const totalCalories = item.quantity * (item.caloriesPerUnit || 0);
            const dailyNeeds = household.reduce((sum, member) => sum + member.dailyCalories, 0);
            return dailyNeeds > 0 ? Math.floor(totalCalories / (dailyNeeds * (item.usageRatePerPersonPerDay || 1))) : 0;
          }))} days`}
          icon={Apple}
          color={getStatusColor(Math.min(...foodItems.map(item => {
            const totalCalories = item.quantity * (item.caloriesPerUnit || 0);
            const dailyNeeds = household.reduce((sum, member) => sum + member.dailyCalories, 0);
            return dailyNeeds > 0 ? Math.floor(totalCalories / (dailyNeeds * (item.usageRatePerPersonPerDay || 1))) : 0;
          })))}
        />
        
        <MetricCard
          title="Water Supply"
          value={`${waterDaysWithMargin} days`}
          subtitle={`${totalWaterGallons} gallons (${settings.waterSafetyMargin}x margin)`}
          icon={Droplets}
          color={getStatusColor(waterDaysWithMargin)}
        />
        
        <MetricCard
          title="Inventory Value"
          value={`$${totalInventoryValue.toFixed(0)}`}
          subtitle={`${totalItems} total items`}
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Water Safety Margin Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-slate-800">Water Safety Analysis</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Base Water Need</p>
            <p className="text-2xl font-bold text-slate-800">{baseDailyWater.toFixed(1)}L/day</p>
            <p className="text-xs text-slate-500">Without safety margin</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">With Safety Margin</p>
            <p className="text-2xl font-bold text-blue-600">{dailyWaterWithMargin.toFixed(1)}L/day</p>
            <p className="text-xs text-blue-500">{settings.waterSafetyMargin}x multiplier</p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-sm text-slate-600 mb-1">Safety Buffer</p>
            <p className="text-2xl font-bold text-green-600">{waterDaysWithoutMargin - waterDaysWithMargin} days</p>
            <p className="text-xs text-green-500">Emergency reserve</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Safety Margin:</strong> Your {settings.waterSafetyMargin}x water safety margin accounts for 
            increased consumption during stress, potential contamination, and emergency situations. 
            Without this margin, your water would last {waterDaysWithoutMargin} days instead of {waterDaysWithMargin} days.
          </p>
        </div>
      </div>

      {/* Current Rationing Scenario */}
      {selectedScenario && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Current Scenario: {selectedScenario.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Duration</p>
              <p className="text-2xl font-bold text-slate-800">{rationedDays} days</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Calories per Person</p>
              <p className="text-2xl font-bold text-slate-800">
                {Math.round(metrics.dailyCaloriesPerPerson[state.selectedRationingScenario] || 0)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Reduction</p>
              <p className="text-2xl font-bold text-slate-800">{selectedScenario.reductionPercentage}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Warnings and Household Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WarningsList warnings={metrics.warningFlags} />
        <HouseholdSummary members={household} />
      </div>
      
      {/* Emergency Scenario Modal */}
      {showEmergencyModal && (
        <EmergencyScenarioPanel onClose={() => setShowEmergencyModal(false)} />
      )}
    </div>
  );
}