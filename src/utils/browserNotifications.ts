/**
 * Browser Notification Utilities for PrepperTrack
 * Handles browser notification permissions and display
 */

/**
 * Check if browser notifications are supported
 */
export function isBrowserNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isBrowserNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request permission for browser notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isBrowserNotificationSupported()) {
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Show a browser notification
 */
export function showNotification(
  title: string,
  options?: NotificationOptions
): Notification | null {
  if (!isBrowserNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }
  
  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      requireInteraction: false,
      ...options,
    });
    
    // Auto-close after 5 seconds unless requireInteraction is true
    if (!options?.requireInteraction) {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
}

/**
 * Show an expiration notification
 */
export function showExpirationNotification(
  itemName: string,
  daysRemaining: number,
  expirationDate: string
): Notification | null {
  const title = daysRemaining <= 0
    ? `${itemName} has expired!`
    : `${itemName} expires in ${daysRemaining} days`;
    
  const options: NotificationOptions = {
    body: daysRemaining <= 0
      ? `This item expired on ${new Date(expirationDate).toLocaleDateString()}`
      : `This item will expire on ${new Date(expirationDate).toLocaleDateString()}`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `expiration-${itemName}`,
    requireInteraction: daysRemaining <= 0, // Require interaction for expired items
  };
  
  return showNotification(title, options);
}

/**
 * Show a low stock notification
 */
export function showLowStockNotification(
  itemName: string,
  quantity: number,
  threshold: number
): Notification | null {
  const title = `Low Stock Alert: ${itemName}`;
  
  const options: NotificationOptions = {
    body: `You only have ${quantity} units left. This is below your ${threshold}% threshold.`,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `lowstock-${itemName}`,
  };
  
  return showNotification(title, options);
}

/**
 * Show a system notification
 */
export function showSystemNotification(
  title: string,
  message: string,
  critical: boolean = false
): Notification | null {
  const options: NotificationOptions = {
    body: message,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `system-${Date.now()}`,
    requireInteraction: critical,
  };
  
  return showNotification(title, options);
}

/**
 * Initialize browser notifications
 * This checks permission and sets up event handlers
 */
export function initializeBrowserNotifications(): void {
  if (!isBrowserNotificationSupported()) {
    console.log('Browser notifications are not supported');
    return;
  }
  
  // Check if we already have permission
  const permission = getNotificationPermission();
  console.log(`Browser notification permission: ${permission}`);
  
  // Set up click handler for notifications
  if (permission === 'granted') {
    navigator.serviceWorker?.ready.then(registration => {
      registration.active?.addEventListener('notificationclick', event => {
        event.notification.close();
        
        // Focus on the window when notification is clicked
        if (clients && typeof clients.matchAll === 'function') {
          event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
              for (const client of clientList) {
                if ('focus' in client) {
                  return client.focus();
                }
              }
              if (clients.openWindow) {
                return clients.openWindow('/');
              }
            })
          );
        } else {
          // Fallback for browsers that don't support clients API
          window.focus();
        }
      });
    });
  }
}