import React, { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp, AlertTriangle, Users, Package, Droplets } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { calculateSustainabilityMetrics } from '../../utils/calculations';
import InventoryReport from './InventoryReport';
import SustainabilityReport from './SustainabilityReport';
import HouseholdReport from './HouseholdReport';
import ExpirationReport from './ExpirationReport';
import { generatePDFReport, generateCSVReport, generateJSONReport } from '../../utils/reportGenerator';

type ReportType = 'overview' | 'inventory' | 'sustainability' | 'household' | 'expiration';
type ExportFormat = 'pdf' | 'csv' | 'json';

export default function Reports() {
  const { state } = usePrepper();
  const { inventory, household, householdGroups, settings, rationingScenarios, selectedRationingScenario } = state;
  
  const [activeReport, setActiveReport] = useState<ReportType>('overview');
  const [isExporting, setIsExporting] = useState(false);

  const metrics = calculateSustainabilityMetrics(inventory, household, rationingScenarios, settings);

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: TrendingUp, description: 'Complete preparedness summary' },
    { id: 'inventory', label: 'Inventory', icon: Package, description: 'Detailed inventory analysis' },
    { id: 'sustainability', label: 'Sustainability', icon: Calendar, description: 'Supply duration analysis' },
    { id: 'household', label: 'Household', icon: Users, description: 'Member and group details' },
    { id: 'expiration', label: 'Expiration', icon: AlertTriangle, description: 'Expiration tracking' },
  ] as const;

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const reportData = {
        inventory,
        household,
        householdGroups,
        settings,
        rationingScenarios,
        selectedRationingScenario,
        metrics,
        generatedAt: new Date().toISOString(),
      };

      switch (format) {
        case 'pdf':
          await generatePDFReport(reportData, activeReport);
          break;
        case 'csv':
          generateCSVReport(reportData, activeReport);
          break;
        case 'json':
          generateJSONReport(reportData, activeReport);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const renderReportContent = () => {
    switch (activeReport) {
      case 'inventory':
        return <InventoryReport inventory={inventory} />;
      case 'sustainability':
        return <SustainabilityReport metrics={metrics} scenarios={rationingScenarios} household={household} />;
      case 'household':
        return <HouseholdReport household={household} groups={householdGroups} />;
      case 'expiration':
        return <ExpirationReport inventory={inventory} />;
      default:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/50 dark:to-blue-800/50 rounded-xl p-6 border border-blue-200 dark:border-blue-600">
                <div className="flex items-center justify-between mb-4">
                  <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">{inventory.length}</span>
                </div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">Total Items</h3>
                <p className="text-sm text-blue-600 dark:text-blue-300">Inventory count</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 rounded-xl p-6 border border-green-200 dark:border-green-600">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                  <span className="text-2xl font-bold text-green-800 dark:text-green-200">{household.length}</span>
                </div>
                <h3 className="font-semibold text-green-800 dark:text-green-200">Household Members</h3>
                <p className="text-sm text-green-600 dark:text-green-300">Total people</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/50 dark:to-orange-800/50 rounded-xl p-6 border border-orange-200 dark:border-orange-600">
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                  <span className="text-2xl font-bold text-orange-800 dark:text-orange-200">{metrics.normalUsageDays}</span>
                </div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">Days of Supply</h3>
                <p className="text-sm text-orange-600 dark:text-orange-300">Normal usage</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/50 dark:to-purple-800/50 rounded-xl p-6 border border-purple-200 dark:border-purple-600">
                <div className="flex items-center justify-between mb-4">
                  <AlertTriangle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">{metrics.warningFlags.length}</span>
                </div>
                <h3 className="font-semibold text-purple-800 dark:text-purple-200">Active Alerts</h3>
                <p className="text-sm text-purple-600 dark:text-purple-300">Warnings & issues</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InventoryReport inventory={inventory} compact />
              <ExpirationReport inventory={inventory} compact />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Reports & Analytics</h1>
            <p className="text-slate-600">Comprehensive analysis of your preparedness status</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-white rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => handleExport('pdf')}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 border-l border-slate-200"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 border-l border-slate-200"
              >
                JSON
              </button>
            </div>
          </div>
        </div>

        {/* Report Type Navigation */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportTypes.map((report) => {
              const IconComponent = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id as ReportType)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    activeReport === report.id
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <IconComponent className={`h-5 w-5 ${
                      activeReport === report.id ? 'text-green-600' : 'text-slate-500'
                    }`} />
                    <span className="font-medium">{report.label}</span>
                  </div>
                  <p className={`text-sm ${
                    activeReport === report.id ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {report.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">
            {reportTypes.find(r => r.id === activeReport)?.label} Report
          </h2>
          <div className="text-sm text-slate-500">
            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
}