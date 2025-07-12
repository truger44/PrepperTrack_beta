import { useState, useEffect, useCallback } from 'react';

/**
 * Battery Saver Hook for Mobile Devices
 * Monitors battery status and applies performance optimizations
 */

interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface BatterySaverSettings {
  enabled: boolean;
  autoEnable: boolean;
  autoEnableThreshold: number;
  reducedAnimations: boolean;
  reducedPolling: boolean;
  reducedRendering: boolean;
  simplifiedUI: boolean;
  darkMode: boolean;
}

interface BatterySaverState {
  isActive: boolean;
  batteryInfo: BatteryInfo | null;
  settings: BatterySaverSettings;
  performanceLevel: 'high' | 'medium' | 'low';
}

const defaultSettings: BatterySaverSettings = {
  enabled: false,
  autoEnable: true,
  autoEnableThreshold: 20,
  reducedAnimations: true,
  reducedPolling: true,
  reducedRendering: true,
  simplifiedUI: true,
  darkMode: true,
};

export function useBatterySaver() {
  const [state, setState] = useState<BatterySaverState>({
    isActive: false,
    batteryInfo: null,
    settings: defaultSettings,
    performanceLevel: 'high',
  });

  // Check if device supports Battery API
  const isBatteryAPISupported = useCallback(() => {
    return 'getBattery' in navigator || 'battery' in navigator;
  }, []);

  // Get battery information
  const getBatteryInfo = useCallback(async (): Promise<BatteryInfo | null> => {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return {
          level: battery.level * 100,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        };
      } else if ('battery' in navigator) {
        const battery = (navigator as any).battery;
        return {
          level: battery.level * 100,
          charging: battery.charging,
          chargingTime: battery.chargingTime,
          dischargingTime: battery.dischargingTime,
        };
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
    return null;
  }, []);

  // Determine performance level based on battery and device capabilities
  const calculatePerformanceLevel = useCallback((batteryInfo: BatteryInfo | null): 'high' | 'medium' | 'low' => {
    if (!batteryInfo) {
      // Fallback to device capabilities
      const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                            (navigator as any).deviceMemory <= 2;
      return isLowEndDevice ? 'medium' : 'high';
    }

    if (batteryInfo.charging) {
      return 'high';
    }

    if (batteryInfo.level <= 10) {
      return 'low';
    } else if (batteryInfo.level <= 30) {
      return 'medium';
    } else {
      return 'high';
    }
  }, []);

  // Update battery information
  const updateBatteryInfo = useCallback(async () => {
    const batteryInfo = await getBatteryInfo();
    const performanceLevel = calculatePerformanceLevel(batteryInfo);
    
    setState(prev => {
      const shouldAutoEnable = prev.settings.autoEnable && 
                              batteryInfo && 
                              batteryInfo.level <= prev.settings.autoEnableThreshold &&
                              !batteryInfo.charging;

      return {
        ...prev,
        batteryInfo,
        performanceLevel,
        isActive: prev.settings.enabled || shouldAutoEnable,
      };
    });
  }, [getBatteryInfo, calculatePerformanceLevel]);

  // Initialize battery monitoring
  useEffect(() => {
    updateBatteryInfo();

    // Set up battery event listeners
    if (isBatteryAPISupported()) {
      const setupBatteryListeners = async () => {
        try {
          const battery = await (navigator as any).getBattery();
          
          const handleBatteryChange = () => updateBatteryInfo();
          
          battery.addEventListener('chargingchange', handleBatteryChange);
          battery.addEventListener('levelchange', handleBatteryChange);
          battery.addEventListener('chargingtimechange', handleBatteryChange);
          battery.addEventListener('dischargingtimechange', handleBatteryChange);

          return () => {
            battery.removeEventListener('chargingchange', handleBatteryChange);
            battery.removeEventListener('levelchange', handleBatteryChange);
            battery.removeEventListener('chargingtimechange', handleBatteryChange);
            battery.removeEventListener('dischargingtimechange', handleBatteryChange);
          };
        } catch (error) {
          console.warn('Failed to set up battery listeners:', error);
        }
      };

      setupBatteryListeners();
    }

    // Fallback: Update battery info periodically
    const interval = setInterval(updateBatteryInfo, 60000); // Every minute

    return () => {
      clearInterval(interval);
    };
  }, [updateBatteryInfo, isBatteryAPISupported]);

  // Toggle battery saver
  const toggleBatterySaver = useCallback((enabled?: boolean) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        enabled: enabled !== undefined ? enabled : !prev.settings.enabled,
      },
      isActive: enabled !== undefined ? enabled : !prev.settings.enabled,
    }));
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<BatterySaverSettings>) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  }, []);

  // Get optimization recommendations
  const getOptimizations = useCallback(() => {
    if (!state.isActive) {
      return {
        animations: false,
        polling: false,
        rendering: false,
        ui: false,
        darkMode: false,
      };
    }

    return {
      animations: state.settings.reducedAnimations,
      polling: state.settings.reducedPolling,
      rendering: state.settings.reducedRendering,
      ui: state.settings.simplifiedUI,
      darkMode: state.settings.darkMode,
    };
  }, [state.isActive, state.settings]);

  // Get polling interval based on performance level
  const getPollingInterval = useCallback((baseInterval: number): number => {
    if (!state.isActive || !state.settings.reducedPolling) {
      return baseInterval;
    }

    switch (state.performanceLevel) {
      case 'low':
        return baseInterval * 4; // 4x slower
      case 'medium':
        return baseInterval * 2; // 2x slower
      default:
        return baseInterval;
    }
  }, [state.isActive, state.settings.reducedPolling, state.performanceLevel]);

  // Check if animations should be disabled
  const shouldDisableAnimations = useCallback((): boolean => {
    return state.isActive && state.settings.reducedAnimations;
  }, [state.isActive, state.settings.reducedAnimations]);

  // Check if UI should be simplified
  const shouldSimplifyUI = useCallback((): boolean => {
    return state.isActive && state.settings.simplifiedUI;
  }, [state.isActive, state.settings.simplifiedUI]);

  // Get CSS class for performance optimizations
  const getPerformanceClass = useCallback((): string => {
    const classes = [];
    
    if (shouldDisableAnimations()) {
      classes.push('battery-saver-no-animations');
    }
    
    if (shouldSimplifyUI()) {
      classes.push('battery-saver-simplified');
    }
    
    if (state.isActive && state.settings.darkMode) {
      classes.push('battery-saver-dark');
    }
    
    classes.push(`performance-${state.performanceLevel}`);
    
    return classes.join(' ');
  }, [shouldDisableAnimations, shouldSimplifyUI, state.isActive, state.settings.darkMode, state.performanceLevel]);

  return {
    isActive: state.isActive,
    batteryInfo: state.batteryInfo,
    settings: state.settings,
    performanceLevel: state.performanceLevel,
    optimizations: getOptimizations(),
    toggleBatterySaver,
    updateSettings,
    getPollingInterval,
    shouldDisableAnimations,
    shouldSimplifyUI,
    getPerformanceClass,
    isBatteryAPISupported: isBatteryAPISupported(),
  };
}