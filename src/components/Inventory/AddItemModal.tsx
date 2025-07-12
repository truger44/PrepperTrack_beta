import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { InventoryItem, ItemCategory } from '../../types';
import { suggestUsageRate } from '../../utils/calculations';
import { sanitizeInventoryItem } from '../../utils/sanitization';
import SecureInput from '../Common/SecureInput';
import SecureTextArea from '../Common/SecureTextArea';

interface AddItemModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function AddItemModal({ onClose, onSave }: AddItemModalProps) {
  const { dispatch } = usePrepper();
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food - Grains' as ItemCategory,
    quantity: '',
    requiresRefrigeration: false,
    unit: '',
    expirationDate: '',
    storageLocation: '',
    caloriesPerUnit: '',
    usageRatePerPersonPerDay: '',
    cost: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories: ItemCategory[] = [
    'Food - Grains',
    'Food - Proteins',
    'Food - Vegetables',
    'Food - Fruits',
    'Food - Dairy',
    'Food - Canned',
    'Water',
    'Medical',
    'Tools',
    'Shelter',
    'Energy',
    'Communication',
    'Clothing',
    'Hygiene',
    'Security',
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Auto-suggest usage rate when category or name changes
    if (field === 'category' || field === 'name') {
      const category = field === 'category' ? value as ItemCategory : formData.category;
      const name = field === 'name' ? value : formData.name;
      if (category && name) {
        const suggestedRate = suggestUsageRate(category, name);
        if (suggestedRate > 0) {
          setFormData(prev => ({ ...prev, usageRatePerPersonPerDay: suggestedRate.toString() }));
        }
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Valid quantity is required';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.storageLocation.trim()) {
      newErrors.storageLocation = 'Storage location is required';
    }

    if (!formData.usageRatePerPersonPerDay || parseFloat(formData.usageRatePerPersonPerDay) <= 0) {
      newErrors.usageRatePerPersonPerDay = 'Valid usage rate is required';
    }

    if (formData.cost && parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Cost cannot be negative';
    }

    if (formData.caloriesPerUnit && parseFloat(formData.caloriesPerUnit) < 0) {
      newErrors.caloriesPerUnit = 'Calories cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const rawItem = {
      id: Date.now().toString(),
      name: formData.name,
      requiresRefrigeration: formData.requiresRefrigeration,
      category: formData.category,
      quantity: parseFloat(formData.quantity),
      unit: formData.unit,
      expirationDate: formData.expirationDate || undefined,
      storageLocation: formData.storageLocation,
      caloriesPerUnit: formData.caloriesPerUnit ? parseFloat(formData.caloriesPerUnit) : undefined,
      usageRatePerPersonPerDay: parseFloat(formData.usageRatePerPersonPerDay) || 0.1,
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      notes: formData.notes || undefined,
      dateAdded: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    // Sanitize the item data before adding to state
    const sanitizedItem = sanitizeInventoryItem(rawItem);
    
    if (sanitizedItem) {
      dispatch({ type: 'ADD_INVENTORY_ITEM', payload: sanitizedItem as InventoryItem });
      onSave();
    } else {
      setErrors({ general: 'Failed to save item due to invalid data' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Add New Item</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Item Name *
              </label>
              <SecureInput
                sanitizationType="text"
                value={formData.name}
                onChange={(value) => handleInputChange('name', value)}
                placeholder="e.g., White Rice (50lb bag)"
                validator={(value) => value.length > 0 && value.length <= 100}
                onValidationError={(error) => setErrors(prev => ({ ...prev, name: error }))}
              />
              {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity *
              </label>
              <SecureInput
                sanitizationType="number"
                value={formData.quantity}
                onChange={(value) => handleInputChange('quantity', value.toString())}
                placeholder="e.g., 2"
                validator={(value) => value > 0 && value <= 999999}
                onValidationError={(error) => setErrors(prev => ({ ...prev, quantity: error }))}
              />
              {errors.quantity && <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Unit *
              </label>
              <SecureInput
                sanitizationType="text"
                value={formData.unit}
                onChange={(value) => handleInputChange('unit', value)}
                placeholder="e.g., bags, cans, gallons"
                validator={(value) => value.length > 0 && value.length <= 20}
                onValidationError={(error) => setErrors(prev => ({ ...prev, unit: error }))}
              />
              {errors.unit && <p className="text-red-600 text-xs mt-1">{errors.unit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expiration Date
              </label>
              <SecureInput
                type="date"
                sanitizationType="date"
                value={formData.expirationDate}
                onChange={(value) => handleInputChange('expirationDate', value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Storage Location *
              </label>
              <SecureInput
                sanitizationType="text"
                value={formData.storageLocation}
                onChange={(value) => handleInputChange('storageLocation', value)}
                placeholder="e.g., Pantry - Top Shelf"
                validator={(value) => value.length > 0 && value.length <= 100}
                onValidationError={(error) => setErrors(prev => ({ ...prev, storageLocation: error }))}
              />
              {errors.storageLocation && <p className="text-red-600 text-xs mt-1">{errors.storageLocation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Calories per Unit
              </label>
              <SecureInput
                sanitizationType="number"
                value={formData.caloriesPerUnit}
                onChange={(value) => handleInputChange('caloriesPerUnit', value.toString())}
                placeholder="e.g., 36000"
                validator={(value) => value >= 0 && value <= 999999}
                onValidationError={(error) => setErrors(prev => ({ ...prev, caloriesPerUnit: error }))}
              />
              {errors.caloriesPerUnit && <p className="text-red-600 text-xs mt-1">{errors.caloriesPerUnit}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Usage Rate (per person/day) *
              </label>
              <SecureInput
                sanitizationType="number"
                value={formData.usageRatePerPersonPerDay}
                onChange={(value) => handleInputChange('usageRatePerPersonPerDay', value.toString())}
                placeholder="e.g., 0.5"
                validator={(value) => value > 0 && value <= 100}
                onValidationError={(error) => setErrors(prev => ({ ...prev, usageRatePerPersonPerDay: error }))}
              />
              {errors.usageRatePerPersonPerDay && <p className="text-red-600 text-xs mt-1">{errors.usageRatePerPersonPerDay}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cost per Unit
              </label>
              <SecureInput
                sanitizationType="number"
                value={formData.cost}
                onChange={(value) => handleInputChange('cost', value.toString())}
                placeholder="e.g., 45.99"
                validator={(value) => value >= 0 && value <= 999999}
                onValidationError={(error) => setErrors(prev => ({ ...prev, cost: error }))}
              />
              {errors.cost && <p className="text-red-600 text-xs mt-1">{errors.cost}</p>}
            </div>

            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresRefrigeration}
                  onChange={(e) => handleInputChange('requiresRefrigeration', e.target.checked)}
                  className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Requires Refrigeration
                </span>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-6">
                Check this if the item needs to be kept cold
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes
              </label>
              <SecureTextArea
                value={formData.notes}
                onChange={(value) => handleInputChange('notes', value)}
                rows={3}
                placeholder="Additional notes about storage, preparation, etc."
                maxLength={500}
                validator={(value) => value.length <= 500}
                onValidationError={(error) => setErrors(prev => ({ ...prev, notes: error }))}
              />
              {errors.notes && <p className="text-red-600 text-xs mt-1">{errors.notes}</p>}
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>Add Item</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}