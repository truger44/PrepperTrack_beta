import React, { useState } from 'react';
import { PrepperProvider } from './context/PrepperContext';
import { BatterySaverProvider } from './components/Common/BatterySaverProvider';
import { useBatterySaverContext } from './components/Common/BatterySaverProvider';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import InventoryList from './components/Inventory/InventoryList';
import RationPlanning from './components/RationPlanning/RationPlanning';
import HouseholdManagement from './components/Household/HouseholdManagement';
import Reports from './components/Reports/Reports';
import Settings from './components/Settings/Settings';
import BatterySaverIndicator from './components/Common/BatterySaverIndicator';
import './styles/battery-saver.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { getPerformanceClass, shouldSimplifyUI } = useBatterySaverContext();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryList />;
      case 'rationing':
        return <RationPlanning />;
      case 'household':
        return <HouseholdManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`flex min-h-screen bg-slate-50 dark:bg-slate-900 ${getPerformanceClass()}`}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1">
        {renderContent()}
      </main>
      
      {/* Battery Saver Indicator */}
      {!shouldSimplifyUI() && (
        <div className="fixed top-4 right-4 z-50">
          <BatterySaverIndicator />
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <PrepperProvider>
      <BatterySaverProvider>
        <AppContent />
      </BatterySaverProvider>
    </PrepperProvider>
  );
}

export default App;