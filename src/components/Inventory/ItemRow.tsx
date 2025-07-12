import React, { useState } from 'react';
import { Calendar, MapPin, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { InventoryItem } from '../../types';
import { usePrepper } from '../../context/PrepperContext';

interface ItemRowProps {
  item: InventoryItem;
}

export default function ItemRow({ item }: ItemRowProps) {
  const { dispatch } = usePrepper();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: item.id });
    setShowDeleteConfirm(false);
  };

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

  const expirationInfo = getExpirationStatus(item.expirationDate);
  const formattedDate = item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'N/A';

  return (
    <tr className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{item.name}</p>
          {item.requiresRefrigeration && (
            <span className="inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs rounded-full mt-1">
              Refrigerated
            </span>
          )}
          {item.caloriesPerUnit && (
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.caloriesPerUnit.toLocaleString()} cal/unit</p>
          )}
        </div>
      </td>
      
      <td className="px-6 py-4">
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
          {item.category}
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-200">{item.quantity} {item.unit}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.usageRatePerPersonPerDay}/person/day</p>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          {expirationInfo.status === 'expired' && <AlertTriangle className="h-4 w-4 text-red-500" />}
          {expirationInfo.status === 'expiring' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
          <div>
            <p className={`font-medium ${expirationInfo.color}`}>{formattedDate}</p>
            {expirationInfo.days !== null && (
              <p className={`text-sm ${expirationInfo.color}`}>
                {expirationInfo.status === 'expired' 
                  ? `Expired ${expirationInfo.days} days ago`
                  : `${expirationInfo.days} days remaining`
                }
              </p>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <span className="text-slate-600 dark:text-slate-300">{item.storageLocation}</span>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Delete Item</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">Are you sure you want to delete "{item.name}"? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
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
      </td>
    </tr>
  );
}