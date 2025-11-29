'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  badge?: number;
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  adminUser: { username: string } | null;
  onLogout: () => void;
  stats: {
    pendingOrders: number;
    lowStockProducts: number;
  };
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  adminUser, 
  onLogout, 
  stats,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false); // Always expanded on mobile when open
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarItems: SidebarItem[] = [
    { 
      id: 'dashboard', 
      name: 'Tableau de bord', 
      icon: '📊', 
      color: 'from-blue-500 to-blue-600' 
    },
    { 
      id: 'products', 
      name: 'Produits', 
      icon: '📦', 
      color: 'from-green-500 to-green-600' 
    },
    { 
      id: 'orders', 
      name: 'Commandes', 
      icon: '🛒', 
      color: 'from-orange-500 to-orange-600',
      badge: stats.pendingOrders 
    },
    { 
      id: 'inventory', 
      name: 'Inventaire', 
      icon: '📋', 
      color: 'from-purple-500 to-purple-600',
      badge: stats.lowStockProducts 
    },
    { 
      id: 'customers', 
      name: 'Clients', 
      icon: '👥', 
      color: 'from-indigo-500 to-indigo-600' 
    },
    { 
      id: 'push-notifications', 
      name: 'Notifications Push', 
      icon: '🔔', 
      color: 'from-yellow-500 to-yellow-600' 
    },
    { 
      id: 'email-campaigns', 
      name: 'Campagnes Email', 
      icon: '📧', 
      color: 'from-cyan-500 to-cyan-600' 
    },
    { 
      id: 'brand-images', 
      name: 'Images de Marque', 
      icon: '🎨', 
      color: 'from-pink-500 to-pink-600' 
    },
    { 
      id: 'settings', 
      name: 'Paramètres', 
      icon: '⚙️', 
      color: 'from-gray-500 to-gray-600' 
    },
  ];

  const handleTabChange = (tabId: string) => {
    // Rediriger vers les pages dédiées
    if (tabId === 'homepage') {
      window.location.href = '/admin/homepage-settings';
      return;
    }
    if (tabId === 'settings') {
      window.location.href = '/admin/settings';
      return;
    }
    if (tabId === 'push-notifications') {
      window.location.href = '/admin/push-notifications';
      return;
    }
    if (tabId === 'email-campaigns') {
      window.location.href = '/admin/email-campaigns';
      return;
    }
    if (tabId === 'brand-images') {
      window.location.href = '/admin/brand-images';
      return;
    }
    
    setActiveTab(tabId);
    // Close mobile menu when tab is selected
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen?.(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-out animate-fade-in-left ${
        isMobile 
          ? `w-80 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`
          : isCollapsed ? 'w-20' : 'w-80'
      } bg-white/10 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/10 shadow-lg`}
      style={{ 
        backdropFilter: 'blur(20px)',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
      <div className="flex flex-col h-full mobile-py">
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between h-20 mobile-px px-6 border-b border-slate-200 dark:border-slate-800">
          {(!isCollapsed || isMobile) && (
            <Link href="/" className="text-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                <span className="text-blue-600 dark:text-blue-500">ADMIN</span>
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Grandson Project</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1 hover:underline">← Retour au site</p>
            </Link>
          )}
          
          {/* Desktop toggle button */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="touch-target p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <span className="text-lg">
                {isCollapsed ? '→' : '←'}
              </span>
            </button>
          )}
          
          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setIsMobileMenuOpen?.(false)}
              className="touch-target p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            >
              <span className="text-lg">✕</span>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mobile-px mobile-py px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`touch-target w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 animate-fade-in-left ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-accent to-green-500 text-white shadow-lg shadow-accent/50'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-white/10 hover:to-white/5 hover:scale-105'
              }`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
              title={isCollapsed && !isMobile ? item.name : undefined}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {(!isCollapsed || isMobile) && (
                <>
                  <span className="font-medium truncate flex-1 text-left">{item.name}</span>
                  {item.badge && item.badge > 0 && (
                    <div className="ml-auto w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                      <span className="text-white text-xs font-bold">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    </div>
                  )}
                </>
              )}
              
              {/* Badge for collapsed state */}
              {isCollapsed && !isMobile && item.badge && item.badge > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-white text-xs font-bold">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="mobile-px mobile-py p-4 border-t border-slate-200 dark:border-slate-800">
          <div className={`flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg ${
            isCollapsed && !isMobile ? 'justify-center' : ''
          }`}>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">👑</span>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-slate-900 dark:text-white font-medium truncate">{adminUser?.username}</p>
                <div className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Administrateur</span>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onLogout}
            className={`touch-target w-full mt-3 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-all font-medium ${
              isCollapsed && !isMobile ? 'justify-center' : 'justify-center'
            }`}
            title={isCollapsed && !isMobile ? 'Déconnexion' : undefined}
          >
            <span className="text-lg">🚪</span>
            {(!isCollapsed || isMobile) && 'Déconnexion'}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}