import React, { useState } from 'react';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Clock, UserCheck } from 'lucide-react';

export default function SecuritySettings() {
  const [securitySettings, setSecuritySettings] = useState({
    requirePinCode: false,
    pinCode: '',
    autoLock: true,
    autoLockTime: 30,
    sessionTimeout: 60,
    bruteForceProtection: true,
    maxAttempts: 5,
    lockoutDuration: 60, // minutes
    failedAttempts: 0,
  });

  const [pinSettings, setPinSettings] = useState({
    currentPin: '',
    newPin: '',
    confirmPin: '',
    showPins: false,
  });

  const [authSettings, setAuthSettings] = useState({
    enableBasicAuth: false,
    username: '',
    password: '',
    confirmPassword: '',
    showPasswords: false,
  });

  const handleSecurityChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePinChange = (key: string, value: string) => {
    setPinSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAuthChange = (key: string, value: any) => {
    setAuthSettings(prev => ({ ...prev, [key]: value }));
  };

  const validatePin = (pin: string) => {
    return pin.length >= 4 && pin.length <= 8 && /^\d+$/.test(pin);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password);
  };

  const handleSetPin = () => {
    if (!validatePin(pinSettings.newPin)) {
      alert('PIN must be 4-8 digits');
      return;
    }
    
    if (pinSettings.newPin !== pinSettings.confirmPin) {
      alert('PINs do not match');
      return;
    }

    setSecuritySettings(prev => ({ 
      ...prev, 
      pinCode: pinSettings.newPin,
      requirePinCode: true 
    }));
    
    setPinSettings({
      currentPin: '',
      newPin: '',
      confirmPin: '',
      showPins: false,
    });
    
    alert('PIN code set successfully');
  };

  const handleSetAuth = () => {
    if (!authSettings.username || authSettings.username.length < 3) {
      alert('Username must be at least 3 characters');
      return;
    }
    
    if (!validatePassword(authSettings.password)) {
      alert('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }
    
    if (authSettings.password !== authSettings.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // In a real app, this would hash the password
    setAuthSettings(prev => ({ 
      ...prev, 
      enableBasicAuth: true 
    }));
    
    alert('Authentication credentials set successfully');
  };

  return (
    <div className="space-y-8">
      {/* Authentication Methods */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <UserCheck className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Authentication Methods</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Choose how users access the application</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Basic Authentication</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Username and password authentication</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={authSettings.enableBasicAuth}
                onChange={(e) => handleAuthChange('enableBasicAuth', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {authSettings.enableBasicAuth && (
            <div className="ml-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Set Authentication Credentials</h5>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={authSettings.username}
                    onChange={(e) => handleAuthChange('username', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter username (min 3 characters)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <input
                    type={authSettings.showPasswords ? 'text' : 'password'}
                    value={authSettings.password}
                    onChange={(e) => handleAuthChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm Password</label>
                  <input
                    type={authSettings.showPasswords ? 'text' : 'password'}
                    value={authSettings.confirmPassword}
                    onChange={(e) => handleAuthChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Confirm password"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={authSettings.showPasswords}
                    onChange={(e) => handleAuthChange('showPasswords', e.target.checked)}
                    className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Show passwords</span>
                </div>
                
                <button
                  onClick={handleSetAuth}
                  disabled={!authSettings.username || !authSettings.password || authSettings.password !== authSettings.confirmPassword}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Set Authentication
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PIN Code Access */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Key className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">PIN Code Access</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Quick access with numeric PIN code</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Require PIN Code</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Require PIN to access the application</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.requirePinCode}
                onChange={(e) => handleSecurityChange('requirePinCode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {securitySettings.requirePinCode && (
            <div className="ml-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-medium text-slate-800 dark:text-slate-200 mb-3">Set PIN Code</h5>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New PIN (4-8 digits)</label>
                  <input
                    type={pinSettings.showPins ? 'text' : 'password'}
                    value={pinSettings.newPin}
                    onChange={(e) => handlePinChange('newPin', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Enter new PIN"
                    maxLength={8}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm PIN</label>
                  <input
                    type={pinSettings.showPins ? 'text' : 'password'}
                    value={pinSettings.confirmPin}
                    onChange={(e) => handlePinChange('confirmPin', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    placeholder="Confirm PIN"
                    maxLength={8}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pinSettings.showPins}
                    onChange={(e) => handlePinChange('showPins', e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Show PIN</span>
                </div>
                
                <button
                  onClick={handleSetPin}
                  disabled={!validatePin(pinSettings.newPin) || pinSettings.newPin !== pinSettings.confirmPin}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Set PIN Code
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Brute Force Protection */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Brute Force Protection</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Protect against repeated login attempts</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Enable Protection</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Lock account after failed attempts</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.bruteForceProtection}
                onChange={(e) => handleSecurityChange('bruteForceProtection', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {securitySettings.bruteForceProtection && (
            <div className="ml-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Attempts</label>
                  <select
                    value={securitySettings.maxAttempts}
                    onChange={(e) => handleSecurityChange('maxAttempts', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value={3}>3 attempts</option>
                    <option value={5}>5 attempts</option>
                    <option value={10}>10 attempts</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Lockout Duration</label>
                  <select
                    value={securitySettings.lockoutDuration}
                    onChange={(e) => handleSecurityChange('lockoutDuration', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={1440}>24 hours</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Protection Active</span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  After {securitySettings.maxAttempts} failed attempts, access will be locked for {securitySettings.lockoutDuration} minutes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Management */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Session Management</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Control session timeouts and auto-lock</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800 dark:text-slate-200">Auto-Lock</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatically lock after period of inactivity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securitySettings.autoLock}
                onChange={(e) => handleSecurityChange('autoLock', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {securitySettings.autoLock && (
            <div className="ml-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Auto-Lock Time</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={securitySettings.autoLockTime}
                  onChange={(e) => handleSecurityChange('autoLockTime', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-purple-800 dark:text-purple-200 min-w-[60px]">
                  {securitySettings.autoLockTime} min
                </span>
              </div>
            </div>
          )}

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Session Timeout</label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="15"
                max="480"
                step="15"
                value={securitySettings.sessionTimeout}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200 min-w-[80px]">
                {securitySettings.sessionTimeout >= 60 
                  ? `${Math.floor(securitySettings.sessionTimeout / 60)}h ${securitySettings.sessionTimeout % 60}m`
                  : `${securitySettings.sessionTimeout}m`
                }
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Automatically log out after this period of inactivity
            </p>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Security Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Basic Authentication:</span>
              <span className={`text-sm font-medium ${authSettings.enableBasicAuth ? 'text-green-600' : 'text-red-600'}`}>
                {authSettings.enableBasicAuth ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">PIN Protection:</span>
              <span className={`text-sm font-medium ${securitySettings.requirePinCode ? 'text-green-600' : 'text-red-600'}`}>
                {securitySettings.requirePinCode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Brute Force Protection:</span>
              <span className={`text-sm font-medium ${securitySettings.bruteForceProtection ? 'text-green-600' : 'text-red-600'}`}>
                {securitySettings.bruteForceProtection ? `${securitySettings.maxAttempts} attempts` : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Auto-Lock:</span>
              <span className={`text-sm font-medium ${securitySettings.autoLock ? 'text-green-600' : 'text-red-600'}`}>
                {securitySettings.autoLock ? `${securitySettings.autoLockTime}min` : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Session Timeout:</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {securitySettings.sessionTimeout >= 60 
                  ? `${Math.floor(securitySettings.sessionTimeout / 60)}h ${securitySettings.sessionTimeout % 60}m`
                  : `${securitySettings.sessionTimeout}m`
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Failed Attempts:</span>
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {securitySettings.failedAttempts}
              </span>
            </div>
          </div>
        </div>
        
        {(!authSettings.enableBasicAuth && !securitySettings.requirePinCode) && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Security Recommendation</span>
            </div>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              For maximum security, enable either basic authentication or PIN code protection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}