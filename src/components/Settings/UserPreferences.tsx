import React from 'react';
import { Monitor, Moon, Sun, Eye, Palette, Globe, Clock } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { ThemeMode, DisplayDensity, DateFormat, TimeFormat, Currency, Units, Language } from '../../types';

export default function UserPreferences() {
  const { state, dispatch } = usePrepper();
  const { userPreferences } = state;

  const handlePreferenceChange = (key: keyof typeof userPreferences, value: any) => {
    dispatch({ 
      type: 'UPDATE_USER_PREFERENCES', 
      payload: { [key]: value } 
    });
  };

  const formatPreview = {
    date: (() => {
      const date = new Date('2024-12-25');
      switch (userPreferences.dateFormat) {
        case 'MM/DD/YYYY': return '12/25/2024';
        case 'DD/MM/YYYY': return '25/12/2024';
        case 'YYYY-MM-DD': return '2024-12-25';
        case 'DD MMM YYYY': return '25 Dec 2024';
        default: return '12/25/2024';
      }
    })(),
    time: userPreferences.timeFormat === '12h' ? '2:30 PM' : '14:30',
    currency: (() => {
      const symbols = { USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥' };
      return `${symbols[userPreferences.currency]}45.99`;
    })(),
    weight: userPreferences.units === 'imperial' ? '50 lbs' : '22.7 kg',
    temperature: userPreferences.units === 'imperial' ? '72°F' : '22°C',
    volume: userPreferences.units === 'imperial' ? '5 gallons' : '18.9 liters',
  };

  return (
    <div className="space-y-8">
      {/* Theme Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Appearance</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Customize the look and feel of the application</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'light' as ThemeMode, label: 'Light', icon: Sun, description: 'Light theme for daytime use' },
              { value: 'dark' as ThemeMode, label: 'Dark', icon: Moon, description: 'Dark theme for low-light environments' },
              { value: 'system' as ThemeMode, label: 'System', icon: Monitor, description: 'Follow system preference' },
            ].map((theme) => {
              const IconComponent = theme.icon;
              return (
                <button
                  key={theme.value}
                  onClick={() => handlePreferenceChange('theme', theme.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    userPreferences.theme === theme.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <IconComponent className={`h-5 w-5 ${
                      userPreferences.theme === theme.value ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                    }`} />
                    <span className="font-medium">{theme.label}</span>
                  </div>
                  <p className={`text-sm ${
                    userPreferences.theme === theme.value ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {theme.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Display Density</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'compact' as DisplayDensity, label: 'Compact', description: 'More content, less spacing' },
              { value: 'comfortable' as DisplayDensity, label: 'Comfortable', description: 'Balanced spacing and content' },
              { value: 'spacious' as DisplayDensity, label: 'Spacious', description: 'More spacing, easier reading' },
            ].map((density) => (
              <button
                key={density.value}
                onClick={() => handlePreferenceChange('density', density.value)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  userPreferences.density === density.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="font-medium mb-1">{density.label}</div>
                <div className={`text-sm ${
                  userPreferences.density === density.value ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {density.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Localization */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Localization</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Language, date, time, and regional settings</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Language</label>
            <select
              value={userPreferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value as Language)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
            <select
              value={userPreferences.currency}
              onChange={(e) => handlePreferenceChange('currency', e.target.value as Currency)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Format</label>
            <select
              value={userPreferences.dateFormat}
              onChange={(e) => handlePreferenceChange('dateFormat', e.target.value as DateFormat)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Time Format</label>
            <select
              value={userPreferences.timeFormat}
              onChange={(e) => handlePreferenceChange('timeFormat', e.target.value as TimeFormat)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="12h">12-hour (AM/PM)</option>
              <option value="24h">24-hour</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Units</label>
            <select
              value={userPreferences.units}
              onChange={(e) => handlePreferenceChange('units', e.target.value as Units)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <option value="imperial">Imperial (lbs, °F, gallons)</option>
              <option value="metric">Metric (kg, °C, liters)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interface Options */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Eye className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Interface Options</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Customize interface behavior and interactions</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Animations</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Enable smooth transitions and animations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.animations}
                onChange={(e) => handlePreferenceChange('animations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Sound Effects</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Play sounds for notifications and interactions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.sounds}
                onChange={(e) => handlePreferenceChange('sounds', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Auto-Save</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically save changes as you work</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.autoSave}
                onChange={(e) => handlePreferenceChange('autoSave', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Live Preview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Sample Date:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatPreview.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Sample Time:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatPreview.time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Sample Price:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatPreview.currency}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Sample Weight:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatPreview.weight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Temperature:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatPreview.temperature}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600 dark:text-slate-400">Volume:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">{formatPreview.volume}</span>
          </div>
        </div>
      </div>
    </div>
  );
}