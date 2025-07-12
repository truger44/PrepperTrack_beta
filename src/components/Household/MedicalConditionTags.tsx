import React, { useState } from 'react';
import { Plus, X, Search, AlertTriangle } from 'lucide-react';
import { medicalConditions, getCategoryColor, getCategoryIcon, MedicalCondition } from '../../data/medicalConditionsData';
import { usePrepper } from '../../context/PrepperContext';

interface MedicalConditionTagsProps {
  selectedConditions: string[];
  onConditionsChange: (conditions: string[]) => void;
  onSuppliesNeeded?: (supplies: string[]) => void;
}

export default function MedicalConditionTags({ 
  selectedConditions, 
  onConditionsChange, 
  onSuppliesNeeded 
}: MedicalConditionTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { dispatch } = usePrepper();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🏥' },
    { value: 'chronic', label: 'Chronic Conditions', icon: '🩺' },
    { value: 'acute', label: 'Acute Conditions', icon: '⚡' },
    { value: 'mental_health', label: 'Mental Health', icon: '🧠' },
    { value: 'physical_disability', label: 'Physical Disabilities', icon: '♿' },
    { value: 'sensory', label: 'Sensory Impairments', icon: '👁️' },
  ];

  const filteredConditions = medicalConditions.filter(condition => {
    const matchesSearch = condition.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || condition.category === selectedCategory;
    const notAlreadySelected = !selectedConditions.includes(condition.name);
    return matchesSearch && matchesCategory && notAlreadySelected;
  });

  const handleAddCondition = (condition: MedicalCondition) => {
    const newConditions = [...selectedConditions, condition.name];
    onConditionsChange(newConditions);
    
    // Add required medical supplies to inventory
    if (condition.requiredSupplies.length > 0) {
      dispatch({
        type: 'ADD_REQUIRED_MEDICAL_ITEMS',
        payload: {
          memberId: 'temp-id', // This will be replaced with the actual member ID when the member is saved
          requiredSupplies: condition.requiredSupplies
        }
      });
    }
    
    // Collect all required supplies for all selected conditions
    if (onSuppliesNeeded) {
      const allSupplies = new Set<string>();
      
      // Add supplies for the newly selected condition
      condition.requiredSupplies.forEach(supply => allSupplies.add(supply));
      
      // Add supplies for existing conditions
      newConditions.forEach(conditionName => {
        const existingCondition = medicalConditions.find(c => c.name === conditionName);
        if (existingCondition) {
          existingCondition.requiredSupplies.forEach(supply => allSupplies.add(supply));
        }
      });
      
      onSuppliesNeeded(Array.from(allSupplies));
    }
    
    setSearchTerm('');
  };

  const handleRemoveCondition = (conditionName: string) => {
    const newConditions = selectedConditions.filter(name => name !== conditionName);
    onConditionsChange(newConditions);
    
    // Update required supplies
    if (onSuppliesNeeded) {
      const allSupplies = new Set<string>();
      newConditions.forEach(name => {
        const condition = medicalConditions.find(c => c.name === name);
        if (condition) {
          condition.requiredSupplies.forEach(supply => allSupplies.add(supply));
        }
      });
      onSuppliesNeeded(Array.from(allSupplies));
    }
  };

  const getConditionByName = (name: string): MedicalCondition | undefined => {
    return medicalConditions.find(c => c.name === name);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Medical Conditions
        </label>
        
        {/* Selected Conditions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedConditions.map((conditionName) => {
            const condition = getConditionByName(conditionName);
            const categoryColor = condition ? getCategoryColor(condition.category) : 'bg-slate-100 text-slate-800 border-slate-200';
            const categoryIcon = condition ? getCategoryIcon(condition.category) : '🏥';
            
            return (
              <div
                key={conditionName}
                className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm border ${categoryColor}`}
              >
                <span>{categoryIcon}</span>
                <span>{conditionName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(conditionName)}
                  className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
          
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center space-x-2 px-3 py-1 border-2 border-dashed border-slate-300 rounded-full text-sm text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors"
          >
            <Plus className="h-3 w-3" />
            <span>Add Condition</span>
          </button>
        </div>
      </div>

      {/* Condition Selector Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Select Medical Conditions</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search conditions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              {filteredConditions.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600">No conditions found</p>
                  <p className="text-sm text-slate-500">Try adjusting your search or category filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredConditions.map((condition) => {
                    const categoryColor = getCategoryColor(condition.category);
                    const categoryIcon = getCategoryIcon(condition.category);
                    
                    return (
                      <button
                        key={condition.id}
                        onClick={() => handleAddCondition(condition)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${categoryColor} hover:scale-105`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{categoryIcon}</span>
                          <span className="font-medium">{condition.name}</span>
                        </div>
                        <div className="text-xs opacity-75 mb-2">
                          {condition.category.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-xs opacity-90">
                          <strong>Required supplies:</strong>
                          <div className="mt-1">
                            {condition.requiredSupplies.slice(0, 2).map((supply, index) => (
                              <div key={index}>• {supply}</div>
                            ))}
                            {condition.requiredSupplies.length > 2 && (
                              <div>• +{condition.requiredSupplies.length - 2} more...</div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}