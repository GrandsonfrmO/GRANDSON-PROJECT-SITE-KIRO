'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AdminHeaderProps {
  activeTab: string;
  sidebarCollapsed: boolean;
  stats: {
    pendingOrders: number;
    lowStockProducts: number;
  };
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function AdminHeader({ 
  activeTab, 
  sidebarCollapsed, 
  stats, 
  isMobileMenuOpen = false,
  setIsMobileMenuOpen 
}: AdminHeaderProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'warning' | 'error';
    message: string;
    time: string;
    link?: string;
    read?: boolean;
  }>>([]);

  // Fonction pour marquer une notification comme lue
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Fonction pour tout marquer comme lu
  const markAllAsRead = () => {
    setNotifications([]);
  };

  // Fonction pour gérer le clic sur une notification
  const handleNotificationClick = (notification: typeof notifications[0]) => {
    if (notification.link) {
      window.location.href = notification.link;
    }
    markAsRead(notification.id);
    setNotificationsOpen(false);
  };

  // Check if component is mounted (client-side)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize currentTime on client side only
  useEffect(() => {
    setCurrentTime(new Date());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Generate notifications based on stats
    const newNotifications = [];
    
    if (stats.pendingOrders > 0) {
      newNotifications.push({
        id: 'pending-orders',
        type: 'warning' as const,
        message: `${stats.pendingOrders} commande${stats.pendingOrders > 1 ? 's' : ''} en attente`,
        time: '2 min',
        link: '/admin/orders',
        read: false
      });
    }
    
    if (stats.lowStockProducts > 0) {
      newNotifications.push({
        id: 'low-stock',
        type: 'error' as const,
        message: `${stats.lowStockProducts} produit${stats.lowStockProducts > 1 ? 's' : ''} en rupture`,
        time: '5 min',
        link: '/admin/products',
        read: false
      });
    }

    setNotifications(newNotifications);
  }, [stats]);

  const getTabTitle = (tab: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Tableau de bord',
      products: 'Gestion des Produits',
      orders: 'Gestion des Commandes',
      inventory: 'Gestion de l\'Inventaire',
      customers: 'Gestion des Clients',
      analytics: 'Analytics & Rapports',
      marketing: 'Marketing & Promotions',
      settings: 'Paramètres Système',
      'add-product': 'Ajouter un Produit'
    };
    return titles[tab] || 'Administration';
  };

  const getTabDescription = (tab: string) => {
    const descriptions: Record<string, string> = {
      dashboard: 'Vue d\'ensemble de votre plateforme e-commerce',
      products: 'Gérez votre catalogue de produits et inventaire',
      orders: 'Suivez et gérez toutes les commandes clients',
      inventory: 'Contrôlez les stocks et approvisionnements',
      customers: 'Gérez votre base de données clients',
      analytics: 'Analysez les performances et tendances',
      marketing: 'Créez et gérez vos campagnes marketing',
      settings: 'Configurez les paramètres de votre plateforme',
      'add-product': 'Ajoutez de nouveaux produits à votre catalogue'
    };
    return descriptions[tab] || 'Gérez votre plateforme avec des outils avancés';
  };

  return (
    <header className={`glass-header mobile-px mobile-py px-4 md:px-8 py-4 md:py-6 transition-all duration-500 ease-out relative shadow-2xl ${
      sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'
    } ml-0`}>
      <div className="animated-gradient-overlay opacity-20"></div>
      <div className="flex items-center justify-between relative z-10">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen?.(!isMobileMenuOpen)}
            className="touch-target md:hidden btn-glass morph-button p-3 rounded-xl text-white"
          >
            <span className="text-lg">☰</span>
          </button>
          
          {/* Title Section */}
          <div className="flex-1">
            <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-2">
              <h2 className="text-responsive-2xl text-xl md:text-3xl font-black text-white text-shimmer">
                {getTabTitle(activeTab)}
              </h2>
              {activeTab === 'dashboard' && (
                <div className="hidden sm:flex items-center gap-2 glass-secondary px-3 py-1 rounded-full">
                  <div className="status-dot online"></div>
                  <span className="text-green-400 text-sm font-semibold">Système opérationnel</span>
                </div>
              )}
            </div>
            <p className="text-white/60 text-sm md:text-base hidden sm:block">
              {getTabDescription(activeTab)}
            </p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Link 
              href="/"
              className="touch-target bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent px-3 md:px-4 py-2 text-white rounded-2xl font-semibold flex items-center gap-2 text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span>🌐</span>
              <span className="hidden md:inline">Voir le site</span>
            </Link>
            
            <button className="touch-target bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-500 px-3 md:px-4 py-2 text-white rounded-2xl font-semibold flex items-center gap-2 text-sm md:text-base shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95">
              <span>📊</span>
              <span className="hidden md:inline">Rapport</span>
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setButtonPosition({
                  top: rect.bottom + 8,
                  right: window.innerWidth - rect.right
                });
                setNotificationsOpen(!notificationsOpen);
              }}
              className="touch-target btn-glass morph-button w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white interactive-element"
            >
              <span className="text-lg md:text-xl">🔔</span>
            </button>
            {notifications.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center notification-pulse shadow-lg">
                <span className="text-white text-xs font-bold">
                  {notifications.length > 9 ? '9+' : notifications.length}
                </span>
              </div>
            )}
          </div>
          
          {/* Notifications Popup - Rendered via Portal to admin container */}
          {mounted && notificationsOpen && buttonPosition && (() => {
            const portalRoot = document.getElementById('admin-portal-root');
            if (!portalRoot) return null;
            
            return createPortal(
              <>
                {/* Backdrop pour fermer au clic extérieur */}
                <div 
                  className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                  style={{ zIndex: 999998 }}
                  onClick={() => setNotificationsOpen(false)}
                />
                
                <div 
                  className="fixed w-80 md:w-[420px] rounded-3xl overflow-hidden transition-all duration-300 animate-slideDown"
                  style={{
                    top: `${buttonPosition.top}px`,
                    right: `${buttonPosition.right}px`,
                    zIndex: 999999,
                    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                  }}
                >
                  {/* Header avec gradient */}
                  <div className="relative px-5 py-4 border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <span className="text-xl">🔔</span>
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-base">Notifications</h3>
                          <p className="text-white/50 text-xs">
                            {notifications.length > 0 ? `${notifications.length} nouvelle${notifications.length > 1 ? 's' : ''}` : 'Aucune notification'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 hover:rotate-90"
                      >
                        <span className="text-lg">✕</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map((notification, index) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                            style={{
                              animation: `slideIn 0.3s ease-out ${index * 0.1}s both`
                            }}
                          >
                            {/* Gradient background selon le type */}
                            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                              notification.type === 'error'
                                ? 'bg-gradient-to-br from-red-500/20 to-red-600/20'
                                : notification.type === 'warning'
                                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20'
                                : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
                            }`} />
                            
                            {/* Border coloré */}
                            <div className={`absolute inset-0 rounded-2xl ${
                              notification.type === 'error'
                                ? 'bg-gradient-to-r from-red-500/30 to-red-600/30'
                                : notification.type === 'warning'
                                ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30'
                                : 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30'
                            }`} style={{ padding: '1px' }}>
                              <div className="w-full h-full bg-gray-800/90 rounded-2xl" />
                            </div>
                            
                            {/* Content */}
                            <div className="relative p-4 flex items-start gap-3">
                              {/* Icon avec animation */}
                              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                                notification.type === 'error'
                                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                                  : notification.type === 'warning'
                                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500'
                                  : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                              }`}>
                                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                                  {notification.type === 'error' ? '⚠️' : notification.type === 'warning' ? '⏰' : 'ℹ️'}
                                </span>
                              </div>
                              
                              {/* Text content */}
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm mb-1 ${
                                  notification.type === 'error'
                                    ? 'text-red-400'
                                    : notification.type === 'warning'
                                    ? 'text-yellow-400'
                                    : 'text-blue-400'
                                }`}>
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-white/40">
                                  <span>🕐</span>
                                  <span>il y a {notification.time}</span>
                                </div>
                              </div>
                              
                              {/* Action buttons */}
                              <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {notification.link && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleNotificationClick(notification);
                                    }}
                                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200"
                                    title="Voir"
                                  >
                                    <span className="text-sm">→</span>
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/60 hover:text-red-400 transition-all duration-200"
                                  title="Supprimer"
                                >
                                  <span className="text-sm">✕</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                          <span className="text-5xl opacity-50">🔕</span>
                        </div>
                        <p className="text-white/60 text-sm font-medium">Aucune notification</p>
                        <p className="text-white/40 text-xs mt-1">Vous êtes à jour !</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer si notifications */}
                  {notifications.length > 0 && (
                    <div className="px-5 py-3 border-t border-white/10 bg-black/20">
                      <button 
                        onClick={markAllAsRead}
                        className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                      >
                        <span>✓</span>
                        <span>Tout marquer comme lu</span>
                      </button>
                    </div>
                  )}
                </div>
              </>,
              portalRoot
            );
          })()}

          {/* Time & Date */}
          {currentTime && (
            <div className="text-right hidden lg:block glass-secondary px-4 py-2 rounded-xl">
              <p className="text-white font-semibold text-sm">
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <div className="text-white/60 text-xs flex items-center justify-end gap-2">
                <div className="status-dot online"></div>
                {currentTime.toLocaleTimeString('fr-FR')}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}