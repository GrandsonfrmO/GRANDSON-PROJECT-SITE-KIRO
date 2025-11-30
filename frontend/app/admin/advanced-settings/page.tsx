'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
import AdminHeader from '@/app/components/admin/AdminHeader';
import { ToastManager, useToast } from '@/app/components/admin/Toast';

interface AdminUser {
  id: string;
  username: string;
}

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  pendingOrders: number;
  lowStockProducts: number;
}

export default function AdvancedSettingsPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const router = useRouter();

  const [settings, setSettings] = useState<any>({
    site_name: 'Grandson Project',
    contact_email: 'contact@grandsonproject.com',
    contact_phone: '+224662662958',
    delivery_info: 'Livraison disponible dans toute la région de Conakry',
    currency: 'GNF',
    tax_rate: 0,
    free_delivery_threshold: 0,
    enable_notifications: true,
    enable_analytics: true,
    maintenance_mode: false
  });

  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const token = localStorage.getItem('adminToken');
      const user = localStorage.getItem('adminUser');

      if (!token || !user) {
        router.push('/admin/login');
        return;
      }

      try {
        setAdminUser(JSON.parse(user));
        await loadSettings();
        await loadStats();
      } catch (err) {
        console.error('Auth verification failed:', err);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setSettings({ ...settings, ...result.data });
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch('/api/admin/products', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      let productsData: any[] = [];
      let ordersData: any[] = [];

      if (productsResponse.ok) {
        const data = await productsResponse.json();
        productsData = data.data?.products || data.products || [];
      }

      if (ordersResponse.ok) {
        const data = await ordersResponse.json();
        ordersData = data.data?.orders || data.orders || [];
      }

      const totalProducts = productsData.length;
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum: number, order: any) => sum + order.total, 0);
      const pendingOrders = ordersData.filter((order: any) => order.status === 'pending').length;
      const lowStockProducts = productsData.filter((product: any) => product.stock < 5).length;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        activeUsers: 0,
        pendingOrders,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      const result = await response.json();
      if (result.success) {
        showSuccess('Paramètres sauvegardés avec succès');
      } else {
        throw new Error(result.error?.message || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Save settings error:', error);
      showError(error.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-white text-lg font-semibold">Chargement des paramètres...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden">
      <div className="animated-gradient-overlay"></div>
      
      <AdminSidebar
        activeTab="settings"
        setActiveTab={(tab) => {
          if (tab === 'settings') return;
          router.push('/admin/dashboard');
        }}
        adminUser={adminUser}
        onLogout={handleLogout}
        stats={stats}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className={`transition-all duration-500 ease-out relative z-10 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'} ml-0`}>
        <AdminHeader
          activeTab="settings"
          sidebarCollapsed={sidebarCollapsed}
          stats={stats}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="p-4 md:p-8 relative z-10">
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-white text-2xl md:text-3xl font-black flex items-center gap-3">
                  <span className="text-3xl">⚙️</span>
                  <span className="text-shimmer">Paramètres Avancés</span>
                </h3>
                <p className="text-white/60 text-sm md:text-base">Configuration complète de votre boutique</p>
              </div>
              <button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
              >
                <span>{saving ? '⏳' : '💾'}</span>
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span>🏪</span> Informations Générales
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm font-semibold mb-2 block">Nom du site</label>
                    <input
                      type="text"
                      value={settings.site_name || ''}
                      onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-semibold mb-2 block">Email de contact</label>
                    <input
                      type="email"
                      value={settings.contact_email || ''}
                      onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-semibold mb-2 block">Téléphone</label>
                    <input
                      type="tel"
                      value={settings.contact_phone || ''}
                      onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-semibold mb-2 block">Devise</label>
                    <select
                      value={settings.currency || 'GNF'}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent"
                    >
                      <option value="GNF">Franc Guinéen (GNF)</option>
                      <option value="USD">Dollar US (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Delivery Settings */}
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span>🚚</span> Livraison
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm font-semibold mb-2 block">Informations de livraison</label>
                    <textarea
                      value={settings.delivery_info || ''}
                      onChange={(e) => setSettings({ ...settings, delivery_info: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-white/80 text-sm font-semibold mb-2 block">Seuil livraison gratuite (GNF)</label>
                    <input
                      type="number"
                      value={settings.free_delivery_threshold || 0}
                      onChange={(e) => setSettings({ ...settings, free_delivery_threshold: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent"
                    />
                    <p className="text-white/60 text-xs mt-1">0 = pas de livraison gratuite</p>
                  </div>
                </div>
              </div>

              {/* Tax Settings */}
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span>💰</span> Taxes et Frais
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-white/80 text-sm font-semibold mb-2 block">Taux de taxe (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={settings.tax_rate || 0}
                      onChange={(e) => setSettings({ ...settings, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-accent"
                    />
                    <p className="text-white/60 text-xs mt-1">0 = pas de taxe</p>
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span>🔧</span> Système
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-semibold">Notifications Email</p>
                      <p className="text-white/60 text-sm">Envoyer des emails aux clients</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, enable_notifications: !settings.enable_notifications })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${settings.enable_notifications ? 'bg-green-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.enable_notifications ? 'translate-x-6' : ''}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-semibold">Analytics</p>
                      <p className="text-white/60 text-sm">Activer le suivi des statistiques</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, enable_analytics: !settings.enable_analytics })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${settings.enable_analytics ? 'bg-green-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.enable_analytics ? 'translate-x-6' : ''}`}></div>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div>
                      <p className="text-white font-semibold">Mode Maintenance</p>
                      <p className="text-white/60 text-sm">Désactiver temporairement le site</p>
                    </div>
                    <button
                      onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${settings.maintenance_mode ? 'bg-red-500' : 'bg-white/20'}`}
                    >
                      <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.maintenance_mode ? 'translate-x-6' : ''}`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button (Mobile) */}
            <div className="lg:hidden">
              <button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{saving ? '⏳' : '💾'}</span>
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
