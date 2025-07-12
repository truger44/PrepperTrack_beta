import React, { useState } from 'react';
import { Package, Calendar, MapPin, Plus, Search, Filter, Heart, AlertTriangle } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';
import { InventoryItem, ItemCategory } from '../../types';
import ItemRow from './ItemRow';
import MedicalItemRow from './MedicalItemRow';
import AddItemModal from './AddItemModal';

export default function InventoryList() {
  const { state } = usePrepper();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'expiration' | 'quantity' | 'category'>('name');
  const [activeTab, setActiveTab] = useState<'general' | 'medical'>('general');

  const categories: (ItemCategory | 'all')[] = [
    'all',
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

  const generalItems = state.inventory.filter(item => item.category !== 'Medical');
  const medicalItems = state.inventory.filter(item => item.category === 'Medical');
  
  const filteredItems = (activeTab === 'medical' ? medicalItems : generalItems)
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory || activeTab === 'medical';
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'expiration':
          if (!a.expirationDate) return 1;
          if (!b.expirationDate) return -1;
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime();
        case 'quantity':
          return b.quantity - a.quantity;
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const requiredMedicalItems = medicalItems.filter(item => item.isMedicalRequired);
  const missingMedicalItems = requiredMedicalItems.filter(item => item.quantity === 0);
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Inventory Management</h1>
            <p className="text-slate-600">Track and manage your survival supplies and medical inventory</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Add Item</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md mb-6">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'general'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>General Supplies ({generalItems.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('medical')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'medical'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4" />
                <span>Medical Supplies ({medicalItems.length})</span>
                {missingMedicalItems.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {missingMedicalItems.length}
                  </span>
                )}
              </div>
            </button>
          </div>
          
          <div className="p-6">
            {/* Medical Alerts */}
            {activeTab === 'medical' && missingMedicalItems.length > 0 && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="font-medium text-red-800 dark:text-red-200">Missing Required Medical Supplies</span>
                </div>
                <p className="text-sm text-red-700 dark:text-red-300">
                  You have {missingMedicalItems.length} required medical items with zero quantity. 
                  These items are needed for household members' medical conditions.
                </p>
              </div>
            )}
            
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as ItemCategory | 'all');
                if (e.target.value === 'Medical') {
                  setActiveTab('medical');
                }
              }}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              {(activeTab === 'medical' ? ['all', 'Medical'] : categories.filter(c => c !== 'Medical')).map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="name">Sort by Name</option>
              <option value="expiration">Sort by Expiration</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="category">Sort by Category</option>
            </select>
            
            <div className="flex items-center text-sm text-slate-600">
              <Package className="h-4 w-4 mr-2" />
              {filteredItems.length} {activeTab === 'medical' ? 'medical' : ''} items
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="text-left px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Item</th>
                <th className="text-left px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                  {activeTab === 'medical' ? 'Required By' : 'Category'}
                </th>
                <th className="text-left px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Quantity</th>
                <th className="text-left px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Expiration</th>
                <th className="text-left px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Location</th>
                <th className="text-left px-6 py-4 font-medium text-slate-700 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                activeTab === 'medical' ? (
                  <MedicalItemRow key={item.id} item={item} />
                ) : (
                  <ItemRow key={item.id} item={item} />
                )
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            {activeTab === 'medical' ? (
              <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            ) : (
              <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            )}
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              No {activeTab === 'medical' ? 'medical supplies' : 'items'} found
            </p>
            <p className="text-sm text-slate-500">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : `Add your first ${activeTab === 'medical' ? 'medical supply' : 'inventory item'} to get started`
              }
            </p>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSave={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}