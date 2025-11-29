'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

interface HomeSettings {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    badge: string;
  };
  contact: {
    phone: string;
    email: string;
  };
}

export default function HomepageSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'hero' | 'delivery'>('hero');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Hero Settings
  const [heroSettings, setHeroSettings] = useState<HomeSettings>({
    hero: {
      title: 'Bienvenue',
      subtitle: '',
      description: 'Découvrez notre collection de produits de qualité premium',
      badge: ''
    },
    contact: {
      phone: '',
      email: ''
    }
  });

  // Delivery Zones
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [showZoneModal, setShowZoneModal] = useState(false);

  useEffect(() => {
    loadSettings();
    loadDeliveryZones();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.data) {
        setHeroSettings({
          hero: data.data.hero || heroSettings.hero,
          contact: data.data.contact || heroSettings.contact
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadDeliveryZones = async () => {
    try {
      const response = await fetch('/api/delivery-zones');
      const data = await response.json();
      if (data.success && data.data) {
        setDeliveryZones(data.data);
      }
    } catch (error) {
      console.error('Error loading delivery zones:', error);
    }
  };

  const saveHeroSettings = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroSettings)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Paramètres sauvegardés avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const saveDeliveryZone = async (zone: Partial<DeliveryZone>) => {
    setLoading(true);
    
    try {
      const url = zone.id 
        ? `/api/admin/delivery-zones/${zone.id}`
        : '/api/admin/delivery-zones';
      
      const method = zone.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zone)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Zone de livraison sauvegardée !');
        loadDeliveryZones();
        setShowZoneModal(false);
        setEditingZone(null);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Erreur lors de la sauvegarde');
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const deleteDeliveryZone = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette zone ?')) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/admin/delivery-zones/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('✅ Zone supprimée !');
        loadDeliveryZones();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Erreur lors de la suppression');
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="group inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 font-semibold transition-all duration-300 hover:gap-3"
            >
              <span className="text-xl">←</span>
              <span>Retour au Dashboard</span>
            </button>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🏠</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Paramètres de la Page d'Accueil
                </h1>
                <p className="text-gray-600 mt-1 font-medium">Gérez le contenu et les zones de livraison</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message with animation */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl shadow-lg border-2 animate-fade-in-down ${
            message.includes('✅') 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{message.includes('✅') ? '✅' : '❌'}</span>
              <span className="font-semibold">{message}</span>
            </div>
          </div>
        )}

        {/* Tabs with modern design */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <nav className="flex -mb-px p-2 gap-2">
              <button
                onClick={() => setActiveTab('hero')}
                className={`flex-1 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${
                  activeTab === 'hero'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🏠</span>
                  <span>Page d'Accueil</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`flex-1 px-6 py-4 text-sm font-bold rounded-2xl transition-all duration-300 ${
                  activeTab === 'delivery'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">🚚</span>
                  <span>Zones de Livraison</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Hero Settings Tab */}
          {activeTab === 'hero' && (
            <div className="p-6 md:p-8 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Contenu du Hero Banner</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre Principal
                  </label>
                  <input
                    type="text"
                    value={heroSettings.hero.title}
                    onChange={(e) => setHeroSettings({
                      ...heroSettings,
                      hero: { ...heroSettings.hero, title: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Bienvenue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre (optionnel)
                  </label>
                  <input
                    type="text"
                    value={heroSettings.hero.subtitle}
                    onChange={(e) => setHeroSettings({
                      ...heroSettings,
                      hero: { ...heroSettings.hero, subtitle: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Votre slogan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={heroSettings.hero.description}
                    onChange={(e) => setHeroSettings({
                      ...heroSettings,
                      hero: { ...heroSettings.hero, description: e.target.value }
                    })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Description de votre boutique"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge (optionnel)
                  </label>
                  <input
                    type="text"
                    value={heroSettings.hero.badge}
                    onChange={(e) => setHeroSettings({
                      ...heroSettings,
                      hero: { ...heroSettings.hero, badge: e.target.value }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Nouveau, Promo, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={heroSettings.contact.phone}
                      onChange={(e) => setHeroSettings({
                        ...heroSettings,
                        contact: { ...heroSettings.contact, phone: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+224 XXX XX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={heroSettings.contact.email}
                      onChange={(e) => setHeroSettings({
                        ...heroSettings,
                        contact: { ...heroSettings.contact, email: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>

                <button
                  onClick={saveHeroSettings}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-black text-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Sauvegarde en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>💾</span>
                      Sauvegarder les Modifications
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Delivery Zones Tab */}
          {activeTab === 'delivery' && (
            <div className="p-6 md:p-8 animate-fade-in-up">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🚚</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Zones de Livraison</h2>
                </div>
                <button
                  onClick={() => {
                    setEditingZone(null);
                    setShowZoneModal(true);
                  }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-2xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <span>➕</span>
                    Ajouter une Zone
                  </span>
                </button>
              </div>

              <div className="grid gap-4 md:gap-6">
                {deliveryZones.map((zone, index) => (
                  <div 
                    key={zone.id} 
                    className="group relative bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📍</span>
                          </div>
                          <h3 className="font-black text-xl text-gray-900">{zone.name}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                            <p className="text-blue-600 text-sm font-semibold mb-1">💰 Prix</p>
                            <p className="text-gray-900 font-black text-lg">{zone.price.toLocaleString()} GNF</p>
                          </div>
                          <div className={`rounded-xl p-3 border ${
                            zone.isActive 
                              ? 'bg-green-50 border-green-100' 
                              : 'bg-red-50 border-red-100'
                          }`}>
                            <p className={`text-sm font-semibold mb-1 ${
                              zone.isActive ? 'text-green-600' : 'text-red-600'
                            }`}>
                              Statut
                            </p>
                            <p className={`font-black text-lg ${
                              zone.isActive ? 'text-green-700' : 'text-red-700'
                            }`}>
                              {zone.isActive ? '✅ Active' : '❌ Inactive'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                        <button
                          onClick={() => {
                            setEditingZone(zone);
                            setShowZoneModal(true);
                          }}
                          className="flex-1 md:flex-none bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <span>✏️</span>
                            <span>Modifier</span>
                          </span>
                        </button>
                        <button
                          onClick={() => deleteDeliveryZone(zone.id)}
                          className="flex-1 md:flex-none bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <span>🗑️</span>
                            <span>Supprimer</span>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {deliveryZones.length === 0 && (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl">📦</span>
                    </div>
                    <p className="text-xl font-bold text-gray-700 mb-2">Aucune zone de livraison configurée</p>
                    <p className="text-gray-500">Cliquez sur "Ajouter une Zone" pour commencer</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone Modal */}
      {showZoneModal && (
        <ZoneModal
          zone={editingZone}
          onSave={saveDeliveryZone}
          onClose={() => {
            setShowZoneModal(false);
            setEditingZone(null);
          }}
        />
      )}
    </div>
  );
}

// Zone Modal Component
function ZoneModal({ 
  zone, 
  onSave, 
  onClose 
}: { 
  zone: DeliveryZone | null; 
  onSave: (zone: Partial<DeliveryZone>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    price: zone?.price || 0,
    isActive: zone?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(zone?.id && { id: zone.id }),
      ...formData
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-bounce-in">
        <h3 className="text-xl font-bold mb-4 text-white">
          {zone ? 'Modifier la Zone' : 'Nouvelle Zone de Livraison'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Nom de la Zone *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-4 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
              placeholder="Ex: Conakry Centre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Prix (GNF) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-4 focus:ring-accent/20 focus:border-accent focus:outline-none transition-all duration-300"
              placeholder="5000"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-accent border-white/20 rounded focus:ring-accent/20"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-white/80">
              Zone active
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/10 text-white py-2 px-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-accent to-green-500 text-white py-2 px-4 rounded-xl font-semibold hover:from-green-500 hover:to-accent transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              💾 Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
