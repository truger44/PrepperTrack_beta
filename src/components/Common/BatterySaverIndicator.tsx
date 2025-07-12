import React from 'react';
import { Battery, BatteryLow, Zap, Settings } from 'lucide-react';
import { useBatterySaverContext } from './BatterySaverProvider';

interface BatterySaverIndicatorProps {
  showDetails?: boolean;
  onSettingsClick?: () => void;
}

export default function BatterySaverIndicator({ 
  showDetails = false, 
  onSettingsClick 
}: BatterySaverIndicatorProps) {
  const { 
    isActive, 
    batteryInfo, 
    performanceLevel, 
    toggleBatterySaver,
    isBatteryAPISupported 
  } = useBatterySaverContext();

  if (!isBatteryAPISupported && !isActive) {
    return null;
  }

  const getBatteryIcon = () => {
    if (!batteryInfo) return Battery;
    
    if (batteryInfo.level <= 20) return BatteryLow;
    return Battery;
  };

  const getBatteryColor = () => {
    if (!batteryInfo) return 'text-slate-500';
    
    if (batteryInfo.charging) return 'text-green-500';
    if (batteryInfo.level <= 10) return 'text-red-500';
    if (batteryInfo.level <= 30) return 'text-yellow-500';
    return 'text-slate-500';
  };

  const getPerformanceColor = () => {
    switch (performanceLevel) {
      case 'low': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <div className={`flex items-center space-x-2 ${showDetails ? 'p-3 bg-slate-50 rounded-lg' : ''}`}>
      {/* Battery Status */}
      <div className="flex items-center space-x-1">
        <BatteryIcon className={`h-4 w-4 ${getBatteryColor()}`} />
        {batteryInfo && (
          <span className={`text-sm font-medium ${getBatteryColor()}`}>
            {Math.round(batteryInfo.level)}%
          </span>
        )}
        {batteryInfo?.charging && (
          <Zap className="h-3 w-3 text-green-500" />
        )}
      </div>

      {/* Battery Saver Status */}
      {isActive && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-orange-600 font-medium">
            Battery Saver
          </span>
        </div>
      )}

      {/* Performance Level */}
      {showDetails && (
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-500">Performance:</span>
          <span className={`text-xs font-medium ${getPerformanceColor()}`}>
            {performanceLevel.toUpperCase()}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => toggleBatterySaver()}
          className={`p-1 rounded transition-colors ${
            isActive 
              ? 'text-orange-600 hover:bg-orange-100' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
          title={isActive ? 'Disable Battery Saver' : 'Enable Battery Saver'}
        >
          <Battery className="h-4 w-4" />
        </button>
        
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="p-1 text-slate-500 hover:bg-slate-100 rounded transition-colors"
            title="Battery Saver Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Detailed Info */}
      {showDetails && batteryInfo && (
        <div className="text-xs text-slate-500 space-y-1">
          {batteryInfo.charging ? (
            <div>Charging • {batteryInfo.chargingTime !== Infinity ? 
              `${Math.round(batteryInfo.chargingTime / 3600)}h remaining` : 
              'Time unknown'
            }</div>
          ) : (
            <div>On battery • {batteryInfo.dischargingTime !== Infinity ? 
              `${Math.round(batteryInfo.dischargingTime / 3600)}h remaining` : 
              'Time unknown'
            }</div>
          )}
        </div>
      )}
    </div>
  );
}