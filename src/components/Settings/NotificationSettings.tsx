import React, { useState, useEffect } from 'react';
import { Bell, Mail, Smartphone, AlertTriangle, Calendar, Package, Users, Send, MessageSquare, BellRing } from 'lucide-react';
import { usePrepper } from '../../context/PrepperContext';

export default function NotificationSettings() {
  const { state, dispatch } = usePrepper();
  const { notificationSettings } = state;
  
  const [notifications, setNotifications] = useState(notificationSettings);
  const [emailProvider, setEmailProvider] = useState(notifications.emailProvider || 'none');
  const [emailConfig, setEmailConfig] = useState(notifications.emailConfig || {
    service: '',
    apiKey: '',
    fromEmail: '',
    fromName: 'PrepperTrack',
  });
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testEmailMessage, setTestEmailMessage] = useState('');
  const [browserNotificationSupported, setBrowserNotificationSupported] = useState(false);

  const handleNotificationChange = (key: string, value: any) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    dispatch({ 
      type: 'UPDATE_NOTIFICATION_SETTINGS', 
      payload: { [key]: value } 
    });
  };

  const handleExpirationDaysChange = (days: number, checked: boolean) => {
    const newExpirationDays = checked 
      ? [...notifications.expirationDays, days].sort((a, b) => a - b)
      : notifications.expirationDays.filter(d => d !== days);
    
    setNotifications(prev => ({ ...prev, expirationDays: newExpirationDays }));
    dispatch({ 
      type: 'UPDATE_NOTIFICATION_SETTINGS', 
      payload: { expirationDays: newExpirationDays } 
    });
  };

  const handleEmailProviderChange = (provider: string) => {
    setEmailProvider(provider);
    setNotifications(prev => ({ ...prev, emailProvider: provider }));
    dispatch({ 
      type: 'UPDATE_NOTIFICATION_SETTINGS', 
      payload: { emailProvider: provider } 
    });
  };

  const handleEmailConfigChange = (key: string, value: string) => {
    const newConfig = { ...emailConfig, [key]: value };
    setEmailConfig(newConfig);
    setNotifications(prev => ({ ...prev, emailConfig: newConfig }));
    dispatch({ 
      type: 'UPDATE_NOTIFICATION_SETTINGS', 
      payload: { emailConfig: newConfig } 
    });
  };

  const sendTestEmail = async () => {
    setTestEmailStatus('sending');
    setTestEmailMessage('');
    
    try {
      // In a real app, this would call an API endpoint to send the email
      // For this demo, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!emailConfig.apiKey || !emailConfig.fromEmail) {
        throw new Error('Missing required email configuration');
      }
      
      setTestEmailStatus('success');
      setTestEmailMessage('Test email sent successfully! Check your inbox.');
    } catch (error) {
      setTestEmailStatus('error');
      setTestEmailMessage(error instanceof Error ? error.message : 'Failed to send test email');
    }
  };

  const requestBrowserNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        handleNotificationChange('pushNotifications', true);
        // Show a test notification
        new Notification('PrepperTrack Notifications Enabled', {
          body: 'You will now receive notifications for important alerts',
          icon: '/favicon.ico'
        });
      } else {
        handleNotificationChange('pushNotifications', false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Check if browser notifications are supported
  useEffect(() => {
    setBrowserNotificationSupported('Notification' in window);
  }, []);

  // Update notification settings when component mounts
  useEffect(() => {
    setNotifications(notificationSettings);
    setEmailProvider(notificationSettings.emailProvider || 'none');
    setEmailConfig(notificationSettings.emailConfig || {
      service: '',
      apiKey: '',
      fromEmail: '',
      fromName: 'PrepperTrack',
    });
  }, [notificationSettings]);

  return (
    <div className="space-y-8">
      {/* General Notification Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-800">General Notifications</h3>
            <p className="text-sm text-slate-600">Configure how you receive alerts and notifications</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <h4 className="font-medium text-slate-800">Enable Notifications</h4>
              <p className="text-sm text-slate-600">Master switch for all notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.enableNotifications}
                onChange={(e) => handleNotificationChange('enableNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {notifications.enableNotifications && (
            <>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <div>
                    <h4 className="font-medium text-slate-800">Email Notifications</h4>
                    <p className="text-sm text-slate-600">Receive alerts via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-slate-500" />
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200">Browser Notifications</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {browserNotificationSupported 
                        ? 'Receive alerts in your browser' 
                        : 'Your browser does not support notifications'}
                    </p>
                  </div>
                </div>
                {browserNotificationSupported ? (
                  <button
                    onClick={requestBrowserNotificationPermission}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      notifications.pushNotifications
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white'
                    }`}
                  >
                    {notifications.pushNotifications ? 'Enabled' : 'Enable Notifications'}
                  </button>
                ) : (
                  <span className="text-sm text-red-600 dark:text-red-400">Not supported</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-slate-800">Sound Alerts</h4>
                  <p className="text-sm text-slate-600">Play sound for important notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.soundAlerts}
                    onChange={(e) => handleNotificationChange('soundAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email Notification Settings */}
      {notifications.enableNotifications && notifications.emailNotifications && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Send className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Email Provider</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Configure your email notification service</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { id: 'none', name: 'None', icon: Bell, description: 'No email notifications' },
                { id: 'sendgrid', name: 'SendGrid', icon: Send, description: 'Email API service' },
                { id: 'mailgun', name: 'Mailgun', icon: Mail, description: 'Email API service' },
                { id: 'twilio', name: 'Twilio', icon: MessageSquare, description: 'SMS notifications' },
                { id: 'pushbullet', name: 'Pushbullet', icon: BellRing, description: 'Cross-device notifications' },
                { id: 'smtp', name: 'Custom SMTP', icon: Mail, description: 'Your own email server' },
              ].map(provider => {
                const ProviderIcon = provider.icon;
                return (
                  <button
                    key={provider.id}
                    onClick={() => handleEmailProviderChange(provider.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      emailProvider === provider.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <ProviderIcon className={`h-5 w-5 ${
                        emailProvider === provider.id ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                      }`} />
                      <span className="font-medium">{provider.name}</span>
                    </div>
                    <p className={`text-sm ${
                      emailProvider === provider.id ? 'text-purple-600 dark:text-purple-400' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      {provider.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {emailProvider !== 'none' && (
              <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-4">
                  {emailProvider === 'sendgrid' && 'SendGrid Configuration'}
                  {emailProvider === 'mailgun' && 'Mailgun Configuration'}
                  {emailProvider === 'twilio' && 'Twilio Configuration'}
                  {emailProvider === 'pushbullet' && 'Pushbullet Configuration'}
                  {emailProvider === 'smtp' && 'SMTP Configuration'}
                </h4>
                
                <div className="space-y-4">
                  {emailProvider === 'sendgrid' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          SendGrid API Key
                        </label>
                        <input
                          type="password"
                          value={emailConfig.apiKey || ''}
                          onChange={(e) => handleEmailConfigChange('apiKey', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          From Email
                        </label>
                        <input
                          type="email"
                          value={emailConfig.fromEmail || ''}
                          onChange={(e) => handleEmailConfigChange('fromEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="notifications@yourdomain.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          From Name
                        </label>
                        <input
                          type="text"
                          value={emailConfig.fromName || 'PrepperTrack'}
                          onChange={(e) => handleEmailConfigChange('fromName', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="PrepperTrack Notifications"
                        />
                      </div>
                    </>
                  )}
                  
                  {emailProvider === 'mailgun' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Mailgun API Key
                        </label>
                        <input
                          type="password"
                          value={emailConfig.apiKey || ''}
                          onChange={(e) => handleEmailConfigChange('apiKey', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Mailgun Domain
                        </label>
                        <input
                          type="text"
                          value={emailConfig.domain || ''}
                          onChange={(e) => handleEmailConfigChange('domain', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="mg.yourdomain.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          From Email
                        </label>
                        <input
                          type="email"
                          value={emailConfig.fromEmail || ''}
                          onChange={(e) => handleEmailConfigChange('fromEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="notifications@yourdomain.com"
                        />
                      </div>
                    </>
                  )}
                  
                  {emailProvider === 'twilio' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Twilio Account SID
                        </label>
                        <input
                          type="text"
                          value={emailConfig.accountSid || ''}
                          onChange={(e) => handleEmailConfigChange('accountSid', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Twilio Auth Token
                        </label>
                        <input
                          type="password"
                          value={emailConfig.authToken || ''}
                          onChange={(e) => handleEmailConfigChange('authToken', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Twilio Phone Number
                        </label>
                        <input
                          type="text"
                          value={emailConfig.fromPhone || ''}
                          onChange={(e) => handleEmailConfigChange('fromPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Your Phone Number
                        </label>
                        <input
                          type="text"
                          value={emailConfig.toPhone || ''}
                          onChange={(e) => handleEmailConfigChange('toPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="+1234567890"
                        />
                      </div>
                    </>
                  )}
                  
                  {emailProvider === 'pushbullet' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Pushbullet Access Token
                        </label>
                        <input
                          type="password"
                          value={emailConfig.accessToken || ''}
                          onChange={(e) => handleEmailConfigChange('accessToken', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="o.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </div>
                    </>
                  )}
                  
                  {emailProvider === 'smtp' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          SMTP Host
                        </label>
                        <input
                          type="text"
                          value={emailConfig.host || ''}
                          onChange={(e) => handleEmailConfigChange('host', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="smtp.example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          SMTP Port
                        </label>
                        <input
                          type="text"
                          value={emailConfig.port || ''}
                          onChange={(e) => handleEmailConfigChange('port', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          SMTP Username
                        </label>
                        <input
                          type="text"
                          value={emailConfig.username || ''}
                          onChange={(e) => handleEmailConfigChange('username', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          SMTP Password
                        </label>
                        <input
                          type="password"
                          value={emailConfig.password || ''}
                          onChange={(e) => handleEmailConfigChange('password', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          From Email
                        </label>
                        <input
                          type="email"
                          value={emailConfig.fromEmail || ''}
                          onChange={(e) => handleEmailConfigChange('fromEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                          placeholder="notifications@yourdomain.com"
                        />
                      </div>
                    </>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      value={emailConfig.toEmail || ''}
                      onChange={(e) => handleEmailConfigChange('toEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={sendTestEmail}
                      disabled={testEmailStatus === 'sending' || !emailConfig.toEmail}
                      className={`px-4 py-2 rounded-lg text-white transition-colors ${
                        testEmailStatus === 'sending' || !emailConfig.toEmail
                          ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600'
                      }`}
                    >
                      {testEmailStatus === 'sending' ? 'Sending...' : 'Send Test Email'}
                    </button>
                    
                    {testEmailStatus === 'success' && (
                      <span className="text-sm text-green-600 dark:text-green-400">{testEmailMessage}</span>
                    )}
                    
                    {testEmailStatus === 'error' && (
                      <span className="text-sm text-red-600 dark:text-red-400">{testEmailMessage}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expiration Alerts */}
      {notifications.enableNotifications && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Expiration Alerts</h3>
              <p className="text-sm text-slate-600">Get notified when items are approaching expiration</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800">Enable Expiration Alerts</h4>
                <p className="text-sm text-slate-600">Notify when items are expiring soon</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.expirationAlerts}
                  onChange={(e) => handleNotificationChange('expirationAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {notifications.expirationAlerts && (
              <>
                <div className="ml-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <h5 className="font-medium text-slate-800 mb-3">Alert Timing</h5>
                <div className="space-y-2">
                  {[
                    { days: 7, label: '7 days before expiration' },
                    { days: 14, label: '14 days before expiration' },
                    { days: 30, label: '30 days before expiration' },
                    { days: 90, label: '90 days before expiration' },
                    { days: 180, label: '6 months before expiration' },
                  ].map((option) => (
                    <label key={option.days} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.expirationDays.includes(option.days)}
                        onChange={(e) => handleExpirationDaysChange(option.days, e.target.checked)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-700">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-800 dark:text-orange-200">Email Notifications</span>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailExpirationAlerts}
                      onChange={(e) => handleNotificationChange('emailExpirationAlerts', e.target.checked)}
                      className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-orange-700 dark:text-orange-300">Send email notifications for expiring items</span>
                  </label>
                  
                  {notifications.emailExpirationAlerts && (
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.weeklyExpirationDigest}
                          onChange={(e) => handleNotificationChange('weeklyExpirationDigest', e.target.checked)}
                          className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                        />
                        <span className="text-sm text-orange-700 dark:text-orange-300">Send weekly digest of upcoming expirations</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Inventory Alerts */}
      {notifications.enableNotifications && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Package className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Inventory Alerts</h3>
              <p className="text-sm text-slate-600">Notifications for inventory changes and low stock</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800">Low Stock Alerts</h4>
                <p className="text-sm text-slate-600">Notify when inventory levels are low</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.lowStockAlerts}
                  onChange={(e) => handleNotificationChange('lowStockAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {notifications.lowStockAlerts && (
              <div className="ml-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-slate-700 mb-2">Low Stock Threshold</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={notifications.lowStockThreshold}
                    onChange={(e) => handleNotificationChange('lowStockThreshold', parseInt(e.target.value))}
                    className="flex-1 h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-medium text-green-800 min-w-[40px]">
                    {notifications.lowStockThreshold}%
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  Alert when stock falls below this percentage of target levels
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Alerts */}
      {notifications.enableNotifications && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">System Alerts</h3>
              <p className="text-sm text-slate-600">Important system and security notifications</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800">Household Changes</h4>
                <p className="text-sm text-slate-600">Notify when household members are added or modified</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.householdChanges}
                  onChange={(e) => handleNotificationChange('householdChanges', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800">System Updates</h4>
                <p className="text-sm text-slate-600">Notify about application updates and new features</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.systemUpdates}
                  onChange={(e) => handleNotificationChange('systemUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800">Security Alerts</h4>
                <p className="text-sm text-slate-600">Critical security notifications and warnings</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.securityAlerts}
                  onChange={(e) => handleNotificationChange('securityAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Quiet Hours */}
      {notifications.enableNotifications && (
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-6 w-6 text-purple-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Quiet Hours</h3>
              <p className="text-sm text-slate-600">Suppress non-critical notifications during specified hours</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="font-medium text-slate-800">Enable Quiet Hours</h4>
                <p className="text-sm text-slate-600">Reduce notifications during sleep hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.enableQuietHours}
                  onChange={(e) => handleNotificationChange('enableQuietHours', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {notifications.enableQuietHours && (
              <div className="ml-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
                    <input
                      type="time"
                      value={notifications.quietStart}
                      onChange={(e) => handleNotificationChange('quietStart', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
                    <input
                      type="time"
                      value={notifications.quietEnd}
                      onChange={(e) => handleNotificationChange('quietEnd', e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  Critical security alerts will still be delivered during quiet hours
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notification Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h4 className="font-semibold text-slate-800 mb-4">Notification Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Notifications:</span>
              <span className={`text-sm font-medium ${notifications.enableNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.enableNotifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Email Alerts:</span>
              <span className={`text-sm font-medium ${notifications.emailNotifications && notifications.enableNotifications ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {notifications.emailNotifications && notifications.enableNotifications 
                  ? emailProvider !== 'none' 
                    ? `Enabled (${emailProvider})` 
                    : 'Provider not configured'
                  : 'Disabled'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Expiration Alerts:</span>
              <span className={`text-sm font-medium ${notifications.expirationAlerts && notifications.enableNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.expirationAlerts && notifications.enableNotifications ? `${notifications.expirationDays.length} timeframes` : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Low Stock Alerts:</span>
              <span className={`text-sm font-medium ${notifications.lowStockAlerts && notifications.enableNotifications ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {notifications.lowStockAlerts && notifications.enableNotifications 
                  ? `${notifications.lowStockThreshold}% threshold` 
                  : 'Disabled'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Quiet Hours:</span>
              <span className={`text-sm font-medium ${notifications.enableQuietHours && notifications.enableNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {notifications.enableQuietHours && notifications.enableNotifications ? `${notifications.quietStart} - ${notifications.quietEnd}` : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Sound Alerts:</span>
              <span className={`text-sm font-medium ${notifications.soundAlerts && notifications.enableNotifications ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {notifications.soundAlerts && notifications.enableNotifications 
                  ? 'Enabled' 
                  : 'Disabled'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Email Expiration Alerts:</span>
              <span className={`text-sm font-medium ${
                notifications.emailExpirationAlerts && notifications.emailNotifications && notifications.enableNotifications 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {notifications.emailExpirationAlerts && notifications.emailNotifications && notifications.enableNotifications 
                  ? 'Enabled' 
                  : 'Disabled'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}