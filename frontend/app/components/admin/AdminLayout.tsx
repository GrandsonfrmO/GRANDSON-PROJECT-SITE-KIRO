'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { admin, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊', badge: null },
    { name: 'Produits', href: '/admin/products', icon: '🛍️', badge: null },
    { name: 'Commandes', href: '/admin/orders', icon: '📦', badge: 'NEW' },
    { name: 'Pages', href: '/admin/pages', icon: '📄', badge: null },
    { name: 'Livraison', href: '/admin/delivery-zones', icon: '🚚', badge: null },
    { name: 'Paramètres', href: '/admin/settings', icon: '⚙️', badge: null },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-black to-neutral-900">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Enhanced */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-neutral-900 via-black to-neutral-950 border-r border-neutral-800/50 shadow-2xl transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo - Enhanced */}
        <div className="p-6 border-b border-neutral-800/50 bg-black/50">
          <Link href="/admin/dashboard" className="block group">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/10 blur-2xl group-hover:bg-accent/20 transition-all"></div>
              <h1 className="relative text-3xl font-black text-white uppercase tracking-tighter">
                GRANDSON
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-accent text-xs uppercase tracking-widest font-bold">
                Admin Panel
              </p>
              <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded border border-accent/20">
                PRO
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation - Enhanced */}
        <nav className="p-4 space-y-1.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl font-bold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-accent to-accent/80 text-black shadow-lg shadow-accent/20'
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-accent/20 blur-xl rounded-xl"></div>
                )}
                <div className="relative flex items-center gap-3">
                  <span className={`text-2xl transition-transform group-hover:scale-110 ${isActive ? 'animate-bounce' : ''}`}>
                    {item.icon}
                  </span>
                  <span className="text-base">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="relative px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Actions - Enhanced */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-800/50 bg-black/50 backdrop-blur-xl">
          <div className="mb-4 px-3 py-3 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold mb-1.5">
              Connecté en tant que
            </p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/60 rounded-lg flex items-center justify-center text-black font-black text-sm">
                {admin?.username?.charAt(0).toUpperCase()}
              </div>
              <p className="text-sm text-white font-bold">{admin?.username}</p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mb-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-white text-center font-bold rounded-xl transition-all duration-200 border-2 border-neutral-700/50 hover:border-accent"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Voir la boutique</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/20 border-2 border-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Bar - Enhanced */}
        <header className="bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-800/50 sticky top-0 z-30 shadow-xl">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2.5 hover:bg-neutral-800/50 rounded-xl transition-all duration-200 group border-2 border-transparent hover:border-accent"
              >
                <svg
                  className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div>
                <h2 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">
                  {navigation.find((item) => item.href === pathname)?.name || 'Admin'}
                </h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">
                  Gestion et administration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs text-neutral-400 font-mono">En ligne</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
                <span className="text-sm text-neutral-400 font-semibold">{admin?.username}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Enhanced */}
        <main className="p-4 sm:p-6 lg:p-8">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        {/* Footer - New */}
        <footer className="border-t border-neutral-800/50 bg-neutral-900/50 backdrop-blur-xl mt-8">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
              <p className="font-mono">© 2024 Grandson Project. Tous droits réservés.</p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-semibold">Système opérationnel</span>
                </span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
