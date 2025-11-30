'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/app/components/admin/AdminSidebar';
import AdminHeader from '@/app/components/admin/AdminHeader';
import StatsCard from '@/app/components/admin/StatsCard';
import ProductCard from '@/app/components/admin/ProductCard';
import OrderCard from '@/app/components/admin/OrderCard';
import OrderStats from '@/app/components/admin/OrderStats';
import DashboardCharts from '@/app/components/admin/DashboardCharts';
import { ToastManager, useToast } from '@/app/components/admin/Toast';
import AddProductForm from '@/app/components/admin/AddProductForm';
import api from '@/app/lib/api';
import { Product } from '@/app/types';
import { authStorage } from '@/app/lib/authStorage';
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

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export default function SuperAdminDashboard() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [newProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    sizes: [] as string[],
    images: [] as string[],
    colors: [] as string[],
    stock: ''
  });
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const router = useRouter();
  
  // Inventory modal states
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState(0);
  


  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      const checkStartTime = Date.now();
      
      // Requirement 4.5: Log dashboard authentication verification with device info
      console.log('[Dashboard] Starting authentication check', {
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'direct'
      });

      // Check if authenticated using AuthStorage service
      const isAuth = authStorage.isAuthenticated();
      
      if (!isAuth) {
        const checkDuration = Date.now() - checkStartTime;
        console.log('[Dashboard] No valid authentication found, redirecting to login', {
          timestamp: new Date().toISOString(),
          reason: 'not_authenticated',
          checkDuration: `${checkDuration}ms`,
          redirectTo: '/admin/login'
        });
        router.push('/admin/login');
        return;
      }

      // Get auth data
      const authData = authStorage.getAuthData();
      
      if (!authData) {
        const checkDuration = Date.now() - checkStartTime;
        console.log('[Dashboard] Auth data retrieval failed, redirecting to login', {
          timestamp: new Date().toISOString(),
          reason: 'auth_data_null',
          checkDuration: `${checkDuration}ms`,
          redirectTo: '/admin/login'
        });
        router.push('/admin/login');
        return;
      }

      // Check if token is expired
      if (authData.expiresAt && Date.now() > authData.expiresAt) {
        const checkDuration = Date.now() - checkStartTime;
        const tokenAge = Date.now() - authData.timestamp;
        console.log('[Dashboard] Token expired, clearing storage and redirecting', {
          timestamp: new Date().toISOString(),
          expiresAt: new Date(authData.expiresAt).toISOString(),
          now: new Date().toISOString(),
          tokenAge: `${tokenAge}ms`,
          reason: 'token_expired',
          checkDuration: `${checkDuration}ms`,
          redirectTo: '/admin/login'
        });
        authStorage.clearAuthData();
        router.push('/admin/login');
        return;
      }

      const checkDuration = Date.now() - checkStartTime;
      const tokenAge = Date.now() - authData.timestamp;
      
      // Requirement 4.5: Log authentication verification result
      console.log('[Dashboard] Authentication verified successfully', {
        username: authData.user.username,
        userId: authData.user.id,
        userRole: authData.user.role,
        tokenAge: `${tokenAge}ms`,
        tokenAgeMinutes: Math.floor(tokenAge / 60000),
        checkDuration: `${checkDuration}ms`,
        authState: 'verified',
        timestamp: new Date().toISOString()
      });

      try {
        setAdminUser(authData.user);
        const loadStartTime = Date.now();
        await loadDashboardData();
        const loadDuration = Date.now() - loadStartTime;
        
        console.log('[Dashboard] Dashboard loaded successfully', {
          timestamp: new Date().toISOString(),
          productsCount: products.length,
          ordersCount: orders.length,
          loadDuration: `${loadDuration}ms`,
          totalDuration: `${Date.now() - checkStartTime}ms`
        });
      } catch (err) {
        // Requirement 4.4: Log errors with error type, message, and stack trace
        console.error('[Dashboard] Error loading dashboard data:', {
          error: err instanceof Error ? err.message : 'Unknown error',
          errorType: err instanceof Error ? err.constructor.name : 'Unknown',
          stack: err instanceof Error ? err.stack : undefined,
          username: authData.user.username,
          timestamp: new Date().toISOString()
        });
        // Don't redirect on data loading errors, just show empty state
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoadData();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      let productsData: Product[] = [];
      let ordersData: Order[] = [];

      // Load products using admin endpoint
      try {
        const token = authStorage.getToken();
        const productsResponse = await fetch('/api/admin/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (productsResponse.ok) {
          const data = await productsResponse.json();
          productsData = data.data?.products || data.products || [];
          setProducts(productsData);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (productError) {
        console.error('Error loading products:', productError);
        setProducts([]);
        productsData = [];
      }

      // Load orders using admin endpoint
      try {
        const token = authStorage.getToken();
        const ordersResponse = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (ordersResponse.ok) {
          const data = await ordersResponse.json();
          ordersData = data.data?.orders || data.orders || [];
          setOrders(ordersData);
          setRecentOrders(ordersData.slice(0, 4));
        } else {
          throw new Error('Failed to fetch orders');
        }
      } catch (orderError) {
        console.error('Error loading orders:', orderError);
        // Set empty arrays if API fails
        setOrders([]);
        setRecentOrders([]);
        ordersData = [];
      }

      // Calculate stats
      const totalProducts = productsData.length;
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum: number, order: Order) => sum + order.total, 0);
      const pendingOrders = ordersData.filter((order: Order) => order.status === 'pending').length;
      const lowStockProducts = productsData.filter((product: Product) => product.stock < 5).length;

      setStats({
        totalProducts,
        totalOrders,
        totalRevenue,
        activeUsers: 0, // This would come from user analytics
        pendingOrders,
        lowStockProducts
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default stats if everything fails
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeUsers: 0,
        pendingOrders: 0,
        lowStockProducts: 0
      });
    }
  };

  const validateOrder = async (orderId: string, customerEmail: string) => {
    try {
      const token = authStorage.getToken();
      // Mettre à jour le statut vers "processing"
      const updateResponse = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'processing' })
      });
      
      if (updateResponse.ok) {
        const data = await updateResponse.json();
        if (data.success) {
          // Envoyer l'email de confirmation
          await sendOrderConfirmationEmail(customerEmail, orderId);
          
          // Recharger les données pour refléter les changements
          await loadDashboardData();
          
          showSuccess(`✅ Commande validée et email envoyé à ${customerEmail}`);
        }
      } else {
        throw new Error('Failed to validate order');
      }
    } catch (error) {
      console.error('Error validating order:', error);
      showError('Erreur lors de la validation de la commande');
    }
  };

  const sendOrderConfirmationEmail = async (customerEmail: string, orderId: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      const customerName = order?.customerName || 'Client';
      
      // L'email de validation est envoyé automatiquement par le backend
      // lors de la mise à jour du statut vers "processing"
      console.log(`✅ Validation email will be sent automatically by backend to ${customerEmail} for order ${orderId} (customer: ${customerName})`);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      // Email sending is handled by backend, no need to simulate
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = authStorage.getToken();
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Recharger les données pour refléter les changements
          await loadDashboardData();
          showSuccess(`✅ Commande mise à jour vers "${getStatusText(newStatus)}"`);
        }
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showError('Erreur lors de la mise à jour du statut de la commande');
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const token = authStorage.getToken();
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Recharger les données pour refléter les changements
          await loadDashboardData();
          showSuccess('✅ Commande supprimée avec succès');
        }
      } else {
        throw new Error('Failed to delete order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      showError('Erreur lors de la suppression de la commande');
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return statusTexts[status as keyof typeof statusTexts] || status;
  };



  // Filtrage simple des commandes
  React.useEffect(() => {
    let filtered = [...orders];

    // Filtrage par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerEmail.toLowerCase().includes(searchLower)
      );
    }

    // Filtrage par statut
    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Tri par date (plus récentes en premier)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);



  const handleLogout = () => {
    const authData = authStorage.getAuthData();
    const sessionDuration = authData ? Date.now() - authData.timestamp : 0;
    
    console.log('[Dashboard] Logging out user', {
      username: authData?.user?.username || 'unknown',
      sessionDuration: `${sessionDuration}ms`,
      sessionDurationMinutes: Math.floor(sessionDuration / 60000),
      timestamp: new Date().toISOString()
    });
    
    authStorage.clearAuthData();
    router.push('/admin/login');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Inventory management functions
  const openInventoryModal = (product: Product) => {
    setSelectedProduct(product);
    setNewStockValue(product.stock);
    setInventoryModalOpen(true);
  };

  const closeInventoryModal = () => {
    setInventoryModalOpen(false);
    setSelectedProduct(null);
    setNewStockValue(0);
  };

  const adjustStock = (amount: number) => {
    setNewStockValue(Math.max(0, newStockValue + amount));
  };

  const updateProductStock = async () => {
    if (!selectedProduct) return;

    try {
      const token = authStorage.getToken();
      const response = await fetch(`/api/admin/products/${selectedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...selectedProduct,
          stock: newStockValue
        })
      });

      if (response.ok) {
        showSuccess(`✅ Stock mis à jour: ${selectedProduct.name} → ${newStockValue} unités`);
        await loadDashboardData();
        closeInventoryModal();
      } else {
        throw new Error('Failed to update stock');
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      showError('❌ Erreur lors de la mise à jour du stock');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4 animate-spin-slow"></div>
          <div className="text-white text-lg font-semibold animate-pulse">Chargement du Super Admin...</div>
        </div>
      </div>
    );
  }





  const quickStats = [
    { 
      title: 'Produits Total', 
      value: stats.totalProducts, 
      icon: '📦', 
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Commandes', 
      value: stats.totalOrders, 
      icon: '🛒', 
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Revenus', 
      value: formatPrice(stats.totalRevenue), 
      icon: '💰', 
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      title: 'Stock Faible', 
      value: stats.lowStockProducts, 
      icon: '⚠️', 
      color: 'from-red-500 to-red-600'
    },
  ];

  const alerts = [
    { type: 'warning', message: `${stats.pendingOrders} commandes en attente`, icon: '⚠️' },
    { type: 'error', message: `${stats.lowStockProducts} produits en rupture de stock`, icon: '🚨' },
    { type: 'info', message: 'Mise à jour système disponible', icon: 'ℹ️' },
  ];

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return a.price - b.price;
      case 'stock':
        return a.stock - b.stock;
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={adminUser}
        onLogout={handleLogout}
        stats={stats}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-80'} ml-0`}>
        {/* Header */}
        <AdminHeader
          activeTab={activeTab}
          sidebarCollapsed={sidebarCollapsed}
          stats={stats}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Dashboard Content */}
        <main className="mobile-px mobile-py p-4 md:p-6 lg:p-8 animate-fade-in-up">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Section */}
              <div className="gradient-overlay bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-responsive-2xl text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Bienvenue, {adminUser?.username} 👋
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Voici un aperçu de votre boutique aujourd'hui
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-mobile-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickStats.map((stat, index) => (
                  <div key={index} className={`animate-fade-in-up delay-${(index + 1) * 100}`}>
                    <StatsCard
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      color={stat.color}
                      onClick={() => {
                        if (stat.title.includes('Produits')) setActiveTab('products');
                        else if (stat.title.includes('Commandes')) setActiveTab('orders');
                        else if (stat.title.includes('Stock')) setActiveTab('inventory');
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Charts and Analytics */}
              <DashboardCharts
                revenueData={[125000, 89000, 156000, 98000, 178000, 134000, 189000]}
                categoryData={[
                  { label: 'Vêtements Traditionnels', value: products.filter(p => p.category === 'Vêtements Traditionnels').length, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
                  { label: 'Chemises', value: products.filter(p => p.category === 'Chemises').length, color: 'bg-gradient-to-r from-green-500 to-green-600' },
                  { label: 'Robes', value: products.filter(p => p.category === 'Robes').length, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
                  { label: 'Accessoires', value: products.filter(p => p.category === 'Accessoires').length, color: 'bg-gradient-to-r from-orange-500 to-orange-600' },
                ].filter(item => item.value > 0)}
                orderStatusData={[
                  { label: 'En attente', value: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
                  { label: 'En cours', value: orders.filter(o => o.status === 'processing').length, color: 'bg-blue-500' },
                  { label: 'Expédiées', value: orders.filter(o => o.status === 'shipped').length, color: 'bg-purple-500' },
                  { label: 'Livrées', value: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-500' },
                ].filter(item => item.value > 0)}
              />

              {/* Recent Orders */}
              <div className="section-gradient-overlay bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🛒</span>
                    Commandes récentes
                  </h3>
                  {recentOrders.length > 0 && (
                    <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-medium">
                      {recentOrders.length}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer animate-fade-in-up delay-${(index + 1) * 100}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          #{order.id.slice(-2)}
                        </div>
                        <div>
                          <p className="text-slate-900 dark:text-white font-medium">
                            {order.customerName}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">{order.customerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-slate-900 dark:text-white font-bold">{formatPrice(order.total)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : order.status === 'processing'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {order.status === 'delivered' ? 'Livré' : 
                           order.status === 'processing' ? 'En cours' : 
                           order.status === 'pending' ? 'En attente' : order.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                      <span className="text-4xl mb-3 block">📦</span>
                      <p className="font-medium mb-1">Aucune commande récente</p>
                      <p className="text-sm">Les nouvelles commandes apparaîtront ici</p>
                    </div>
                  )}
                </div>
                
                {recentOrders.length > 0 && (
                  <div className="mt-6 text-center">
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Voir toutes les commandes →
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="gradient-overlay-radial bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <span>⚡</span>
                  Actions rapides
                </h3>
                <div className="grid grid-mobile-2 grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="p-4 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-xl text-white font-semibold transition-all hover:scale-105"
                  >
                    <div className="text-2xl mb-2">📦</div>
                    <div className="text-sm">Produits</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-semibold transition-all hover:scale-105"
                  >
                    <div className="text-2xl mb-2">🛒</div>
                    <div className="text-sm">Commandes</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl text-white font-semibold transition-all hover:scale-105"
                  >
                    <div className="text-2xl mb-2">📋</div>
                    <div className="text-sm">Inventaire</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 rounded-xl text-white font-semibold transition-all hover:scale-105"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-sm">Clients</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          {activeTab === 'products' && (
            <div className="space-y-4 md:space-y-6 animate-fade-in-up">
              {/* Header with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
                <div>
                  <h3 className="text-white text-responsive-2xl text-xl md:text-2xl font-black">Gestion des Produits</h3>
                  <p className="text-white/60 text-sm md:text-base">Gérez votre catalogue de {products.length} produits</p>
                </div>
                <button 
                  onClick={() => router.push('/admin/products/add')}
                  className="touch-target px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-sm md:text-base"
                >
                  <span>➕</span>
                  <span className="hidden sm:inline">Ajouter un produit</span>
                  <span className="sm:hidden">Ajouter</span>
                </button>
              </div>

              {/* Filters and Search */}
              <div className="gradient-overlay bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6">
                <div className="grid grid-mobile-1 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="sm:col-span-2 lg:col-span-2">
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:border-accent focus:outline-none text-sm md:text-base"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 md:px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-accent focus:ring-4 focus:ring-accent/20 focus:outline-none transition-all duration-300 text-sm md:text-base min-h-[48px]"
                  >
                    <option value="" className="bg-gray-800">Toutes les catégories</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-800">{category}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 md:px-4 py-2 md:py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-accent focus:ring-4 focus:ring-accent/20 focus:outline-none transition-all duration-300 text-sm md:text-base min-h-[48px]"
                  >
                    <option value="name" className="bg-gray-800">Trier par nom</option>
                    <option value="price" className="bg-gray-800">Trier par prix</option>
                    <option value="stock" className="bg-gray-800">Trier par stock</option>
                    <option value="category" className="bg-gray-800">Trier par catégorie</option>
                  </select>
                </div>
              </div>
              
              {/* Products Grid */}
              <div className="grid grid-mobile-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.length > 0 ? filteredProducts.map((product, index) => (
                  <div key={product.id} className={`animate-fade-in-up delay-${Math.min((index % 8 + 1) * 100, 800)}`}>
                    <ProductCard
                      product={product}
                      onUpdate={loadDashboardData}
                    />
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12 text-white/60">
                    <span className="text-6xl mb-4 block">📦</span>
                    <p className="text-xl font-semibold mb-2">
                      {searchTerm || filterCategory ? 'Aucun produit trouvé' : 'Aucun produit'}
                    </p>
                    <p>
                      {searchTerm || filterCategory 
                        ? 'Essayez de modifier vos filtres de recherche'
                        : 'Commencez par ajouter votre premier produit'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Section */}
          {activeTab === 'orders' && (
            <div className="space-y-4 md:space-y-6 animate-fade-in-up">
              {/* Header avec statistiques rapides */}
              <div className="flex flex-col gap-4 animate-fade-in-down">
                <div className="glass-apple-strong rounded-3xl p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-white text-2xl md:text-3xl font-black flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                          <span className="text-3xl">🛒</span>
                        </div>
                        <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Gestion des Commandes</span>
                      </h3>
                      <p className="text-slate-300 text-sm md:text-base ml-17">
                        Suivez et gérez <span className="text-purple-400 font-bold">{orders.length}</span> commandes en temps réel
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button className="px-4 md:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-green-500/50">
                        <span>➕</span>
                        <span className="hidden sm:inline">Nouvelle commande</span>
                        <span className="sm:hidden">Nouvelle</span>
                      </button>
                      <button className="px-4 md:px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-xl active:scale-95 transition-all duration-300 font-semibold text-sm md:text-base flex items-center justify-center gap-2">
                        <span>📊</span>
                        <span className="hidden sm:inline">Exporter</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Statistiques avancées des commandes */}
                <OrderStats orders={orders} />
              </div>

              {/* Filtres améliorés */}
              <div className="glass-apple rounded-2xl p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h4 className="text-white font-bold text-lg">Filtres & Recherche</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="Rechercher par nom, email ou numéro de commande..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 pl-12 input-glass rounded-xl text-white placeholder-slate-400 text-sm md:text-base"
                      />
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors text-xl">🔍</span>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors text-lg font-bold"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-white/10 border border-white/20 rounded-xl text-white text-sm md:text-base appearance-none cursor-pointer focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 min-h-[48px]"
                      style={{ color: 'white' }}
                    >
                      <option value="" style={{ backgroundColor: '#334155', color: 'white' }}>Tous les statuts</option>
                      <option value="pending" style={{ backgroundColor: '#334155', color: 'white' }}>⏳ En attente</option>
                      <option value="processing" style={{ backgroundColor: '#334155', color: 'white' }}>⚙️ En cours</option>
                      <option value="shipped" style={{ backgroundColor: '#334155', color: 'white' }}>🚚 Expédiée</option>
                      <option value="delivered" style={{ backgroundColor: '#334155', color: 'white' }}>✅ Livrée</option>
                      <option value="cancelled" style={{ backgroundColor: '#334155', color: 'white' }}>❌ Annulée</option>
                    </select>
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">📋</span>
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">▼</span>
                  </div>
                </div>
                {(searchTerm || statusFilter) && (
                  <div className="mt-4 pt-4 border-t border-slate-600 flex items-center justify-between">
                    <p className="text-slate-300 text-sm">
                      <span className="text-blue-400 font-bold">{filteredOrders.length}</span> résultat(s) trouvé(s)
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('');
                      }}
                      className="text-sm text-slate-400 hover:text-white transition-colors underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                )}
              </div>
              
              {/* Liste des commandes */}
              <div className="space-y-4 stagger-animation">
                {filteredOrders.length > 0 ? filteredOrders.map((order, index) => (
                  <div key={order.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <OrderCard
                      order={order}
                      onValidateOrder={validateOrder}
                      onUpdateStatus={updateOrderStatus}
                      onDeleteOrder={deleteOrder}
                    />
                  </div>
                )) : (
                  <div className="glass-card border border-white/10 rounded-3xl p-12 text-center morph-button">
                    <div className="text-6xl mb-6">🛒</div>
                    <h4 className="text-white text-xl font-bold mb-3">Aucune commande trouvée</h4>
                    <p className="text-white/60 mb-6">Les commandes apparaîtront ici une fois que les clients commenceront à passer des commandes</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button className="px-6 py-3 bg-gradient-to-r from-accent to-green-500 text-black font-bold rounded-xl hover:scale-105 transition-all duration-300">
                        ➕ Créer une commande test
                      </button>
                      <button 
                        onClick={() => setActiveTab('products')}
                        className="px-6 py-3 glass-secondary text-white font-semibold rounded-xl hover:bg-white/20 transition-colors"
                      >
                        📦 Gérer les produits
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pagination améliorée */}
              {filteredOrders.length > 0 && (
                <div className="glass-apple rounded-2xl p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-slate-300 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                      Affichage de <span className="text-white font-bold">1</span> à <span className="text-white font-bold">{Math.min(10, filteredOrders.length)}</span> sur <span className="text-purple-400 font-bold">{filteredOrders.length}</span> commandes
                      {filteredOrders.length !== orders.length && (
                        <span className="text-purple-400 ml-2 bg-purple-500/20 px-3 py-1 rounded-lg border border-purple-500/30">
                          (filtrées sur {orders.length} total)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-4 py-2 bg-slate-700 text-slate-400 rounded-xl hover:bg-slate-600 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold" disabled>
                        ← Précédent
                      </button>
                      <div className="flex gap-2">
                        <button className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/50 hover:scale-110 transition-transform">1</button>
                        <button className="w-10 h-10 bg-slate-700 text-white rounded-xl hover:bg-slate-600 hover:scale-105 transition-all font-semibold">2</button>
                        <button className="w-10 h-10 bg-slate-700 text-white rounded-xl hover:bg-slate-600 hover:scale-105 transition-all font-semibold">3</button>
                      </div>
                      <button className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 active:scale-95 transition-all duration-300 font-semibold">
                        Suivant →
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Product Section */}
          {activeTab === 'add-product' && (
            <AddProductForm
              onProductCreated={() => {
                loadDashboardData();
                setActiveTab('products');
                showSuccess('Produit créé avec succès!');
              }}
              onCancel={() => setActiveTab('products')}
            />
          )}

          {/* Inventory Section */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 md:space-y-6 animate-fade-in-up">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-down">
                <div>
                  <h3 className="text-white text-xl md:text-2xl font-black">Gestion de l'Inventaire</h3>
                  <p className="text-white/60 text-sm md:text-base">Contrôlez les stocks et approvisionnements</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button className="px-3 md:px-4 py-2 bg-orange-500/20 text-orange-400 rounded-xl hover:bg-orange-500/30 transition-colors font-semibold text-sm md:text-base">
                    📦 <span className="hidden sm:inline">Réapprovisionner</span>
                  </button>
                  <button className="px-3 md:px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors font-semibold text-sm md:text-base">
                    📊 <span className="hidden sm:inline">Rapport Stock</span>
                  </button>
                </div>
              </div>

              {/* Stock Alerts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <p className="text-red-400 font-semibold">Rupture de stock</p>
                      <p className="text-red-300 text-sm">{products.filter(p => p.stock === 0).length} produits</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-yellow-400 font-semibold">Stock faible</p>
                      <p className="text-yellow-300 text-sm">{products.filter(p => p.stock > 0 && p.stock < 5).length} produits</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-green-400 font-semibold">Stock suffisant</p>
                      <p className="text-green-300 text-sm">{products.filter(p => p.stock >= 5).length} produits</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 md:py-3 px-2 md:px-4 text-white font-semibold text-sm md:text-base">Produit</th>
                          <th className="text-left py-2 md:py-3 px-2 md:px-4 text-white font-semibold text-sm md:text-base hidden sm:table-cell">Catégorie</th>
                          <th className="text-left py-2 md:py-3 px-2 md:px-4 text-white font-semibold text-sm md:text-base">Stock</th>
                          <th className="text-left py-2 md:py-3 px-2 md:px-4 text-white font-semibold text-sm md:text-base">Statut</th>
                          <th className="text-left py-2 md:py-3 px-2 md:px-4 text-white font-semibold text-sm md:text-base">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => {
                          const stockStatus = product.stock === 0 ? 'danger' : product.stock < 5 ? 'warning' : 'success';
                          return (
                            <tr key={product.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-3 md:py-4 px-2 md:px-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs md:text-sm">📦</span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-white font-medium text-sm md:text-base truncate">{product.name}</p>
                                    <p className="text-white/60 text-xs md:text-sm">{formatPrice(product.price)}</p>
                                    <p className="text-white/60 text-xs sm:hidden">{product.category}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4 text-white/70 text-sm md:text-base hidden sm:table-cell">{product.category}</td>
                              <td className="py-3 md:py-4 px-2 md:px-4">
                                <span className="text-white font-bold text-base md:text-lg">{product.stock}</span>
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4">
                                <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                                  stockStatus === 'danger' ? 'bg-red-500/20 text-red-400' :
                                  stockStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {stockStatus === 'danger' ? 'Rupture' :
                                   stockStatus === 'warning' ? 'Faible' : 'OK'}
                                </span>
                              </td>
                              <td className="py-3 md:py-4 px-2 md:px-4">
                                <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                                  <button 
                                    onClick={() => openInventoryModal(product)}
                                    className="px-2 md:px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-xs md:text-sm font-semibold"
                                  >
                                    📝 <span className="hidden md:inline">Ajuster</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content placeholder */}
          {/* Customers Section */}
          {activeTab === 'customers' && (
            <div className="space-y-4 md:space-y-6 animate-fade-in-up">
              <div className="glass-apple-strong rounded-3xl p-6 md:p-8 animate-fade-in-down">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white text-2xl md:text-3xl font-black flex items-center gap-3 mb-2">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <span className="text-3xl">👥</span>
                      </div>
                      <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Base Clients</span>
                    </h3>
                    <p className="text-slate-300 text-sm md:text-base ml-17">
                      {(() => {
                        const uniqueCustomers = new Set(orders.map(o => o.customerEmail || o.customerName));
                        return (
                          <>
                            Gérez vos <span className="text-blue-400 font-bold">{uniqueCustomers.size}</span> clients uniques
                          </>
                        );
                      })()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button className="px-4 md:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-500/50">
                      <span>📧</span>
                      <span className="hidden sm:inline">Envoyer un email</span>
                      <span className="sm:hidden">Email</span>
                    </button>
                    <button className="px-4 md:px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 rounded-xl active:scale-95 transition-all duration-300 font-semibold text-sm md:text-base flex items-center justify-center gap-2">
                      <span>📊</span>
                      <span className="hidden sm:inline">Exporter</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer Stats améliorées */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass-apple p-5 rounded-2xl transition-all duration-300 group card-hover">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">👥</span>
                    </div>
                    <div className="px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-500/30">
                      <span className="text-blue-400 text-xs font-bold">+12%</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Total Clients</p>
                  <p className="text-white font-black text-3xl">
                    {(() => {
                      const uniqueCustomers = new Set(orders.map(o => o.customerEmail || o.customerName));
                      return uniqueCustomers.size;
                    })()}
                  </p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-purple-500/30 hover:border-purple-500 transition-all duration-300 group shadow-lg hover:shadow-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">🛒</span>
                    </div>
                    <div className="px-3 py-1 bg-purple-500/20 rounded-lg border border-purple-500/30">
                      <span className="text-purple-400 text-xs font-bold">+8%</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Commandes Moy.</p>
                  <p className="text-white font-black text-3xl">
                    {orders.length > 0 ? (orders.length / new Set(orders.map(o => o.customerEmail || o.customerName)).size).toFixed(1) : '0'}
                  </p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-green-500/30 hover:border-green-500 transition-all duration-300 group shadow-lg hover:shadow-green-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">💰</span>
                    </div>
                    <div className="px-3 py-1 bg-green-500/20 rounded-lg border border-green-500/30">
                      <span className="text-green-400 text-xs font-bold">+15%</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Panier Moyen</p>
                  <p className="text-white font-black text-3xl">
                    {formatPrice(orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0)}
                  </p>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-yellow-500/30 hover:border-yellow-500 transition-all duration-300 group shadow-lg hover:shadow-yellow-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">⭐</span>
                    </div>
                    <div className="px-3 py-1 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                      <span className="text-yellow-400 text-xs font-bold">VIP</span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">Clients Fidèles</p>
                  <p className="text-white font-black text-3xl">
                    {(() => {
                      const customerOrders = orders.reduce((acc: any, order) => {
                        const key = order.customerEmail || order.customerName;
                        acc[key] = (acc[key] || 0) + 1;
                        return acc;
                      }, {});
                      return Object.values(customerOrders).filter((count: any) => count > 1).length;
                    })()}
                  </p>
                </div>
              </div>

              {/* Customers List améliorée */}
              <div className="glass-apple-strong rounded-3xl overflow-hidden">
                <div className="p-4 md:p-6 border-b border-slate-700 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <span className="text-2xl">📋</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">Liste des Clients</h4>
                        <p className="text-slate-400 text-sm">Triés par activité récente</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-all text-sm font-semibold border border-slate-600">
                      Trier ⇅
                    </button>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Client</th>
                          <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Contact</th>
                          <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Commandes</th>
                          <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Total Dépensé</th>
                          <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Statut</th>
                          <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const customerData = orders.reduce((acc: any, order) => {
                            const key = order.customerEmail || order.customerName;
                            if (!acc[key]) {
                              acc[key] = {
                                name: order.customerName,
                                email: order.customerEmail,
                                phone: order.customerPhone || 'N/A',
                                orders: 0,
                                total: 0
                              };
                            }
                            acc[key].orders += 1;
                            acc[key].total += order.total;
                            return acc;
                          }, {});
                          
                          return Object.values(customerData).map((customer: any, index) => (
                            <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors group">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                    <span className="text-white font-bold text-lg">{customer.name.charAt(0)}</span>
                                  </div>
                                  <div>
                                    <p className="text-white font-semibold">{customer.name}</p>
                                    <p className="text-slate-500 text-xs">Client #{index + 1}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">📧</span>
                                    <p className="text-slate-300 text-sm">{customer.email || 'N/A'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-500">📱</span>
                                    <p className="text-slate-500 text-xs">{customer.phone}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                                    <span className="text-blue-400 font-bold text-sm">{customer.orders}</span>
                                  </div>
                                  <span className="text-slate-400 text-xs">commandes</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex flex-col">
                                  <span className="text-green-400 font-bold text-lg">{formatPrice(customer.total)}</span>
                                  <span className="text-slate-500 text-xs">
                                    Moy: {formatPrice(customer.total / customer.orders)}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 w-fit ${
                                  customer.orders > 3 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' :
                                  customer.orders > 1 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                                  'bg-slate-600 text-slate-300 border border-slate-500'
                                }`}>
                                  <span className="text-base">
                                    {customer.orders > 3 ? '⭐' :
                                     customer.orders > 1 ? '💎' : '🆕'}
                                  </span>
                                  {customer.orders > 3 ? 'VIP' :
                                   customer.orders > 1 ? 'Fidèle' : 'Nouveau'}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <button className="w-9 h-9 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all hover:scale-110" title="Voir détails">
                                    👁️
                                  </button>
                                  <button className="w-9 h-9 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-all hover:scale-110" title="Envoyer email">
                                    📧
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Top Products */}
              <div className="glass-primary rounded-3xl p-4 md:p-6">
                <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <span>🏆</span>
                  Top 5 Produits les Plus Vendus
                </h4>
                <div className="space-y-3">
                  {products.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-accent to-green-500 rounded-full font-bold text-black">
                        {index + 1}
                      </div>
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                          <span>📦</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{product.name}</p>
                        <p className="text-white/60 text-sm">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-accent font-bold">{formatPrice(product.price)}</p>
                        <p className="text-white/60 text-sm">{product.stock} en stock</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marketing Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Low Stock Alert */}
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <h5 className="text-white font-bold">Opportunité de Réapprovisionnement</h5>
                      <p className="text-white/60 text-sm">Produits à promouvoir avant rupture</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {products.filter(p => p.stock > 0 && p.stock < 10).slice(0, 3).map(product => (
                      <div key={product.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-white text-sm truncate flex-1">{product.name}</span>
                        <span className="text-yellow-400 text-sm font-bold ml-2">{product.stock} restants</span>
                      </div>
                    ))}
                    {products.filter(p => p.stock > 0 && p.stock < 10).length === 0 && (
                      <p className="text-white/60 text-sm">Aucun produit en stock faible</p>
                    )}
                  </div>
                </div>

                {/* Category Performance */}
                <div className="glass-card p-6 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">📊</span>
                    <div>
                      <h5 className="text-white font-bold">Performance par Catégorie</h5>
                      <p className="text-white/60 text-sm">Distribution des produits</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      const categoryCount = products.reduce((acc: any, product) => {
                        acc[product.category] = (acc[product.category] || 0) + 1;
                        return acc;
                      }, {});
                      
                      return Object.entries(categoryCount).slice(0, 4).map(([category, count]: [string, any]) => (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">{category}</span>
                            <span className="text-accent font-bold">{count}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-accent to-green-500 h-2 rounded-full"
                              style={{ width: `${(count / products.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>



      {/* Inventory Modal */}
      {inventoryModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full border border-white/20 shadow-2xl my-auto animate-bounce-in">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-white text-lg sm:text-xl md:text-2xl font-black">Ajuster le Stock</h3>
              <button
                onClick={closeInventoryModal}
                className="text-white/60 hover:text-white transition-all duration-300 p-2 hover:bg-white/10 rounded-lg hover:scale-110 active:scale-95"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Product Info */}
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl sm:text-2xl">📦</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-base sm:text-lg truncate">{selectedProduct.name}</p>
                    <p className="text-white/60 text-xs sm:text-sm truncate">{selectedProduct.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                  <span className="text-white/60 text-sm sm:text-base">Stock actuel:</span>
                  <span className="text-white font-bold text-base sm:text-lg">{selectedProduct.stock} unités</span>
                </div>
              </div>

              {/* Stock Adjustment */}
              <div>
                <label className="block text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">Nouveau stock</label>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => adjustStock(-10)}
                    className="px-2 sm:px-3 py-2 sm:py-3 bg-red-500/20 text-red-400 rounded-lg sm:rounded-xl hover:bg-red-500/30 active:scale-95 transition-all font-bold text-sm sm:text-base flex-shrink-0"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => adjustStock(-1)}
                    className="px-2 sm:px-3 py-2 sm:py-3 bg-red-500/20 text-red-400 rounded-lg sm:rounded-xl hover:bg-red-500/30 active:scale-95 transition-all font-bold text-sm sm:text-base flex-shrink-0"
                  >
                    -1
                  </button>
                  <input
                    type="number"
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                    className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 bg-white/10 text-white text-center text-lg sm:text-xl font-bold rounded-lg sm:rounded-xl border border-white/20 focus:border-accent focus:outline-none"
                    min="0"
                  />
                  <button
                    onClick={() => adjustStock(1)}
                    className="px-2 sm:px-3 py-2 sm:py-3 bg-green-500/20 text-green-400 rounded-lg sm:rounded-xl hover:bg-green-500/30 active:scale-95 transition-all font-bold text-sm sm:text-base flex-shrink-0"
                  >
                    +1
                  </button>
                  <button
                    onClick={() => adjustStock(10)}
                    className="px-2 sm:px-3 py-2 sm:py-3 bg-green-500/20 text-green-400 rounded-lg sm:rounded-xl hover:bg-green-500/30 active:scale-95 transition-all font-bold text-sm sm:text-base flex-shrink-0"
                  >
                    +10
                  </button>
                </div>
              </div>

              {/* Stock Status Preview */}
              <div className="bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm sm:text-base">Statut:</span>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold ${
                    newStockValue === 0 ? 'bg-red-500/20 text-red-400' :
                    newStockValue < 5 ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {newStockValue === 0 ? '🚨 Rupture' :
                     newStockValue < 5 ? '⚠️ Faible' : '✅ Suffisant'}
                  </span>
                </div>
                {newStockValue !== selectedProduct.stock && (
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                    <p className="text-white/60 text-xs sm:text-sm">
                      Changement: 
                      <span className={`ml-2 font-bold ${
                        newStockValue > selectedProduct.stock ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {newStockValue > selectedProduct.stock ? '+' : ''}
                        {newStockValue - selectedProduct.stock} unités
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={closeInventoryModal}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/10 text-white rounded-lg sm:rounded-xl hover:bg-white/20 active:scale-95 transition-all font-semibold text-sm sm:text-base"
                >
                  Annuler
                </button>
                <button
                  onClick={updateProductStock}
                  disabled={newStockValue === selectedProduct.stock}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-accent to-green-500 text-white rounded-lg sm:rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Toast Manager */}
      <ToastManager toasts={toasts} removeToast={removeToast} />
    </div>
  );
}