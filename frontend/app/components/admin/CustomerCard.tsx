'use client';

interface CustomerCardProps {
  customer: {
    name: string;
    email: string;
    phone: string;
    orders: number;
    total: number;
  };
  formatPrice: (price: number) => string;
  onViewOrders?: () => void;
  onSendEmail?: () => void;
}

export default function CustomerCard({ customer, formatPrice, onViewOrders, onSendEmail }: CustomerCardProps) {
  const getCustomerBadge = (orders: number) => {
    if (orders >= 10) return { label: 'VIP', color: 'from-yellow-500 to-orange-500', icon: '👑' };
    if (orders >= 5) return { label: 'Fidèle', color: 'from-purple-500 to-pink-500', icon: '⭐' };
    if (orders >= 2) return { label: 'Régulier', color: 'from-blue-500 to-cyan-500', icon: '💎' };
    return { label: 'Nouveau', color: 'from-green-500 to-emerald-500', icon: '🌟' };
  };

  const badge = getCustomerBadge(customer.orders);

  return (
    <div className="group/customer relative overflow-hidden">
      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover/customer:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      
      <div className="relative glass-apple rounded-3xl p-6 border-2 border-white/10 hover:border-purple-500/40 transition-all duration-500 group-hover/customer:scale-[1.02] shadow-lg hover:shadow-2xl">
        {/* Header avec avatar et badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            {/* Avatar avec initiales */}
            <div className="relative">
              <div className={`w-16 h-16 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl group-hover/customer:scale-110 group-hover/customer:rotate-3 transition-all duration-500`}>
                {customer.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              {/* Badge de statut */}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
                <span className="text-sm">{badge.icon}</span>
              </div>
            </div>
            
            {/* Informations client */}
            <div>
              <h4 className="text-white font-black text-lg tracking-tight mb-1">
                {customer.name}
              </h4>
              <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${badge.color} bg-opacity-20 border border-white/20 rounded-xl`}>
                <span className="text-sm">{badge.icon}</span>
                <span className="text-white text-xs font-bold uppercase tracking-wider">{badge.label}</span>
              </div>
            </div>
          </div>
          
          {/* Statistiques rapides */}
          <div className="text-right">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total dépensé</p>
            <p className="text-green-400 font-black text-2xl tracking-tight drop-shadow-lg">
              {formatPrice(customer.total)}
            </p>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 p-3 glass-apple-light rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all group/info">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50 group-hover/info:scale-110 transition-transform">
              <span className="text-lg">📧</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-white text-sm font-medium truncate">{customer.email}</p>
            </div>
            <button 
              onClick={onSendEmail}
              className="opacity-0 group-hover/info:opacity-100 transition-opacity p-2 hover:bg-blue-500/20 rounded-lg"
            >
              <span className="text-blue-400">📤</span>
            </button>
          </div>
          
          {customer.phone !== 'N/A' && (
            <div className="flex items-center gap-3 p-3 glass-apple-light rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all group/info">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/50 group-hover/info:scale-110 transition-transform">
                <span className="text-lg">📞</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Téléphone</p>
                <p className="text-white text-sm font-medium">{customer.phone}</p>
              </div>
              <button className="opacity-0 group-hover/info:opacity-100 transition-opacity p-2 hover:bg-green-500/20 rounded-lg">
                <span className="text-green-400">📋</span>
              </button>
            </div>
          )}
        </div>

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-4 frosted-glass rounded-xl border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛒</span>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Commandes</p>
            </div>
            <p className="text-white font-black text-2xl">{customer.orders}</p>
          </div>
          
          <div className="p-4 frosted-glass rounded-xl border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💰</span>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Panier moy.</p>
            </div>
            <p className="text-white font-black text-2xl">{formatPrice(customer.total / customer.orders)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onViewOrders}
            className="group/btn relative overflow-hidden px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/50 border border-purple-400/30"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
            <span className="relative flex items-center justify-center gap-2">
              <span>📦</span>
              <span className="text-sm">Voir commandes</span>
            </span>
          </button>
          
          <button
            onClick={onSendEmail}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all border border-slate-600 hover:border-slate-500 hover:scale-105 active:scale-95 shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span>📧</span>
              <span className="text-sm">Contacter</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
