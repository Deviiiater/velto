export function showLocalNotification(title: string, body: string, icon = "/logo.png") {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon,
          badge: icon,
          vibrate: [200, 100, 200]
        } as any);
      }).catch(err => {
        console.warn('Service worker not ready for notifications, falling back:', err);
        new Notification(title, { body, icon });
      });
    } else {
      new Notification(title, { body, icon });
    }
  }
}
