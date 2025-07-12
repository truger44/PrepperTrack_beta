import React from 'react';
import { Package, Calendar, MapPin, DollarSign, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryReportProps {
  inventory: InventoryItem[];
  compact?: boolean;
}

export default function InventoryReport({ inventory, compact = false }: InventoryReportProps) {
  const totalValue = inventory.reduce((sum, item) => sum + (item.cost || 0) * item.quantity, 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  
  const categoryBreakdown = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationBreakdown = inventory.reduce((acc, item) => {
    acc[item.storageLocation] = (acc[item.storageLocation] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort food items by expiration date (earliest first)
  const foodItems = inventory
    .filter(item => item.category.startsWith('Food'))
    .sort((a, b) => {
      if (!a.expirationDate && !b.expirationDate) return 0;
      if (!a.expirationDate) return 1;
      if (!b.expirationDate) return -1;
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
    });

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return { status: 'none', color: 'text-slate-500', days: null };
    
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'text-red-600', days: Math.abs(daysUntilExpiry) };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', color: 'text-yellow-600', days: daysUntilExpiry };
    } else if (daysUntilExpiry <= 90) {
      return { status: 'warning', color: 'text-yellow-500', days: daysUntilExpiry };
    } else {
      return { status: 'good', color: 'text-green-600', days: daysUntilExpiry };
    }
  };

  if (compact) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Inventory Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Total Items</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{totalItems}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                <span className="font-medium text-slate-800 dark:text-slate-200">Total Value</span>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">${totalValue.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-slate-800 mb-3">Food Items by Expiration</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {foodItems.slice(0, 5).map((item) => {
              const expInfo = getExpirationStatus(item.expirationDate);
              return (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-600">{item.quantity} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${expInfo.color}`}>
                      {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'No expiration'}
                    </p>
                    {expInfo.days !== null && (
                      <p className={`text-xs ${expInfo.color}`}>
                        {expInfo.status === 'expired' 
                          ? `Expired ${expInfo.days} days ago`
                          : `${expInfo.days} days remaining`
                        }
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {foodItems.length > 5 && (
              <p className="text-sm text-slate-500 text-center py-2">
                +{foodItems.length - 5} more food items
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-3">
            <Package className="h-6 w-6 text-blue-600" />
            <span className="font-semibold text-blue-800">Total Inventory</span>
          </div>
          <p className="text-3xl font-bold text-blue-800">{inventory.length}</p>
          <p className="text-sm text-blue-600">Unique items</p>
        </div>

        <div className="bg-green-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-3">
            <Package className="h-6 w-6 text-green-600" />
            <span className="font-semibold text-green-800">Total Quantity</span>
          </div>
          <p className="text-3xl font-bold text-green-800">{totalItems}</p>
          <p className="text-sm text-green-600">Individual units</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-3">
            <DollarSign className="h-6 w-6 text-purple-600" />
            <span className="font-semibold text-purple-800">Total Value</span>
          </div>
          <p className="text-3xl font-bold text-purple-800">${totalValue.toFixed(0)}</p>
          <p className="text-sm text-purple-600">Estimated cost</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryBreakdown)
            .sort(([,a], [,b]) => b - a)
            .map(([category, count]) => (
              <div key={category} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{category}</span>
                  <span className="text-lg font-bold text-slate-600">{count}</span>
                </div>
                <div className="mt-2 bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(count / inventory.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Storage Location Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Storage Locations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(locationBreakdown)
            .sort(([,a], [,b]) => b - a)
            .map(([location, count]) => (
              <div key={location} className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-slate-500" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">{location}</span>
                      <span className="text-lg font-bold text-slate-600">{count} items</span>
                    </div>
                    <div className="mt-2 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(count / inventory.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Food Items by Expiration (Detailed) */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Food Items by Expiration Date</h3>
        <div className="bg-slate-50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Item</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Category</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Quantity</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Expiration</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-slate-700">Location</th>
                </tr>
              </thead>
              <tbody>
                {foodItems.map((item) => {
                  const expInfo = getExpirationStatus(item.expirationDate);
                  return (
                    <tr key={item.id} className="border-b border-slate-100 hover:bg-white transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-800">{item.name}</p>
                          {item.caloriesPerUnit && (
                            <p className="text-sm text-slate-500">{item.caloriesPerUnit.toLocaleString()} cal/unit</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-sm">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800">{item.quantity} {item.unit}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${expInfo.color}`}>
                          {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'No expiration'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {(expInfo.status === 'expired' || expInfo.status === 'expiring') && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${expInfo.color}`}>
                            {expInfo.days !== null ? (
                              expInfo.status === 'expired' 
                                ? `Expired ${expInfo.days} days ago`
                                : `${expInfo.days} days remaining`
                            ) : 'No expiration'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{item.storageLocation}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {foodItems.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No food items in inventory</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}