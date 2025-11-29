'use client';

import { useMemo } from 'react';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
  }>;
}

interface OrderStatsProps {
  orders: Order[];
}

export default function OrderStats({ orders }: OrderStatsProps) {
  const stats = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const todayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === today.toDateString()
    );
    
    const yesterdayOrders = orders.filter(order => 
      new Date(order.createdAt).toDateString() === yesterday.toDateString()
    );

    const weekOrders = orders.filter(order => 
      new Date(order.createdAt) >= lastWeek
    );

    const monthOrders = orders.filter(order => 
      new Date(order.createdAt) >= lastMonth
    );

    const pendingOrders = orders.filter(order => order.status === 'pending');
    const processingOrders = orders.filter(order => order.status === 'processing');
    const shippedOrders = orders.filter(order => order.status === 'shipped');
    const deliveredOrders = orders.filter(order => order.status === 'delivered');

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    const topCustomers = orders.reduce((acc, order) => {
      const existing = acc.find(c => c.email === order.customerEmail);
      if (existing) {
        existing.orders += 1;
        existing.total += order.total;
      } else {
        acc.push({
          name: order.customerName,
          email: order.customerEmail,
          orders: 1,
          total: order.total
        });
      }
      return acc;
    }, [] as Array<{name: string, email: string, orders: number, total: number}>)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

    return {
      todayOrders: todayOrders.length,
      yesterdayOrders: yesterdayOrders.length,
      weekOrders: weekOrders.length,
      monthOrders: monthOrders.length,
      pendingOrders: pendingOrders.length,
      processingOrders: processingOrders.length,
      shippedOrders: shippedOrders.length,
      deliveredOrders: deliveredOrders.length,
      totalRevenue,
      averageOrderValue,
      topCustomers,
      todayRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
      weekRevenue: weekOrders.reduce((sum, order) => sum + order.total, 0),
      monthRevenue: monthOrders.reduce((sum, order) => sum + order.total, 0),
    };
  }, [orders]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getGrowthPercentage = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const todayGrowth = getGrowthPercentage(stats.todayOrders, stats.yesterdayOrders);

  return (
    <div className="space-y-6">
      {/* Statistiques principales - Design amélioré */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-apple p-5 rounded-2xl transition-all group card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📅</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg font-bold text-xs border ${
              todayGrowth >= 0 ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {todayGrowth >= 0 ? '↗️' : '↘️'} {Math.abs(todayGrowth)}%
            </div>
          </div>
          <div>
            <p className="text-blue-400 font-black text-3xl mb-1">{stats.todayOrders}</p>
            <p className="text-slate-300 text-sm font-semibold mb-2">Commandes aujourd'hui</p>
            <p className="text-slate-400 text-xs bg-slate-700/50 px-2 py-1 rounded-lg inline-block">{formatPrice(stats.todayRevenue)}</p>
          </div>
        </div>

        <div className="glass-apple p-5 rounded-2xl transition-all group card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50 group-hover:scale-110 transition-transform">
              <span className="text-3xl">📊</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg font-bold text-xs bg-green-500/20 text-green-400 border border-green-500/30">
              ↗️ +12%
            </div>
          </div>
          <div>
            <p className="text-green-400 font-black text-3xl mb-1">{stats.weekOrders}</p>
            <p className="text-slate-300 text-sm font-semibold mb-2">Cette semaine</p>
            <p className="text-slate-400 text-xs bg-slate-700/50 px-2 py-1 rounded-lg inline-block">{formatPrice(stats.weekRevenue)}</p>
          </div>
        </div>

        <div className="glass-apple p-5 rounded-2xl transition-all group card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50 group-hover:scale-110 transition-transform">
              <span className="text-3xl">💰</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg font-bold text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30">
              💎 VIP
            </div>
          </div>
          <div>
            <p className="text-purple-400 font-black text-3xl mb-1">{formatPrice(stats.averageOrderValue)}</p>
            <p className="text-slate-300 text-sm font-semibold mb-2">Panier moyen</p>
            <p className="text-slate-400 text-xs bg-slate-700/50 px-2 py-1 rounded-lg inline-block">Sur {orders.length} commandes</p>
          </div>
        </div>

        <div className="glass-apple p-5 rounded-2xl transition-all group card-hover">
          <div className="flex items-center justify-between mb-3">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/50 group-hover:scale-110 transition-transform">
              <span className="text-3xl">⚡</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg font-bold text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30">
              🔥 HOT
            </div>
          </div>
          <div>
            <p className="text-orange-400 font-black text-3xl mb-1">{stats.pendingOrders}</p>
            <p className="text-slate-300 text-sm font-semibold mb-2">À traiter</p>
            <p className="text-slate-400 text-xs bg-slate-700/50 px-2 py-1 rounded-lg inline-block">Action requise</p>
          </div>
        </div>
      </div>

      {/* Graphique de progression des statuts - Design amélioré */}
      <div className="glass-apple-strong p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
            <span className="text-2xl">📈</span>
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">Progression des commandes</h4>
            <p className="text-slate-400 text-sm">Répartition par statut</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 frosted-glass rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center border border-yellow-500/30">
                  <span className="text-xl">⏳</span>
                </div>
                <span className="text-white font-semibold">En attente</span>
              </div>
              <span className="text-yellow-400 font-bold text-xl">{stats.pendingOrders}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-yellow-500/50"
                style={{ width: `${orders.length > 0 ? (stats.pendingOrders / orders.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 frosted-glass rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                  <span className="text-xl">⚙️</span>
                </div>
                <span className="text-white font-semibold">En cours</span>
              </div>
              <span className="text-blue-400 font-bold text-xl">{stats.processingOrders}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/50"
                style={{ width: `${orders.length > 0 ? (stats.processingOrders / orders.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 frosted-glass rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <span className="text-xl">🚚</span>
                </div>
                <span className="text-white font-semibold">Expédiées</span>
              </div>
              <span className="text-purple-400 font-bold text-xl">{stats.shippedOrders}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/50"
                style={{ width: `${orders.length > 0 ? (stats.shippedOrders / orders.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="p-4 frosted-glass rounded-xl hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/30">
                  <span className="text-xl">✅</span>
                </div>
                <span className="text-white font-semibold">Livrées</span>
              </div>
              <span className="text-green-400 font-bold text-xl">{stats.deliveredOrders}</span>
            </div>
            <div className="w-full bg-slate-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 shadow-lg shadow-green-500/50"
                style={{ width: `${orders.length > 0 ? (stats.deliveredOrders / orders.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Top clients - Design amélioré */}
      {stats.topCustomers.length > 0 && (
        <div className="glass-apple-strong p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/50">
              <span className="text-2xl">👑</span>
            </div>
            <div>
              <h4 className="text-white font-bold text-lg">Meilleurs clients</h4>
              <p className="text-slate-400 text-sm">Top 5 par chiffre d'affaires</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {stats.topCustomers.map((customer, index) => (
              <div key={customer.email} className="flex items-center justify-between p-4 frosted-glass rounded-xl hover:shadow-lg transition-all duration-300 group glossy">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 shadow-yellow-500/50' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 shadow-gray-400/50' :
                    index === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-orange-500/50' :
                    'bg-slate-600 border border-slate-500'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div>
                    <p className="text-white font-bold">{customer.name}</p>
                    <p className="text-slate-400 text-sm">{customer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-black text-lg">{formatPrice(customer.total)}</p>
                  <p className="text-slate-400 text-sm bg-slate-600 px-2 py-1 rounded-lg inline-block">
                    {customer.orders} commande{customer.orders > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}