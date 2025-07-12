import { useState, useEffect, useCallback, useRef } from 'react';
import { InventoryItem, NotificationSettings } from '../types';

interface NotificationHookOptions {
  inventory: InventoryItem[];
  settings: NotificationSettings;
}

interface Notification {
  id: string;
  type: 'expiration' | 'lowStock' | 'system' | 'security';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  emailSent?: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  itemId?: string;
}

export function useNotifications({ inventory, settings }: NotificationHookOptions) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const emailSentRef = useRef<Set<string>>(new Set());

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  }, []);

  // Check for expiring items and send notifications
  const checkExpirations = useCallback(() => {
    if (!settings.enableNotifications || !settings.expirationAlerts) {
      return;
    }

    const today = new Date();
    const newNotifications: Notification[] = [];

    // Check each inventory item for expiration
    inventory.forEach(item => {
      if (!item.expirationDate) return;

      const expDate = new Date(item.expirationDate);
      const daysUntilExpiry = Math.ceil((expDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

      settings.expirationDays.forEach(alertDays => {
        // Create notification for items expiring in exactly alertDays
        if (daysUntilExpiry === alertDays) {
          const notification: Notification = {
            id: `exp-${item.id}-${alertDays}`,
            type: 'expiration',
            title: 'Item Expiring Soon',
            message: `${item.name} expires in ${alertDays} days`,
            timestamp: new Date(),
            read: false,
            priority: alertDays <= 7 ? 'high' : alertDays <= 30 ? 'medium' : 'low',
            emailSent: false,
            itemId: item.id,
          };
          newNotifications.push(notification);
          
          // Send email for 7-day expiration alerts if enabled
          if (alertDays === 7 && settings.emailExpirationAlerts && settings.emailNotifications) {
            sendExpirationEmail(item, daysUntilExpiry);
          }
        }
      });

      // Check for expired items
      if (daysUntilExpiry < 0) {
        const notification: Notification = {
          id: `expired-${item.id}`,
          type: 'expiration',
          title: 'Item Expired',
          message: `${item.name} expired ${Math.abs(daysUntilExpiry)} days ago`,
          timestamp: new Date(),
          read: false,
          priority: 'critical',
          emailSent: false,
          itemId: item.id,
        };
        newNotifications.push(notification);
      }
    });

    if (newNotifications.length > 0) {
      // Add new notifications to the state
      setNotifications(prev => [...prev, ...newNotifications]);
      
      // Show browser notifications if enabled
      if (settings.pushNotifications && permission === 'granted') {
        newNotifications.forEach(notification => {
          if (notification.priority === 'high' || notification.priority === 'critical') {
            showBrowserNotification(notification);
          }
        });
      }
    }
  }, [inventory, settings, permission]);

  // Send email notification for expiring items
  const sendExpirationEmail = useCallback((item: InventoryItem, daysUntilExpiry: number) => {
    if (!settings.emailConfig?.toEmail || !settings.emailProvider || settings.emailProvider === 'none') {
      return;
    }
    
    // Check if we've already sent an email for this item's expiration
    const emailKey = `exp-${item.id}-${daysUntilExpiry}`;
    if (emailSentRef.current.has(emailKey)) {
      return;
    }
    
    // In a real app, this would call an API endpoint to send the email
    // For this demo, we'll just log it
    console.log(`[EMAIL] Sending expiration alert for ${item.name} (expires in ${daysUntilExpiry} days)`);
    console.log(`[EMAIL] To: ${settings.emailConfig.toEmail}`);
    console.log(`[EMAIL] From: ${settings.emailConfig.fromName} <${settings.emailConfig.fromEmail}>`);
    console.log(`[EMAIL] Subject: PrepperTrack Alert: ${item.name} expires in ${daysUntilExpiry} days`);
    console.log(`[EMAIL] Body: Your item "${item.name}" will expire in ${daysUntilExpiry} days (on ${item.expirationDate}). Please check your inventory and use or replace this item soon.`);
    
    // Mark as sent
    emailSentRef.current.add(emailKey);
    
    // Update notification to mark email as sent
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === `exp-${item.id}-${daysUntilExpiry}`
          ? { ...notification, emailSent: true }
          : notification
      )
    );
    
    // In a real implementation, you would use the appropriate email service based on settings.emailProvider
    // For example, SendGrid, Mailgun, etc.
    
  }, [settings.emailConfig, settings.emailProvider]);

  // Show browser notification
  const showBrowserNotification = useCallback((notification: Notification) => {
    if ('Notification' in window && permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        image: notification.type === 'expiration' ? '/expiration-image.png' : undefined,
        tag: notification.id,
        requireInteraction: notification.priority === 'critical',
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
        markAsRead(notification.id);
      };

      // Auto-close after 5 seconds for non-critical notifications
      if (notification.priority !== 'critical') {
        setTimeout(() => {
          browserNotification.close();
        }, 5000);
      }
    }
  }, [permission, settings.pushNotifications]);

  // Check if in quiet hours
  const isQuietHours = useCallback(() => {
    if (!settings.enableQuietHours) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.quietStart.split(':').map(Number);
    const [endHour, endMin] = settings.quietEnd.split(':').map(Number);
    
    const quietStart = startHour * 60 + startMin;
    const quietEnd = endHour * 60 + endMin;

    if (quietStart < quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd;
    } else {
      // Quiet hours span midnight
      return currentTime >= quietStart || currentTime <= quietEnd;
    }
  }, [settings.enableQuietHours, settings.quietStart, settings.quietEnd]);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (settings.soundAlerts && !isQuietHours()) {
      // Create a simple beep sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.warn('Could not play notification sound:', error);
      }
    }
  }, [settings.soundAlerts, isQuietHours]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return notifications.filter(notification => !notification.read).length;
  }, [notifications]);

  // Get notifications by type
  const getNotificationsByType = useCallback((type: Notification['type']) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  // Initialize notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Check for expiring items periodically
  useEffect(() => {
    checkExpirations();
    
    // Check every hour
    const interval = setInterval(checkExpirations, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkExpirations]);

  // Play sound for new notifications
  useEffect(() => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[unreadNotifications.length - 1];
      if (latestNotification.priority === 'high' || latestNotification.priority === 'critical') {
        playNotificationSound();
      }
    }
  }, [notifications, playNotificationSound]);

  return {
    notifications,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    getUnreadCount,
    getNotificationsByType,
    isQuietHours: isQuietHours(),
    sendExpirationEmail,
  };
}