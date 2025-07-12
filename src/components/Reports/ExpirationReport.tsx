import React from 'react';
import { Calendar, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { InventoryItem } from '../../types';

interface ExpirationReportProps {
  inventory: InventoryItem[];
  compact?: boolean;
}

export default function ExpirationReport({ inventory, compact = false }: ExpirationReportProps) {
  const today = new Date();
  
  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return { status: 'none', color: 'text-slate-500', days: null, category: 'No Expiration' };
    
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', days: Math.abs(daysUntilExpiry), category: 'Expired' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'critical', color: 'text-red-600', days: daysUntilExpiry, category: 'Expires This Week' };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'text-yellow-600', days: daysUntilExpiry, category: 'Expires This Month' };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'caution', color: 'text-yellow-500', days: daysUntilExpiry, category: 'Expires in 3 Months' };
    } else {
      return { status: 'good', color: 'text-green-600', days: daysUntilExpiry, category: 'Good' };
    }
  };

  // Categorize items by expiration status
  const categorizedItems = inventory.reduce((acc, item) => {
    const status = getExpirationStatus(item.expirationDate);
    if (!acc[status.category]) {
      acc[status.category] = [];
    }
    acc[status.category].push({ ...item, expirationInfo: status });
    return acc;
  }, {} as Record<string, Array<InventoryItem & { expirationInfo: ReturnType<typeof getExpirationStatus> }>>);

  // Sort items within each category by expiration date
  Object.keys(categorizedItems).forEach(category => {
    categorizedItems[category].sort((a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });
  });

  const categoryOrder = ['Expired', 'Expires This Week', 'Expires This Month', 'Expires in 3 Months', 'Good', 'No Expiration'];
  const orderedCategories = categoryOrder.filter(cat => categorizedItems[cat]?.length > 0);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Expired':
      case 'Expires This Week':
        return AlertTriangle;
      case 'Expires This Month':
      case 'Expires in 3 Months':
        return Clock;
      case 'Good':
        return CheckCircle;
      default:
        return Calendar;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Expired':
      case 'Expires This Week':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'Expires This Month':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Expires in 3 Months':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'Good':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (compact) {
    const criticalItems = [
      ...(categorizedItems['Expired'] || []),
      ...(categorizedItems['Expires This Week'] || []),
      ...(categorizedItems['Expires This Month'] || [])
    ].slice(0, 5);

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Expiration Alerts</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-red-50 dark:bg-red-900/50 rounded-lg p-4 border border-red-200 dark:border-red-600">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="font-medium text-red-800 dark:text-red-200">Expired</span>
              </div>
              <p className="text-2xl font-bold text-red-800 dark:text-red-200">{categorizedItems['Expired']?.length || 0}</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/50 rounded-lg p-4 border border-yellow-200 dark:border-yellow-600">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">This Week</span>
              </div>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{categorizedItems['Expires This Week']?.length || 0}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/50 rounded-lg p-4 border border-orange-200 dark:border-orange-600">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <span className="font-medium text-orange-800 dark:text-orange-200">This Month</span>
              </div>
              <p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{categorizedItems['Expires This Month']?.length || 0}</p>
            </div>
          </div>
        </div>

        {criticalItems.length > 0 && (
          <div>
            <h4 className="font-medium text-slate-800 mb-3">Items Requiring Attention</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {criticalItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.quantity} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${item.expirationInfo.color}`}>
                      {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'No expiration'}
                    </p>
                    {item.expirationInfo.days !== null && (
                      <p className={`text-xs ${item.expirationInfo.color}`}>
                        {item.expirationInfo.status === 'expired' 
                          ? `Expired ${item.expirationInfo.days} days ago`
                          : `${item.expirationInfo.days} days remaining`
                        }
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-red-50 rounded-lg p-6 border border-red-200">
          <div className="flex items-center space-x-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <span className="font-semibold text-red-800">Expired</span>
          </div>
          <p className="text-3xl font-bold text-red-800">{categorizedItems['Expired']?.length || 0}</p>
          <p className="text-sm text-red-600">Items past expiration</p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-center space-x-3 mb-3">
            <Clock className="h-6 w-6 text-yellow-600" />
            <span className="font-semibold text-yellow-800">This Week</span>
          </div>
          <p className="text-3xl font-bold text-yellow-800">{categorizedItems['Expires This Week']?.length || 0}</p>
          <p className="text-sm text-yellow-600">Expiring in 7 days</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
          <div className="flex items-center space-x-3 mb-3">
            <Calendar className="h-6 w-6 text-orange-600" />
            <span className="font-semibold text-orange-800">This Month</span>
          </div>
          <p className="text-3xl font-bold text-orange-800">{categorizedItems['Expires This Month']?.length || 0}</p>
          <p className="text-sm text-orange-600">Expiring in 30 days</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-green-800">Good</span>
          </div>
          <p className="text-3xl font-bold text-green-800">{categorizedItems['Good']?.length || 0}</p>
          <p className="text-sm text-green-600">Long-term storage</p>
        </div>
      </div>

      {/* Detailed Breakdown by Category */}
      <div className="space-y-6">
        {orderedCategories.map((category) => {
          const items = categorizedItems[category];
          const IconComponent = getCategoryIcon(category);
          const colorClasses = getCategoryColor(category);
          
          return (
            <div key={category} className={`rounded-lg border p-6 ${colorClasses}`}>
              <div className="flex items-center space-x-3 mb-4">
                <IconComponent className="h-6 w-6" />
                <h3 className="text-lg font-semibold">{category}</h3>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/50">
                  {items.length} items
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-current/20">
                    <tr>
                      <th className="text-left py-2 font-medium">Item</th>
                      <th className="text-left py-2 font-medium">Category</th>
                      <th className="text-left py-2 font-medium">Quantity</th>
                      <th className="text-left py-2 font-medium">Expiration Date</th>
                      <th className="text-left py-2 font-medium">Days Remaining</th>
                      <th className="text-left py-2 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-current/10 last:border-b-0">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.caloriesPerUnit && (
                              <p className="text-sm opacity-75">{item.caloriesPerUnit.toLocaleString()} cal/unit</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 bg-white/30 rounded-full text-sm">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="font-medium">{item.quantity} {item.unit}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-medium">
                            {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'No expiration'}
                          </span>
                        </td>
                        <td className="py-3">
                          {item.expirationInfo.days !== null ? (
                            <span className="font-medium">
                              {item.expirationInfo.status === 'expired' 
                                ? `Expired ${item.expirationInfo.days} days ago`
                                : `${item.expirationInfo.days} days`
                              }
                            </span>
                          ) : (
                            <span className="opacity-75">N/A</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="opacity-75">{item.storageLocation}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {orderedCategories.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 mb-2">No items with expiration dates</p>
          <p className="text-sm text-slate-500">Add expiration dates to your inventory items to track freshness</p>
        </div>
      )}
    </div>
  );
}