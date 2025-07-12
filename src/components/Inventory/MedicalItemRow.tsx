import React, { useState } from 'react';
import { Calendar, MapPin, Edit2, Trash2, AlertTriangle, Heart, Users, Shield } from 'lucide-react';
import { InventoryItem } from '../../types';
import { usePrepper } from '../../context/PrepperContext';

interface MedicalItemRowProps {
  item: InventoryItem;
}

export default function MedicalItemRow({ item }: MedicalItemRowProps) {
  const { state, dispatch } = usePrepper();
  const { household } = state;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (item.isMedicalRequired && item.requiredByMembers && item.requiredByMembers.length > 0) {
      alert('Cannot delete this medical item as it is required for household members\' medical conditions. Remove the medical condition from the member first.');
      return;
    }
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
  
  const requiredByMembers = item.requiredByMembers?.map(memberId => 
    household.find(member => member.id === memberId)?.name
  ).filter(Boolean) || [];

  const isRequired = item.isMedicalRequired && item.requiredByMembers && item.requiredByMembers.length > 0;
  const isMissing = item.quantity === 0;

  return (
    <tr className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
      isMissing ? 'bg-red-50 dark:bg-red-900/20' : ''
    }`}>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Heart className={`h-4 w-4 ${isRequired ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`} />
            {isRequired && <Shield className="h-3 w-3 text-orange-600 dark:text-orange-400" title="Required medical item" />}
          </div>
          <div>
            <p className={`font-medium ${isMissing ? 'text-red-800 dark:text-red-200' : 'text-slate-800 dark:text-slate-200'}`}>
              {item.name}
              {isMissing && <span className="ml-2 text-xs bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 px-2 py-1 rounded">MISSING</span>}
            </p>
            {item.notes && (
              <p className="text-sm text-slate-500 dark:text-slate-400">{item.notes}</p>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        {isRequired ? (
          <div className="space-y-1">
            {requiredByMembers.map((memberName, index) => (
              <div key={index} className="flex items-center space-x-1">
                <Users className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-blue-700 dark:text-blue-300">{memberName}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
            Optional
          </span>
        )}
      </td>
      
      <td className="px-6 py-4">
        <div>
          <p className={`font-medium ${isMissing ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}>
            {item.quantity} {item.unit}
          </p>
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
            className={`p-2 rounded-lg transition-colors ${
              isRequired 
                ? 'text-slate-400 cursor-not-allowed' 
                : 'text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
            }`}
            disabled={isRequired}
            title={isRequired ? 'Cannot delete required medical item' : 'Delete item'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Delete Medical Item</h3>
              {isRequired ? (
                <div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Cannot delete "{item.name}" because it is required for the following household members' medical conditions:
                  </p>
                  <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mb-4">
                    {requiredByMembers.map((memberName, index) => (
                      <li key={index}>{memberName}</li>
                    ))}
                  </ul>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Remove the medical condition from the member first to delete this item.
                  </p>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    Are you sure you want to delete "{item.name}"? This action cannot be undone.
                  </p>
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
              )}
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}