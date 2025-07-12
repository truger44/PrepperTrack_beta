import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, User, Globe, Shield, Bell, Database, Download, Upload, Trash2, Battery, Mail } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { PrepperSettings, ClimateZone } from '../../types';
import GeneralSettings from './GeneralSettings';
import UserPreferences from './UserPreferences';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import DataManagement from './DataManagement';
import BatterySaverSettings from './BatterySaverSettings';

type SettingsTab = 'general' | 'preferences' | 'security' | 'notifications' | 'data' | 'battery';

export default function Settings() {
  const { state, dispatch } = usePrepper();
  const { settings } = state;
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [tempSettings, setTempSettings] = useState<PrepperSettings>(settings);

  const settingsTabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, description: 'Basic system configuration' },
    { id: 'preferences', label: 'Preferences', icon: User, description: 'Personal preferences and display options' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Security and privacy settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts and notifications' },
    { id: 'battery', label: 'Battery Saver', icon: Battery, description: 'Mobile battery optimization settings' },
    { id: 'data', label: 'Data Management', icon: Database, description: 'Import, export, and backup options' },
  ] as const;

  const handleSettingsChange = (newSettings: Partial<PrepperSettings>) => {
    setTempSettings(prev => ({ ...prev, ...newSettings }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: tempSettings });
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    setTempSettings(settings);
    setHasUnsavedChanges(false);
  };

  const handleResetToDefaults = () => {
    const defaultSettings: PrepperSettings = {
      climateZone: 'temperate',
      preparednessGoalDays: 90,
      minimumCaloriesPerDay: 1200,
      waterSafetyMargin: 1.2,
    };
    setTempSettings(defaultSettings);
    setHasUnsavedChanges(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettings 
            settings={tempSettings} 
            onSettingsChange={handleSettingsChange}
          />
        );
      case 'preferences':
        return <UserPreferences />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'battery':
        return <BatterySaverSettings />;
      case 'data':
        return <DataManagement />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Settings</h1>
            <p className="text-slate-600">Configure your PrepperTrack system preferences and options</p>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Settings Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {settingsTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    activeTab === tab.id
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <IconComponent className={`h-5 w-5 ${
                      activeTab === tab.id ? 'text-green-600' : 'text-slate-500'
                    }`} />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  <p className={`text-sm ${
                    activeTab === tab.id ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {tab.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {settingsTabs.find(t => t.id === activeTab)?.label} Settings
          </h2>
          
          {activeTab === 'general' && (
            <button
              onClick={handleResetToDefaults}
              className="text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset to Defaults</span>
            </button>
          )}
        </div>
        
        {renderTabContent()}
      </div>
    </div>
  );
}