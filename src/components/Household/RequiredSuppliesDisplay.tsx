import React, { useState } from 'react';
import { Package, Plus, Check, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { InventoryItem } from '../../types';

interface RequiredSuppliesDisplayProps {
  requiredSupplies: string[];
  memberName: string;
}

export default function RequiredSuppliesDisplay({ requiredSupplies, memberName }: RequiredSuppliesDisplayProps) {
  const { state, dispatch } = usePrepper();
  const { inventory } = state;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<string>('');

  if (requiredSupplies.length === 0) {
    return null;
  }

  // Check which supplies are already in inventory
  const getSupplyStatus = (supply: string) => {
    const found = inventory.find(item => 
      item.name.toLowerCase().includes(supply.toLowerCase()) ||
      supply.toLowerCase().includes(item.name.toLowerCase())
    );
    return found ? { exists: true, item: found } : { exists: false, item: null };
  };

  const handleAddSupply = (supply: string) => {
    setSelectedSupply(supply);
    setShowAddModal(true);
  };

  const handleQuickAdd = () => {
    if (!selectedSupply) return;

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: selectedSupply,
      category: 'Medical',
      quantity: 1,
      unit: 'unit',
      storageLocation: 'Medical Cabinet',
      usageRatePerPersonPerDay: 0.01,
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: `Required for ${memberName}'s medical condition`,
      isMedicalRequired: true,
      requiredByMembers: [memberName], // This should be member ID, but we'll use name for now
    };

    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: newItem });
    setShowAddModal(false);
    setSelectedSupply('');
  };

  const missingSupplies = requiredSupplies.filter(supply => !getSupplyStatus(supply).exists);
  const availableSupplies = requiredSupplies.filter(supply => getSupplyStatus(supply).exists);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Package className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800">Required Medical Supplies</span>
          <span className="text-sm text-blue-600">({requiredSupplies.length} items)</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-slate-800">Available</span>
          </div>
          <p className="text-lg font-bold text-green-600">{availableSupplies.length}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-slate-800">Missing</span>
          </div>
          <p className="text-lg font-bold text-red-600">{missingSupplies.length}</p>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Missing Supplies */}
          {missingSupplies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-2">Missing Supplies</h4>
              <div className="space-y-2">
                {missingSupplies.map((supply, index) => (
                  <div key={index} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-red-800">{supply}</span>
                    </div>
                    <button
                      onClick={() => handleAddSupply(supply)}
                      className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add to Inventory</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Supplies */}
          {availableSupplies.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-green-800 mb-2">Available Supplies</h4>
              <div className="space-y-2">
                {availableSupplies.map((supply, index) => {
                  const status = getSupplyStatus(supply);
                  return (
                    <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-800">{supply}</span>
                      </div>
                      {status.item && (
                        <div className="text-xs text-green-600">
                          {status.item.quantity} {status.item.unit} in {status.item.storageLocation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Add Medical Supply</h3>
            <p className="text-slate-600 mb-4">
              Add "{selectedSupply}" to your medical inventory?
            </p>
            <div className="bg-slate-50 rounded-lg p-3 mb-4">
              <div className="text-sm space-y-1">
                <div><strong>Item:</strong> {selectedSupply}</div>
                <div><strong>Category:</strong> Medical</div>
                <div><strong>Quantity:</strong> 1 unit</div>
                <div><strong>Location:</strong> Medical Cabinet</div>
                <div><strong>Note:</strong> Required for {memberName}'s medical condition</div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleQuickAdd}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Add to Inventory
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-2 px-4 rounded-lg transition-colors"
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