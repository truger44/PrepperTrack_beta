import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { WarningFlag } from '../../types';

interface WarningsListProps {
  warnings: WarningFlag[];
}

export default function WarningsList({ warnings }: WarningsListProps) {
  const getWarningIcon = (type: string) => {
    switch (type) {
      case 'critical': return AlertTriangle;
      case 'warning': return AlertCircle;
      default: return Info;
    }
  };

  const getWarningColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200 dark:text-white dark:bg-red-900/50 dark:border-red-600';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-white dark:bg-yellow-900/50 dark:border-yellow-600';
      default: return 'text-blue-600 bg-blue-50 border-blue-200 dark:text-white dark:bg-blue-900/50 dark:border-blue-600';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Alerts & Warnings</h2>
      
      {warnings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-green-600 dark:text-white bg-green-50 dark:bg-green-900/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Info className="h-8 w-8" />
          </div>
          <p className="text-slate-600 dark:text-slate-300">All systems operational</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">No warnings or alerts to display</p>
        </div>
      ) : (
        <div className="space-y-3">
          {warnings.map((warning, index) => {
            const IconComponent = getWarningIcon(warning.type);
            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getWarningColor(warning.type)} flex items-start space-x-3`}
              >
                <IconComponent className="h-5 w-5 mt-1 flex-shrink-0 dark:text-white" />
                <div className="flex-1">
                  <p className="font-medium dark:text-white">{warning.category}</p>
                  <p className="text-sm dark:text-white opacity-90">{warning.message}</p>
                  {warning.daysRemaining !== undefined && (
                    <p className="text-xs dark:text-white opacity-80 mt-1">
                      {warning.daysRemaining > 0 
                        ? `${warning.daysRemaining} days remaining`
                        : `Expired ${Math.abs(warning.daysRemaining)} days ago`
                      }
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}