'use client';

import { useState, useEffect } from 'react';
import { 
  isPushNotificationSupported, 
  subscribeUserToPush, 
  sendSubscriptionToServer,
  getUserSubscription 
} from '@/app/lib/pushNotifications';

export default function PushNotificationPrompt() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      const supported = isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const subscription = await getUserSubscription();
        setIsSubscribed(!!subscription);
        
        // Afficher le prompt si pas encore abonné et pas déjà refusé
        const hasDeclined = localStorage.getItem('push-notification-declined');
        if (!subscription && !hasDeclined) {
          // Attendre 5 secondes avant d'afficher le prompt
          setTimeout(() => setShowPrompt(true), 5000);
        }
      }
    };

    checkSupport();
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const subscription = await subscribeUserToPush();
      
      if (subscription) {
        // Envoyer l'abonnement au serveur
        const success = await sendSubscriptionToServer(subscription);
        
        if (success) {
          setIsSubscribed(true);
          setShowPrompt(false);
          localStorage.removeItem('push-notification-declined');
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    setShowPrompt(false);
    localStorage.setItem('push-notification-declined', 'true');
  };

  if (!isSupported || !showPrompt || isSubscribed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl p-6 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🔔</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2">
              Restez informé !
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Recevez des notifications pour vos commandes, promotions et nouveautés.
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Activation...' : 'Activer'}
              </button>
              
              <button
                onClick={handleDecline}
                disabled={isLoading}
                className="px-4 py-2 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDecline}
            className="flex-shrink-0 text-white/40 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
