import React, { useState } from 'react';
import { Zap, Waves, Brush as Virus, X, AlertTriangle, Clock, Home, Check } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { EmergencyScenario } from '../../types';
import { getPowerOutageTips, getFloodTips, getPandemicTips } from '../../data/emergencyTips';

interface EmergencyScenarioPanelProps {
  onClose: () => void;
}

export default function EmergencyScenarioPanel({ onClose }: EmergencyScenarioPanelProps) {
  const { dispatch } = usePrepper();
  const [selectedScenario, setSelectedScenario] = useState<'power_outage' | 'flood' | 'pandemic'>('power_outage');
  const [powerOutageDuration, setPowerOutageDuration] = useState<number>(30);
  const [basementFlooded, setBasementFlooded] = useState<boolean>(false);
  
  const handleActivateEmergency = () => {
    let tips: string[] = [];
    
    switch (selectedScenario) {
      case 'power_outage':
        tips = getPowerOutageTips();
        break;
      case 'flood':
        tips = getFloodTips();
        break;
      case 'pandemic':
        tips = getPandemicTips();
        break;
    }
    
    const emergencyScenario: EmergencyScenario = {
      type: selectedScenario,
      active: true,
      startDate: new Date().toISOString(),
      tips,
    };
    
    // Add scenario-specific properties
    if (selectedScenario === 'power_outage') {
      emergencyScenario.duration = powerOutageDuration;
    } else if (selectedScenario === 'flood') {
      emergencyScenario.basementFlooded = basementFlooded;
    }
    
    dispatch({ type: 'ACTIVATE_EMERGENCY', payload: emergencyScenario });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Activate Emergency Scenario</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Activating an emergency scenario will adjust your inventory and preparedness metrics to simulate how your supplies would hold up in a real emergency.
            </p>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">This is a simulation</span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Your actual inventory will not be modified. This feature helps you understand how different emergency scenarios would affect your preparedness.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select Emergency Scenario
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSelectedScenario('power_outage')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedScenario === 'power_outage'
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Zap className={`h-5 w-5 ${
                      selectedScenario === 'power_outage' ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'
                    }`} />
                    <span className="font-medium">Power Outage</span>
                  </div>
                  <p className={`text-sm ${
                    selectedScenario === 'power_outage' ? 'text-yellow-600 dark:text-yellow-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    No electricity, refrigeration, or heating/cooling
                  </p>
                </button>

                <button
                  onClick={() => setSelectedScenario('flood')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedScenario === 'flood'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Waves className={`h-5 w-5 ${
                      selectedScenario === 'flood' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                    }`} />
                    <span className="font-medium">Flood</span>
                  </div>
                  <p className={`text-sm ${
                    selectedScenario === 'flood' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Water damage, limited mobility, basement access
                  </p>
                </button>

                <button
                  onClick={() => setSelectedScenario('pandemic')}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedScenario === 'pandemic'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Virus className={`h-5 w-5 ${
                      selectedScenario === 'pandemic' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                    }`} />
                    <span className="font-medium">Pandemic</span>
                  </div>
                  <p className={`text-sm ${
                    selectedScenario === 'pandemic' ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    Limited resupply, isolation, increased medical needs
                  </p>
                </button>
              </div>
            </div>

            {/* Scenario-specific settings */}
            {selectedScenario === 'power_outage' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-600 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Power Outage Duration</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                      Estimated hours without power
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="168"
                        step="1"
                        value={powerOutageDuration}
                        onChange={(e) => setPowerOutageDuration(parseInt(e.target.value))}
                        className="flex-1 h-2 bg-yellow-200 dark:bg-yellow-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="w-16 text-center font-medium text-yellow-800 dark:text-yellow-200">
                        {powerOutageDuration}h
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">
                    <p className="mb-2">Impact on your inventory:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Refrigerated items will spoil after {powerOutageDuration} hours</li>
                      <li>Heating and cooling systems will be unavailable</li>
                      <li>Electronic devices will only work until batteries are depleted</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedScenario === 'flood' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Home className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-medium text-blue-800 dark:text-blue-200">Basement Status</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!basementFlooded}
                        onChange={() => setBasementFlooded(false)}
                        className="rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-blue-800 dark:text-blue-200">Basement is secure</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={basementFlooded}
                        onChange={() => setBasementFlooded(true)}
                        className="rounded-full border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-blue-800 dark:text-blue-200">Basement is flooded</span>
                    </label>
                  </div>
                  
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="mb-2">Impact on your inventory:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      {basementFlooded ? (
                        <>
                          <li>Items stored in basement will be inaccessible</li>
                          <li>Only canned goods in basement will be salvageable</li>
                          <li>Water contamination risk is high</li>
                        </>
                      ) : (
                        <>
                          <li>All basement items remain accessible</li>
                          <li>Consider moving critical supplies to higher ground</li>
                          <li>Monitor water levels regularly</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {selectedScenario === 'pandemic' && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-600 rounded-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <Virus className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-medium text-purple-800 dark:text-purple-200">Pandemic Considerations</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <p className="mb-2">Impact on your preparedness:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Limited ability to resupply as stores may be closed</li>
                      <li>Increased need for medical supplies and PPE</li>
                      <li>Isolation may require mental health considerations</li>
                      <li>Focus on maintaining hygiene and preventing transmission</li>
                    </ul>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                    <Check className="h-5 w-5" />
                    <p className="text-sm">
                      Your medical inventory will be analyzed for pandemic-specific needs
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              onClick={handleActivateEmergency}
              className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <AlertTriangle className="h-5 w-5" />
              <span>Activate Emergency</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}