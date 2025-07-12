import React, { useState } from 'react';
import { X, Save, Plus, Minus } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { HouseholdMember, ActivityLevel } from '../../types';
import { calculateCaloriesByAge, calculateWaterByClimate } from '../../utils/calculations';
import MedicalConditionTags from './MedicalConditionTags';
import RequiredSuppliesDisplay from './RequiredSuppliesDisplay';

interface AddMemberModalProps {
  onClose: () => void;
  onSave: () => void;
}

export default function AddMemberModal({ onClose, onSave }: AddMemberModalProps) {
  const { state, dispatch } = usePrepper();
  const { householdGroups, settings } = state;
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    activityLevel: 'moderate' as ActivityLevel,
    groupId: '',
    emergencyContact: '',
    medicalConditions: [''],
    dietaryRestrictions: [''],
    skills: [''],
    responsibilities: [''],
  });

  const [requiredSupplies, setRequiredSupplies] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].map((item: string, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev], '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field as keyof typeof prev].filter((_: string, i: number) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const age = parseInt(formData.age);
    const dailyCalories = calculateCaloriesByAge(age, formData.activityLevel);
    const dailyWaterLiters = calculateWaterByClimate(
      age < 13 ? 2.0 : age < 65 ? 3.0 : 2.5, 
      settings.climateZone
    );

    const newMember: HouseholdMember = {
      id: Date.now().toString(),
      name: formData.name,
      age,
      activityLevel: formData.activityLevel,
      dailyCalories,
      dailyWaterLiters,
      groupId: formData.groupId || undefined,
      emergencyContact: formData.emergencyContact || undefined,
      medicalConditions: formData.medicalConditions.filter(condition => condition.trim() !== ''),
      dietaryRestrictions: formData.dietaryRestrictions.filter(restriction => restriction.trim() !== ''),
      skills: formData.skills.filter(skill => skill.trim() !== ''),
      responsibilities: formData.responsibilities.filter(resp => resp.trim() !== ''),
      specialNeeds: [],
    };

    // Add required medical supplies to inventory with the correct member ID
    if (formData.medicalConditions.length > 0) {
      const allRequiredSupplies = new Set<string>();
      
      formData.medicalConditions.forEach(conditionName => {
        const condition = medicalConditions.find(c => c.name === conditionName);
        if (condition) {
          condition.requiredSupplies.forEach(supply => allRequiredSupplies.add(supply));
        }
      });
      
      if (allRequiredSupplies.size > 0) {
        dispatch({
          type: 'ADD_REQUIRED_MEDICAL_ITEMS',
          payload: {
            memberId: newMember.id,
            requiredSupplies: Array.from(allRequiredSupplies)
          }
        });
      }
    }

    dispatch({ type: 'ADD_HOUSEHOLD_MEMBER', payload: newMember });
    onSave();
  };

  const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
    { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
    { value: 'light', label: 'Light', description: 'Light exercise 1-3 days/week' },
    { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days/week' },
    { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days/week' },
    { value: 'very_active', label: 'Very Active', description: 'Very hard exercise, physical job' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Add Household Member</h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-slate-800 mb-4">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                min="0"
                max="120"
                required
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 35"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Activity Level *
              </label>
              <select
                required
                value={formData.activityLevel}
                onChange={(e) => handleInputChange('activityLevel', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {activityLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label} - {level.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Group Assignment
              </label>
              <select
                value={formData.groupId}
                onChange={(e) => handleInputChange('groupId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">No Group</option>
                {householdGroups.map(group => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., Jane Smith - 555-0123"
              />
            </div>

            {/* Medical Conditions */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-slate-800 mb-4 mt-6">Medical Information</h3>
            </div>

            <div className="md:col-span-2">
              <MedicalConditionTags
                selectedConditions={formData.medicalConditions.filter(c => c.trim() !== '')}
                onConditionsChange={(conditions) => {
                  setFormData(prev => ({ ...prev, medicalConditions: conditions }));
                }}
                onSuppliesNeeded={setRequiredSupplies}
              />
            </div>

            {/* Required Supplies Display */}
            {requiredSupplies.length > 0 && (
              <div className="md:col-span-2">
                <RequiredSuppliesDisplay
                  requiredSupplies={requiredSupplies}
                  memberName={formData.name || 'this member'}
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Dietary Restrictions
              </label>
              {formData.dietaryRestrictions.map((restriction, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={restriction}
                    onChange={(e) => handleArrayChange('dietaryRestrictions', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Gluten-free"
                  />
                  {formData.dietaryRestrictions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('dietaryRestrictions', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('dietaryRestrictions')}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Dietary Restriction</span>
              </button>
            </div>

            {/* Skills and Responsibilities */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-slate-800 mb-4 mt-6">Skills & Responsibilities</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skills
              </label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleArrayChange('skills', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., First Aid, Mechanical Repair"
                  />
                  {formData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('skills', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('skills')}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </button>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Responsibilities
              </label>
              {formData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={responsibility}
                    onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Security, Medical Care"
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('responsibilities', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('responsibilities')}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Responsibility</span>
              </button>
            </div>
          </div>

          <div className="flex space-x-4 mt-8">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>Add Member</span>
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