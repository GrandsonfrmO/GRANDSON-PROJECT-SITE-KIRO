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

interface AudienceStats {
  newsletter: number;
  customers: number;
  all: number;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  audience: string;
  sent_count: number;
  failed_count: number;
  status: string;
  created_at: string;
}

export default function EmailCampaignsPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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
  const [audienceStats, setAudienceStats] = useState<AudienceStats>({
    newsletter: 0,
    customers: 0,
    all: 0
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const router = useRouter();

  const [emailData, setEmailData] = useState({
    campaignName: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    audience: 'all' as 'newsletter' | 'customers' | 'all'
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
        await Promise.all([
          loadStats(),
          loadAudienceStats(),
          loadCampaigns()
        ]);
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

  const loadAudienceStats = async () => {
    try {
      const response = await fetch('/api/email/send-campaign?action=audience-stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setAudienceStats(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading audience stats:', error);
    }
  };

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/email/send-campaign?action=campaigns', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCampaigns(result.data);
        }
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleSendCampaign = async () => {
    if (!emailData.subject || !emailData.htmlContent) {
      showError('Veuillez remplir le sujet et le contenu');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/email/send-campaign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi');
      }

      const result = await response.json();
      if (result.success) {
        showSuccess(`Campagne envoyée avec succès! ${result.sent} emails envoyés`);
        setEmailData({
          campaignName: '',
          subject: '',
          htmlContent: '',
          textContent: '',
          audience: 'all'
        });
        await loadCampaigns();
      } else {
        throw new Error(result.error || 'Erreur inconnue');
      }
    } catch (error: any) {
      console.error('Send campaign error:', error);
      showError(error.message || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/admin/login');
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case 'newsletter': return 'Abonnés Newsletter';
      case 'customers': return 'Clients';
      case 'all': return 'Tous';
      default: return audience;
    }
  };

  const getAudienceCount = () => {
    return audienceStats[emailData.audience] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg font-semibold">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-gradient relative overflow-hidden">
      <div className="animated-gradient-overlay"></div>
      
      <AdminSidebar
        activeTab="marketing"
        setActiveTab={(tab) => {
          if (tab === 'marketing') return;
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
          activeTab="marketing"
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
                  <span className="text-3xl">📧</span>
                  <span className="text-shimmer">Campagnes Email</span>
                </h3>
                <p className="text-white/60 text-sm md:text-base">Envoyez des emails à vos clients et abonnés</p>
              </div>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="px-6 py-3 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                <span>{showHistory ? '✉️' : '📊'}</span>
                <span>{showHistory ? 'Nouvelle campagne' : 'Historique'}</span>
              </button>
            </div>

            {!showHistory ? (
              <>
                {/* Audience Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm font-semibold">Abonnés Newsletter</span>
                      <span className="text-2xl">📰</span>
                    </div>
                    <div className="text-white text-3xl font-black">{audienceStats.newsletter}</div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm font-semibold">Clients</span>
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <div className="text-white text-3xl font-black">{audienceStats.customers}</div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/60 text-sm font-semibold">Total Unique</span>
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="text-white text-3xl font-black">{audienceStats.all}</div>
                  </div>
                </div>

                {/* Campaign Form */}
                <div className="glass-card p-6 rounded-2xl">
                  <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                    <span>✉️</span> Nouvelle Campagne
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Nom de la campagne</label>
                      <input
                        type="text"
                        value={emailData.campaignName}
                        onChange={(e) => setEmailData({ ...emailData, campaignName: e.target.value })}
                        placeholder="Ex: Promotion Été 2024"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Sujet de l'email *</label>
                      <input
                        type="text"
                        value={emailData.subject}
                        onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                        placeholder="Ex: 🔥 -20% sur tous nos produits !"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Audience *</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                          onClick={() => setEmailData({ ...emailData, audience: 'newsletter' })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            emailData.audience === 'newsletter'
                              ? 'border-accent bg-accent/20'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-2xl mb-2">📰</div>
                          <div className="text-white font-bold">Newsletter</div>
                          <div className="text-white/60 text-sm">{audienceStats.newsletter} abonnés</div>
                        </button>
                        <button
                          onClick={() => setEmailData({ ...emailData, audience: 'customers' })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            emailData.audience === 'customers'
                              ? 'border-accent bg-accent/20'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-2xl mb-2">🛍️</div>
                          <div className="text-white font-bold">Clients</div>
                          <div className="text-white/60 text-sm">{audienceStats.customers} clients</div>
                        </button>
                        <button
                          onClick={() => setEmailData({ ...emailData, audience: 'all' })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            emailData.audience === 'all'
                              ? 'border-accent bg-accent/20'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="text-2xl mb-2">👥</div>
                          <div className="text-white font-bold">Tous</div>
                          <div className="text-white/60 text-sm">{audienceStats.all} personnes</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Contenu HTML *</label>
                      <textarea
                        value={emailData.htmlContent}
                        onChange={(e) => setEmailData({ ...emailData, htmlContent: e.target.value })}
                        placeholder="<h1>Bonjour!</h1><p>Profitez de notre promotion...</p>"
                        rows={10}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent resize-none font-mono text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-white/80 text-sm font-semibold mb-2 block">Contenu texte (optionnel)</label>
                      <textarea
                        value={emailData.textContent}
                        onChange={(e) => setEmailData({ ...emailData, textContent: e.target.value })}
                        placeholder="Version texte brut de votre email..."
                        rows={5}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-accent resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-accent/10 border border-accent/30 rounded-xl">
                      <div>
                        <p className="text-white font-bold">Prêt à envoyer</p>
                        <p className="text-white/60 text-sm">
                          {getAudienceCount()} destinataires • {getAudienceLabel(emailData.audience)}
                        </p>
                      </div>
                      <button
                        onClick={handleSendCampaign}
                        disabled={sending || !emailData.subject || !emailData.htmlContent}
                        className="px-6 py-3 bg-gradient-to-r from-accent to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <span>{sending ? '⏳' : '🚀'}</span>
                        <span>{sending ? 'Envoi...' : 'Envoyer'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Campaign History */
              <div className="glass-card p-6 rounded-2xl">
                <h4 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
                  <span>📊</span> Historique des campagnes
                </h4>
                
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <p className="text-white/60">Aucune campagne envoyée</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="text-white font-bold mb-1">{campaign.name || campaign.subject}</h5>
                            <p className="text-white/60 text-sm mb-2">{campaign.subject}</p>
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span className="px-3 py-1 bg-accent/20 text-accent rounded-full">
                                {getAudienceLabel(campaign.audience)}
                              </span>
                              <span className="text-white/60">
                                ✅ {campaign.sent_count} envoyés
                              </span>
                              {campaign.failed_count > 0 && (
                                <span className="text-red-400">
                                  ❌ {campaign.failed_count} échecs
                                </span>
                              )}
                              <span className="text-white/60">
                                📅 {new Date(campaign.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold text-2xl">{campaign.sent_count}</div>
                            <div className="text-white/60 text-xs">emails</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
