import React, { useState } from 'react';
import { Database, Download, Upload, Trash2, RefreshCw, AlertTriangle, CheckCircle, FileText, HardDrive } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { sanitizeJsonData, validateFileUpload } from '../../utils/sanitization';

export default function DataManagement() {
  const { state, dispatch } = usePrepper();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [pendingImportData, setPendingImportData] = useState<any>(null);

  const handleExportData = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const exportData = {
        inventory: state.inventory,
        household: state.household,
        householdGroups: state.householdGroups,
        settings: state.settings,
        rationingScenarios: state.rationingScenarios,
        selectedRationingScenario: state.selectedRationingScenario,
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
      };

      // Sanitize export data
      const sanitizedData = sanitizeJsonData(exportData);

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(sanitizedData, null, 2);
        filename = `preppertrack-backup-${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
      } else {
        // Convert to CSV format
        const csvSections = [
          '# PrepperTrack Data Export',
          `# Exported on: ${new Date().toLocaleString()}`,
          '',
          '## Inventory',
          'Name,Category,Quantity,Unit,Expiration Date,Storage Location,Calories Per Unit,Usage Rate,Cost,Notes',
          ...state.inventory.map(item => [
            item.name,
            item.category,
            item.quantity,
            item.unit,
            item.expirationDate || '',
            item.storageLocation,
            item.caloriesPerUnit || '',
            item.usageRatePerPersonPerDay,
            item.cost || '',
            item.notes || ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')),
          '',
          '## Household Members',
          'Name,Age,Activity Level,Daily Calories,Daily Water,Group ID,Skills,Medical Conditions',
          ...state.household.map(member => [
            member.name,
            member.age,
            member.activityLevel,
            member.dailyCalories,
            member.dailyWaterLiters,
            member.groupId || '',
            member.skills?.join('; ') || '',
            member.medicalConditions?.join('; ') || ''
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')),
        ];
        content = csvSections.join('\n');
        filename = `preppertrack-export-${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setLastBackup(new Date().toISOString());
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file security
    const validation = validateFileUpload(file);
    if (!validation.isValid) {
      setImportError(validation.error || 'Invalid file');
      return;
    }

    setIsImporting(true);
    setImportError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Parse and sanitize JSON data
        const rawData = JSON.parse(content);
        const importData = sanitizeJsonData(rawData);

        // Validate the import data structure
        if (!importData.inventory || !importData.household || !importData.settings) {
          throw new Error('Invalid backup file format - missing required data sections');
        }

        // Additional validation for data integrity
        if (!Array.isArray(importData.inventory)) {
          throw new Error('Invalid inventory data format');
        }

        if (!Array.isArray(importData.household)) {
          throw new Error('Invalid household data format');
        }

        // Store the import data and show confirmation dialog
        setPendingImportData(importData);
        setShowImportConfirm(true);

      } catch (error) {
        console.error('Import failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setImportError(`Import failed: ${errorMessage}`);
      } finally {
        setIsImporting(false);
      }
    };

    reader.onerror = () => {
      setImportError('Failed to read file');
      setIsImporting(false);
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset file input
  };

  const confirmImport = () => {
    if (!pendingImportData) return;

    try {
      // Clear all existing inventory and household data first
      dispatch({ type: 'CLEAR_ALL_INVENTORY' });
      dispatch({ type: 'CLEAR_ALL_HOUSEHOLD' });
      dispatch({ type: 'CLEAR_ALL_HOUSEHOLD_GROUPS' });

      // Import the new data
      if (pendingImportData.inventory) {
        pendingImportData.inventory.forEach((item: any) => {
          if (item && typeof item === 'object' && item.id && item.name) {
            dispatch({ type: 'ADD_INVENTORY_ITEM', payload: item });
          }
        });
      }

      if (pendingImportData.household) {
        pendingImportData.household.forEach((member: any) => {
          if (member && typeof member === 'object' && member.id && member.name) {
            dispatch({ type: 'ADD_HOUSEHOLD_MEMBER', payload: member });
          }
        });
      }

      if (pendingImportData.householdGroups && Array.isArray(pendingImportData.householdGroups)) {
        pendingImportData.householdGroups.forEach((group: any) => {
          if (group && typeof group === 'object' && group.id && group.name) {
            dispatch({ type: 'ADD_HOUSEHOLD_GROUP', payload: group });
          }
        });
      }

      if (pendingImportData.settings && typeof pendingImportData.settings === 'object') {
        dispatch({ type: 'UPDATE_SETTINGS', payload: pendingImportData.settings });
      }

      if (pendingImportData.rationingScenarios && Array.isArray(pendingImportData.rationingScenarios)) {
        pendingImportData.rationingScenarios.forEach((scenario: any) => {
          if (scenario && typeof scenario === 'object' && scenario.id && scenario.name) {
            dispatch({ type: 'ADD_RATIONING_SCENARIO', payload: scenario });
          }
        });
      }

      if (pendingImportData.selectedRationingScenario) {
        dispatch({ type: 'SET_RATIONING_SCENARIO', payload: pendingImportData.selectedRationingScenario });
      }

      alert('Data imported successfully! All previous inventory and household data has been replaced.');
      setShowImportConfirm(false);
      setPendingImportData(null);
    } catch (error) {
      console.error('Import confirmation failed:', error);
      setImportError('Failed to import data. Please try again.');
      setShowImportConfirm(false);
      setPendingImportData(null);
    }
  };

  const cancelImport = () => {
    setShowImportConfirm(false);
    setPendingImportData(null);
    setImportError(null);
  };

  const handleClearAllData = () => {
    dispatch({ type: 'CLEAR_ALL_INVENTORY' });
    dispatch({ type: 'CLEAR_ALL_HOUSEHOLD' });
    dispatch({ type: 'CLEAR_ALL_HOUSEHOLD_GROUPS' });
    setShowDeleteConfirm(false);
    alert('All data has been cleared successfully.');
  };

  const calculateDataSize = () => {
    const dataString = JSON.stringify(state);
    const sizeInBytes = new Blob([dataString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    return sizeInKB;
  };

  return (
    <div className="space-y-8">
      {/* Data Overview */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Data Overview</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Current data storage and statistics</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3 mb-3">
              <HardDrive className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-blue-800 dark:text-blue-200">Storage Used</span>
            </div>
            <p className="text-3xl font-bold text-blue-800 dark:text-blue-200">{calculateDataSize()}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400">KB</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-6 w-6 text-green-600" />
              <span className="font-semibold text-green-800 dark:text-green-200">Inventory Items</span>
            </div>
            <p className="text-3xl font-bold text-green-800 dark:text-green-200">{state.inventory.length}</p>
            <p className="text-sm text-green-600 dark:text-green-400">Total items</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-6 w-6 text-purple-600" />
              <span className="font-semibold text-purple-800 dark:text-purple-200">Household</span>
            </div>
            <p className="text-3xl font-bold text-purple-800 dark:text-purple-200">{state.household.length}</p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Members</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center space-x-3 mb-3">
              <FileText className="h-6 w-6 text-orange-600" />
              <span className="font-semibold text-orange-800 dark:text-orange-200">Last Backup</span>
            </div>
            <p className="text-lg font-bold text-orange-800 dark:text-orange-200">
              {lastBackup ? new Date(lastBackup).toLocaleDateString() : 'Never'}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              {lastBackup ? new Date(lastBackup).toLocaleTimeString() : 'No backups'}
            </p>
          </div>
        </div>
      </div>

      {/* Export Data */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Export Data</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Download your data for backup or transfer</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Complete Backup (JSON)</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Export all data including settings, inventory, household, and scenarios in JSON format. 
              This format preserves all data and can be used to restore your complete setup.
            </p>
            <button
              onClick={() => handleExportData('json')}
              disabled={isExporting}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isExporting ? 'Exporting...' : 'Export JSON Backup'}</span>
            </button>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Data Export (CSV)</h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Export inventory and household data in CSV format for use in spreadsheets 
              or other applications. Settings and scenarios are not included.
            </p>
            <button
              onClick={() => handleExportData('csv')}
              disabled={isExporting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isExporting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{isExporting ? 'Exporting...' : 'Export CSV Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Import Data */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Upload className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Import Data</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Restore data from a backup file</p>
          </div>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-3">Restore from Backup</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Import data from a JSON backup file. This will <strong>completely replace</strong> all your existing 
            inventory and household data with the data from the backup file.
          </p>
          
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">Warning</span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                Importing will <strong>permanently delete</strong> all your current inventory items and household members. 
                This action cannot be undone. Make sure to export a backup first if you want to keep your current data.
              </p>
            </div>

            {importError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">Import Error</span>
                </div>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">{importError}</p>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </label>
              {isImporting && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Data Management</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Reset or clear your data</p>
          </div>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-3">Clear All Data</h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            This will permanently delete all your inventory, household, and settings data. 
            This action cannot be undone. Make sure to export a backup first.
          </p>
          
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Backup Recommendations */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Backup Recommendations</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Regular Backups</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Export your data weekly or after major changes</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Multiple Locations</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Store backups in multiple secure locations (cloud, external drive)</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Test Restores</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Periodically test importing your backups to ensure they work</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-200">Version Control</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Keep multiple backup versions with dates in filenames</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Confirmation Modal */}
      {showImportConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Confirm Data Import</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to import this backup? This will <strong>permanently delete</strong> all your current data and replace it with:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-1">
              <li>{pendingImportData?.inventory?.length || 0} inventory items</li>
              <li>{pendingImportData?.household?.length || 0} household members</li>
              <li>{pendingImportData?.householdGroups?.length || 0} household groups</li>
              <li>All settings and preferences</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={confirmImport}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Yes, Replace All Data
              </button>
              <button
                onClick={cancelImport}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Confirm Data Deletion</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you absolutely sure you want to delete all data? This action cannot be undone and will permanently remove:
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 mb-6 space-y-1">
              <li>All inventory items</li>
              <li>All household members and groups</li>
              <li>All settings and preferences</li>
              <li>All rationing scenarios</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={handleClearAllData}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}