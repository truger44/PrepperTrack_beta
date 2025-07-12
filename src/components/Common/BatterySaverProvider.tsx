import React, { createContext, useContext, ReactNode } from 'react';
import { useBatterySaver } from '../../hooks/useBatterySaver';

interface BatterySaverContextType {
  isActive: boolean;
  batteryInfo: any;
  settings: any;
  performanceLevel: 'high' | 'medium' | 'low';
  optimizations: any;
  toggleBatterySaver: (enabled?: boolean) => void;
  updateSettings: (settings: any) => void;
  getPollingInterval: (baseInterval: number) => number;
  shouldDisableAnimations: () => boolean;
  shouldSimplifyUI: () => boolean;
  getPerformanceClass: () => string;
  isBatteryAPISupported: boolean;
}

const BatterySaverContext = createContext<BatterySaverContextType | null>(null);

interface BatterySaverProviderProps {
  children: ReactNode;
}

export function BatterySaverProvider({ children }: BatterySaverProviderProps) {
  const batterySaver = useBatterySaver();

  return (
    <BatterySaverContext.Provider value={batterySaver}>
      {children}
    </BatterySaverContext.Provider>
  );
}

export function useBatterySaverContext() {
  const context = useContext(BatterySaverContext);
  if (!context) {
    throw new Error('useBatterySaverContext must be used within a BatterySaverProvider');
  }
  return context;
}