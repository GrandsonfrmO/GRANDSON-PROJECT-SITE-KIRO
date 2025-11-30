'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
import AdminHeader from '@/app/components/admin/AdminHeader';
import AddProductForm from '@/app/components/admin/AddProductForm';
import { ToastManager, useToast } from '@/app/components/admin/Toast';
import { authStorage } from '@/app/lib/authStorage';

interface AdminUser {
  id: string;
  username: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    lowStockProducts: 0
  });

  const handleLogout = () => {
    console.log('[AddProductPage] Logging out user');
    authStorage.clearAuthData();
    router.push('/admin/mobile-login');
  };

  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AddProductPage] Checking authentication', {
        timestamp: new Date().toISOString(),
        path: window.location.pathname
      });

      // Check if authenticated using AuthStorage service
      const isAuth = authStorage.isAuthenticated();
      
      if (!isAuth) {
        console.log('[AddProductPage] No valid authentication found, redirecting to login');
        router.push('/admin/mobile-login');
        return;
      }

      // Get auth data
      const authData = authStorage.getAuthData();
      
      if (!authData) {
        console.log('[AddProductPage] Auth data retrieval failed, redirecting to login');
        router.push('/admin/mobile-login');
        return;
      }

      // Check if token is expired
      if (authData.expiresAt && Date.now() > authData.expiresAt) {
        console.log('[AddProductPage] Token expired, clearing storage and redirecting');
        authStorage.clearAuthData();
        router.push('/admin/mobile-login');
        return;
      }

      console.log('[AddProductPage] Authentication verified successfully', {
        username: authData.user.username,
        timestamp: new Date().toISOString()
      });

      setUser(authData.user);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <ToastManager toasts={toasts} removeToast={removeToast} />
      
      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adminUser={user}
          onLogout={handleLogout}
          stats={stats}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        <div className="flex-1 lg:ml-64 transition-all duration-300">
          <AdminHeader
            activeTab={activeTab}
            sidebarCollapsed={sidebarCollapsed}
            stats={stats}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
          />
          
          <main className="p-4 lg:p-8 min-h-screen">
            <div className="max-w-6xl mx-auto">
              {/* Breadcrumb */}
              <nav className="mb-6 flex items-center gap-2 text-sm text-white/60">
                <button 
                  onClick={() => router.push('/admin/dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Dashboard
                </button>
                <span>→</span>
                <button 
                  onClick={() => router.push('/admin/dashboard?tab=products')}
                  className="hover:text-white transition-colors"
                >
                  Produits
                </button>
                <span>→</span>
                <span className="text-white">Nouveau produit</span>
              </nav>

              <AddProductForm
                onProductCreated={() => {
                  showSuccess('🎉 Produit créé avec succès!');
                  localStorage.removeItem('productDraft'); // Clear draft
                  setTimeout(() => {
                    router.push('/admin/dashboard?tab=products');
                  }, 1500);
                }}
                onCancel={() => router.push('/admin/dashboard?tab=products')}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}