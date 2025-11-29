// Service Worker pour les notifications Push
self.addEventListener('install', (event) => {
  console.log('Service Worker installé');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activé');
  event.waitUntil(clients.claim());
});

// Écouter les notifications push
self.addEventListener('push', (event) => {
  console.log('Notification Push reçue');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const title = data.title || 'Grandson Project';
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: data.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: data.image,
    data: data.url ? { url: data.url } : {},
    actions: [
      {
        action: 'open',
        title: 'Voir',
        icon: '/check.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/close.png'
      }
    ],
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: false,
    silent: false
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification cliquée:', event.action);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Ouvrir l'URL si elle existe
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
