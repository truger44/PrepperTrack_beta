import { useEffect, useRef, useCallback } from 'react';
import { useBatterySaverContext } from '../components/Common/BatterySaverProvider';

/**
 * Hook for battery-aware polling optimization
 * Automatically adjusts polling intervals based on battery saver settings
 */

interface UseOptimizedPollingOptions {
  baseInterval: number;
  callback: () => void;
  enabled?: boolean;
  immediate?: boolean;
}

export function useOptimizedPolling({
  baseInterval,
  callback,
  enabled = true,
  immediate = false,
}: UseOptimizedPollingOptions) {
  const { getPollingInterval, isActive: batterySaverActive } = useBatterySaverContext();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const optimizedInterval = getPollingInterval(baseInterval);
    
    intervalRef.current = setInterval(() => {
      callbackRef.current();
    }, optimizedInterval);

    // Call immediately if requested
    if (immediate) {
      callbackRef.current();
    }
  }, [baseInterval, getPollingInterval, immediate]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  // Restart polling when battery saver settings change
  useEffect(() => {
    if (enabled) {
      startPolling();
    }
  }, [batterySaverActive, startPolling, enabled]);

  return {
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null,
  };
}