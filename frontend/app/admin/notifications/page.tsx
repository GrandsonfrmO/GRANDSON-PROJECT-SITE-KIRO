'use client';

import { useState, useEffect } from 'react';

interface Subscriber {
  id: string;
  endpoint: string;
  created_at: string;
}

interface NotificationTemplate {
  id: string;
  title: string;
  body: string;
  icon: string;
  type: 'order' | 'promo' | 'news' | 'custom';
}

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  type: string;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

interface AudienceStats {
  newsletterSubscribers: number;
  customers: number;
  pushSubscribers: number;
}

export default function NotificationsPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [audienceStats, setAudienceStats] = useState<AudienceStats>({
    newsletterSubscribers: 0,
    customers: 0,
    pushSubscribers: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'send' | 'history' | 'settings'>('send');
  
  // Form state
  const [notificationData, setNotificationData] = useState({
    title: '',
    body: '',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    url: '/',
    type: 'email' as 'email' | 'push',
    audience: [] as ('newsletter' | 'customers' | 'push')[],
    emailSubject: '',
    emailBody: ''
  });

  const [autoNotifications, setAutoNotifications] = useState({
    newOrders: true,
    lowStock: true,
    promotions: false
  });

  const templates: NotificationTemplate[] = [
    {
      id: 'new-order',
      title: '🎉 Nouvelle commande reçue',
      body: 'Une nouvelle commande vient d\'être passée',
      icon: '/icon-192x192.png',
      type: 'order'
    },
    {
      id: 'promo',
      title: '🔥 Promotion spéciale',
      body: 'Profitez de -20% sur tous nos produits',
      icon: '/icon-192x192.png',
      type: 'promo'
    },
    {
      id: 'new-product',
      title: '✨ Nouveauté',
      body: 'Découvrez nos nouveaux produits',
      icon: '/icon-192x192.png',
      type: 'news'
    },
    {
      id: 'stock-alert',
      title: '⚠️ Stock faible',
      body: 'Certains produits sont bientôt en rupture',
      icon: '/icon-192x192.png',
      type: 'custom'
    }
  ];

  useEffect(() => {
    loadSubscribers();
    loadAutoSettings();
    loadHistory();
    loadAudienceStats();
  }, []);

  const loadSubscribers = async () => {
    try {
      const response = await fetch('/api/push/subscribers');
      if (response.ok) {
        const data = await response.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (error) {
      console.error('Erreur chargement abonnés:', error);
    }
  };

  const loadAudienceStats = async () => {
    try {
      const response = await fetch('/api/notifications/audience-stats');
      if (response.ok) {
        const data = await response.json();
        setAudienceStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats audience:', error);
    }
  };

  const loadAutoSettings = async () => {
    try {
      const response = await fetch('/api/push/auto-settings');
      if (response.ok) {
        const data = await response.json();
        setAutoNotifications(data.settings || autoNotifications);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/push/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const sendNotification = async () => {
    if (!notificationData.title || !notificationData.body) {
      setMessage({ type: 'error', text: 'Titre et message requis' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Notification envoyée à ${data.sent} abonné(s)` 
        });
        setNotificationData({
          title: '',
          body: '',
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          url: '/',
          type: 'push',
          audience: [],
          emailSubject: '',
          emailBody: ''
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur d\'envoi' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  const useTemplate = (template: NotificationTemplate) => {
    setNotificationData({
      ...notificationData,
      title: template.title,
      body: template.body,
      type: 'push'
    });
  };

  const saveAutoSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/push/auto-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(autoNotifications)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Paramètres sauvegardés' });
      } else {
        setMessage({ type: 'error', text: 'Erreur de sauvegarde' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header avec animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center gap-3">
                <span className="text-5xl animate-bounce">🔔</span>
                Notifications Push
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Gérez et envoyez des notifications à vos clients en temps réel
              </p>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {showPreview ? '👁️ Masquer aperçu' : '👁️ Aperçu'}
            </button>
          </div>
        </div>

        {/* Message de feedback avec animation */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl shadow-lg animate-slide-down ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-l-4 border-green-500' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-l-4 border-red-500'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{message.type === 'success' ? '✅' : '❌'}</span>
              <span className="font-semibold">{message.text}</span>
            </div>
          </div>
        )}

        {/* Aperçu de notification */}
        {showPreview && notificationData.title && (
          <div className="mb-6 p-6 bg-white rounded-xl shadow-xl border-2 border-blue-200 animate-slide-down">
            <p className="text-sm text-gray-500 mb-3 font-semibold">📱 Aperçu de la notification</p>
            <div className="bg-gray-900 text-white p-4 rounded-lg max-w-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🔔</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{notificationData.title}</p>
                  <p className="text-xs text-gray-300 mt-1">{notificationData.body}</p>
                  <p className="text-xs text-blue-400 mt-2">→ {notificationData.url}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats avec animations */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">Abonnés</p>
                <p className="text-4xl font-black mt-2">{subscribers.length}</p>
                <p className="text-xs text-blue-200 mt-1">utilisateurs actifs</p>
              </div>
              <span className="text-6xl opacity-20">👥</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold">Notifications auto</p>
                <p className="text-4xl font-black mt-2">
                  {Object.values(autoNotifications).filter(Boolean).length}
                </p>
                <p className="text-xs text-green-200 mt-1">types activés</p>
              </div>
              <span className="text-6xl opacity-20">📈</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold">Modèles</p>
                <p className="text-4xl font-black mt-2">{templates.length}</p>
                <p className="text-xs text-purple-200 mt-1">prêts à utiliser</p>
              </div>
              <span className="text-6xl opacity-20">📦</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-semibold">Envoyées</p>
                <p className="text-4xl font-black mt-2">
                  {history.reduce((sum, h) => sum + h.sent_count, 0)}
                </p>
                <p className="text-xs text-pink-200 mt-1">au total</p>
              </div>
              <span className="text-6xl opacity-20">📤</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-lg">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'send'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📤 Envoyer
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Historique
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⚙️ Paramètres
          </button>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Envoi de notification */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📤</span>
                Envoyer une notification
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData({ ...notificationData, title: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Ex: Nouvelle promotion"
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">{notificationData.title.length}/50 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={notificationData.body}
                    onChange={(e) => setNotificationData({ ...notificationData, body: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="Ex: Profitez de -20% sur tous nos produits"
                    maxLength={120}
                  />
                  <p className="text-xs text-gray-500 mt-1">{notificationData.body.length}/120 caractères</p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    URL de destination
                  </label>
                  <input
                    type="text"
                    value={notificationData.url}
                    onChange={(e) => setNotificationData({ ...notificationData, url: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="/"
                  />
                </div>

                <button
                  onClick={sendNotification}
                  disabled={loading || !notificationData.title || !notificationData.body}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">📤</span>
                      Envoyer à {subscribers.length} abonné{subscribers.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Modèles */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">⚡</span>
                Modèles rapides
              </h2>

              <div className="space-y-4">
                {templates.map((template, index) => (
                  <button
                    key={template.id}
                    onClick={() => useTemplate(template)}
                    className="w-full text-left p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all transform hover:scale-105 hover:shadow-lg"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <p className="font-bold text-gray-900 text-lg">{template.title}</p>
                    <p className="text-sm text-gray-600 mt-2">{template.body}</p>
                    <span className="inline-block mt-3 text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                      Cliquer pour utiliser
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Historique */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">📊</span>
              Historique des notifications
            </h2>

            {history.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">📭</span>
                <p className="text-gray-500 mt-4 text-lg">Aucune notification envoyée pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {item.type === 'order' ? '🎉' : item.type === 'promo' ? '🔥' : item.type === 'stock' ? '⚠️' : '📢'}
                          </span>
                          <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                        </div>
                        <p className="text-gray-600 ml-11">{item.body}</p>
                        <div className="flex items-center gap-4 mt-3 ml-11">
                          <span className="text-xs font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            ✅ {item.sent_count} envoyées
                          </span>
                          {item.failed_count > 0 && (
                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                              ❌ {item.failed_count} échouées
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            🕐 {formatDate(item.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paramètres */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              Notifications automatiques
            </h2>

            <div className="space-y-5">
              <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">🎉</span>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Nouvelles commandes</p>
                      <p className="text-sm text-gray-600 mt-1">Notifier automatiquement lors d'une nouvelle commande</p>
                      <span className="inline-block mt-2 text-xs font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        Recommandé
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoNotifications.newOrders}
                      onChange={(e) => setAutoNotifications({ ...autoNotifications, newOrders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">⚠️</span>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Stock faible</p>
                      <p className="text-sm text-gray-600 mt-1">Alerter quand le stock d'un produit est bas</p>
                      <span className="inline-block mt-2 text-xs font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                        Important
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoNotifications.lowStock}
                      onChange={(e) => setAutoNotifications({ ...autoNotifications, lowStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-pink-300 hover:bg-pink-50 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">🔥</span>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">Promotions</p>
                      <p className="text-sm text-gray-600 mt-1">Notifier automatiquement les nouvelles promotions</p>
                      <span className="inline-block mt-2 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                        Optionnel
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoNotifications.promotions}
                      onChange={(e) => setAutoNotifications({ ...autoNotifications, promotions: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
                  </label>
                </div>
              </div>

              <button
                onClick={saveAutoSettings}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold hover:shadow-2xl disabled:opacity-50 transition-all transform hover:scale-105 flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <span className="text-2xl">💾</span>
                    Sauvegarder les paramètres
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
