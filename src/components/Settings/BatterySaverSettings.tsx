import React from 'react';
import { Battery, Smartphone, Zap, Eye, Palette, Activity } from 'lucide-react';
import { useBatterySaverContext } from '../Common/BatterySaverProvider';

export default function BatterySaverSettings() {
  const { 
    isActive, 
    batteryInfo, 
    settings, 
    performanceLevel,
    toggleBatterySaver,
    updateSettings,
    isBatteryAPISupported 
  } = useBatterySaverContext();

  const handleSettingChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* Battery Status */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Battery className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Battery Status</h3>
            <p className="text-sm text-slate-600">Current battery and performance information</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Battery className={`h-5 w-5 ${
                batteryInfo?.charging ? 'text-green-600' : 
                batteryInfo?.level <= 20 ? 'text-red-600' : 'text-slate-600'
              }`} />
              <span className="font-medium text-slate-800">Battery Level</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {isBatteryAPISupported && batteryInfo ? 
                `${Math.round(batteryInfo.level)}%` : 
                'Unknown'
              }
            </p>
            {batteryInfo?.charging && (
              <p className="text-sm text-green-600">Charging</p>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Activity className={`h-5 w-5 ${
                performanceLevel === 'high' ? 'text-green-600' :
                performanceLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
              }`} />
              <span className="font-medium text-slate-800">Performance</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 capitalize">
              {performanceLevel}
            </p>
            <p className="text-sm text-slate-600">Current level</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Zap className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-slate-600'}`} />
              <span className="font-medium text-slate-800">Battery Saver</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {isActive ? 'Active' : 'Inactive'}
            </p>
            <button
              onClick={() => toggleBatterySaver()}
              className={`text-sm font-medium ${
                isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'
              }`}
            >
              {isActive ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>

        {!isBatteryAPISupported && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Battery API is not supported on this device. 
              Battery saver can still be manually enabled for performance optimizations.
            </p>
          </div>
        )}
      </div>

      {/* Battery Saver Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Smartphone className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Battery Saver Configuration</h3>
            <p className="text-sm text-slate-600">Configure when and how battery saver activates</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Enable Battery Saver</h4>
              <p className="text-sm text-slate-600">Manually enable battery saving optimizations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleSettingChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Auto-Enable</h4>
              <p className="text-sm text-slate-600">Automatically enable when battery is low</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoEnable}
                onChange={(e) => handleSettingChange('autoEnable', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.autoEnable && (
            <div className="ml-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Auto-Enable Threshold
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={settings.autoEnableThreshold}
                  onChange={(e) => handleSettingChange('autoEnableThreshold', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-blue-800 min-w-[40px]">
                  {settings.autoEnableThreshold}%
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                Enable battery saver when battery level drops below this percentage
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Optimizations */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Performance Optimizations</h3>
            <p className="text-sm text-slate-600">Choose which optimizations to apply when battery saver is active</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Reduce Animations</h4>
              <p className="text-sm text-slate-600">Disable transitions and animations to save CPU</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedAnimations}
                onChange={(e) => handleSettingChange('reducedAnimations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Reduce Background Updates</h4>
              <p className="text-sm text-slate-600">Slower data refresh rates to reduce CPU usage</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedPolling}
                onChange={(e) => handleSettingChange('reducedPolling', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Reduce Rendering Quality</h4>
              <p className="text-sm text-slate-600">Lower visual quality for better performance</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reducedRendering}
                onChange={(e) => handleSettingChange('reducedRendering', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Simplified UI</h4>
              <p className="text-sm text-slate-600">Hide non-essential UI elements</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.simplifiedUI}
                onChange={(e) => handleSettingChange('simplifiedUI', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Force Dark Mode</h4>
              <p className="text-sm text-slate-600">Use dark theme to reduce screen power consumption</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Battery Saving Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h4 className="font-semibold text-slate-800 mb-4">Battery Saving Tips</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-slate-800">Reduce Screen Brightness</p>
              <p className="text-sm text-slate-600">Lower your device's screen brightness to save significant battery</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-slate-800">Close Background Apps</p>
              <p className="text-sm text-slate-600">Close other browser tabs and applications you're not using</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-slate-800">Use WiFi When Available</p>
              <p className="text-sm text-slate-600">WiFi typically uses less power than cellular data</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="font-medium text-slate-800">Enable Auto-Brightness</p>
              <p className="text-sm text-slate-600">Let your device automatically adjust screen brightness</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}