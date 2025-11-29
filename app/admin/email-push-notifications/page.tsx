'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/admin/AdminLayout';

interface Subscriber {
  id: string;
  email: string;
  customer_name: string;
  phone: string;
  subscribed: boolean;
  last_order_at: string;
  created_at: string;
}

interface Stats {
  total: number;
  recent: number;
  inactive: number;
  subscribers: Subscriber[];
}

export default function EmailPushNotificationsPage() {
  const [stats, setStats] = useState<Stats>({ total: 0, recent: 0, inactive: 0, subscribers: [] });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    url: '',
    audience: 'all'
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/push/send-to-emails');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      setMessage('Veuillez remplir tous les champs');
      return;
    }

    setSending(true);
    setMessage('');

    try {
      const response = await fetch('/api/push/send-to-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`✅ Notification envoyée à ${data.sent} abonné(s)`);
        setFormData({ title: '', message: '', url: '', audience: 'all' });
      } else {
        setMessage(`❌ Erreur: ${data.error}`);
      }
    } catch (error) {
      console.error('Erreur envoi:', error);
      setMessage('❌ Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const getAudienceCount = () => {
    switch (formData.audience) {
      case 'recent_customers':
        return stats.recent;
      case 'inactive_customers':
        return stats.inactive;
      default:
        return stats.total;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 Notifications par Email
          </h1>
          <p className="text-gray-600">
            Envoyez des notifications aux clients qui ont commandé sur votre site
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-blue-100">Total Abonnés</span>
              <span className="text-3xl">👥</span>
            </div>
            <div className="text-4xl font-bold">{stats.total}</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-100">Clients Récents</span>
              <span className="text-3xl">🔥</span>
            </div>
            <div className="text-4xl font-bold">{stats.recent}</div>
            <div className="text-sm text-green-100 mt-1">Derniers 30 jours</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-orange-100">Clients Inactifs</span>
              <span className="text-3xl">💤</span>
            </div>
            <div className="text-4xl font-bold">{stats.inactive}</div>
            <div className="text-sm text-orange-100 mt-1">+30 jours</div>
          </div>
        </div>

        {/* Formulaire d'envoi */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Envoyer une Notification
          </h2>

          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Public Cible
              </label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les clients ({stats.total})</option>
                <option value="recent_customers">Clients récents ({stats.recent})</option>
                <option value="inactive_customers">Clients inactifs ({stats.inactive})</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                📊 {getAudienceCount()} destinataire(s) seront notifiés
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: 🔥 Nouvelle promotion !"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Votre message..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Lien (optionnel)
              </label>
              <input
                type="text"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="/products ou https://..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-800 border-2 border-green-200' 
                  : 'bg-red-50 text-red-800 border-2 border-red-200'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={sending || !formData.title || !formData.message}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Envoi en cours...
                </span>
              ) : (
                `📤 Envoyer à ${getAudienceCount()} client(s)`
              )}
            </button>
          </form>
        </div>

        {/* Liste des abonnés */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Liste des Abonnés
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Chargement...</p>
            </div>
          ) : stats.subscribers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-600">Aucun abonné pour le moment</p>
              <p className="text-sm text-gray-500 mt-2">
                Les clients seront automatiquement abonnés lors de leur première commande
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Nom</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Téléphone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Dernière commande</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{subscriber.email}</td>
                      <td className="py-3 px-4 text-sm">{subscriber.customer_name || '-'}</td>
                      <td className="py-3 px-4 text-sm">{subscriber.phone || '-'}</td>
                      <td className="py-3 px-4 text-sm">
                        {subscriber.last_order_at 
                          ? new Date(subscriber.last_order_at).toLocaleDateString('fr-FR')
                          : '-'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          subscriber.subscribed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {subscriber.subscribed ? '✓ Abonné' : '✗ Désabonné'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
