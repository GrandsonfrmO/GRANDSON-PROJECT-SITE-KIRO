// Utilitaires pour les notifications Push

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

// Convertir la clé VAPID en Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Vérifier si les notifications sont supportées
export function isPushNotificationSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Demander la permission pour les notifications
export async function askUserPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Les notifications push ne sont pas supportées');
  }

  return await Notification.requestPermission();
}

// Enregistrer le Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service Worker non supporté');
  }

  const registration = await navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  });

  console.log('Service Worker enregistré:', registration);
  return registration;
}

// S'abonner aux notifications push
export async function subscribeUserToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await registerServiceWorker();
    
    // Attendre que le service worker soit prêt
    await navigator.serviceWorker.ready;

    const permission = await askUserPermission();
    
    if (permission !== 'granted') {
      console.log('Permission refusée pour les notifications');
      return null;
    }

    // Vérifier si déjà abonné
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Déjà abonné aux notifications push');
      return existingSubscription;
    }

    // S'abonner
    const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      applicationServerKey: applicationServerKey as any
    });

    console.log('Abonné aux notifications push:', subscription);
    return subscription;
  } catch (error) {
    console.error('Erreur lors de l\'abonnement aux notifications:', error);
    return null;
  }
}

// Se désabonner des notifications
export async function unsubscribeUserFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('Désabonné des notifications push');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors du désabonnement:', error);
    return false;
  }
}

// Envoyer l'abonnement au serveur
export async function sendSubscriptionToServer(subscription: PushSubscription): Promise<boolean> {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    return response.ok;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'abonnement:', error);
    return false;
  }
}

// Obtenir le statut de l'abonnement
export async function getUserSubscription(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement:', error);
    return null;
  }
}
