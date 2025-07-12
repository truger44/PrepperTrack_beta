import React from 'react';
import { Shield, Package, Calculator, Users, FileText, Settings } from 'lucide-react';
import NotificationCenter from '../Common/NotificationCenter';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Shield },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'rationing', label: 'Ration Planning', icon: Calculator },
  { id: 'household', label: 'Household', icon: Users },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-slate-800 dark:bg-slate-900 text-white min-h-screen">
      <div className="p-6 border-b border-slate-700 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-green-400 dark:text-green-300" />
            <div>
              <h1 className="text-xl font-bold text-white">PrepperTrack</h1>
              <p className="text-slate-300 dark:text-slate-400 text-sm">Survival Readiness</p>
            </div>
          </div>
          <NotificationCenter />
        </div>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-green-600 text-white'
                      : 'text-slate-300 hover:bg-slate-700 dark:hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-white">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}