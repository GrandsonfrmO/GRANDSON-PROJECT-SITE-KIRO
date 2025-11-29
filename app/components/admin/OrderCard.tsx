'use client';

import { useState } from 'react';

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
  orderNumber?: string;
}

interface OrderCardProps {
  order: Order;
  onValidateOrder: (orderId: string, customerEmail: string) => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function OrderCard({ order, onValidateOrder, onUpdateStatus, onDeleteOrder }: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: '⏳',
        text: 'En attente'
      },
      processing: {
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: '⚙️',
        text: 'En cours'
      },
      shipped: {
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        icon: '🚚',
        text: 'Expédiée'
      },
      delivered: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: '✅',
        text: 'Livrée'
      },
      cancelled: {
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        icon: '❌',
        text: 'Annulée'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const statusConfig = getStatusConfig(order.status);

  const handleValidateOrder = async () => {
    setIsLoading(true);
    try {
      await onValidateOrder(order.id, order.customerEmail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true);
    try {
      onUpdateStatus(order.id, newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    setIsLoading(true);
    try {
      await onDeleteOrder(order.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 group border-2 border-white/20 hover:border-purple-500/30">
      {/* Header Premium avec dégradé animé */}
      <div className="relative bg-white/5 backdrop-blur-lg mobile-px mobile-py p-6 md:p-8 border-b border-white/10 bg-gradient-to-br from-slate-800/50 via-purple-900/20 to-blue-900/20">
        {/* Effet de brillance au survol */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* En-tête principal */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4 md:gap-5">
              {/* Badge de commande avec animation */}
              <div className="relative">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl md:text-2xl shadow-2xl shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  #{order.orderNumber || order.id.slice(-3)}
                </div>
                {/* Indicateur de statut animé */}
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-800 ${
                  order.status === 'delivered' ? 'bg-green-500 animate-pulse' :
                  order.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                  order.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                  'bg-slate-500'
                }`}></div>
              </div>
              
              {/* Informations client */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-white font-black text-responsive-xl text-lg md:text-2xl tracking-tight">
                    {order.customerName}
                  </h4>
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl text-blue-300 text-xs font-bold uppercase tracking-wider shadow-lg">
                    Client
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <span className="text-base">🕒</span>
                    <span className="font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                    <span className="text-base">📦</span>
                    <span className="font-medium">{order.items.length} article(s)</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Prix et statut */}
            <div className="text-right">
              <div className="mb-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Total</p>
                <p className="text-green-400 font-black text-responsive-2xl text-2xl md:text-3xl tracking-tight drop-shadow-lg">
                  {formatPrice(order.total)}
                </p>
              </div>
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className={`touch-target relative inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border-2 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 ${statusConfig.color}`}
              >
                <span className="text-xl">{statusConfig.icon}</span>
                <span className="tracking-wide">{statusConfig.text}</span>
                <span className="text-xs">▼</span>
              </button>
              
              {/* Menu déroulant de statut */}
              {showStatusMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/15 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-white/20 overflow-hidden z-50 animate-fade-in">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                    const config = getStatusConfig(status);
                    return (
                      <button
                        key={status}
                        onClick={() => {
                          handleStatusChange(status);
                          setShowStatusMenu(false);
                        }}
                        disabled={order.status === status}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                          order.status === status 
                            ? 'bg-purple-500/30 cursor-not-allowed' 
                            : 'hover:bg-white/10 active:bg-white/20'
                        }`}
                      >
                        <span className="text-2xl">{config.icon}</span>
                        <span className="text-white font-semibold">{config.text}</span>
                        {order.status === status && (
                          <span className="ml-auto text-green-400">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Informations de contact Premium */}
          <div className="grid grid-mobile-1 grid-cols-1 md:grid-cols-2 gap-4">
            <div className="group/card relative overflow-hidden">
              <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02]">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center border-2 border-blue-400/30 shadow-lg shadow-blue-500/50 group-hover/card:scale-110 transition-transform">
                  <span className="text-2xl">📧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Email</p>
                  <p className="text-white text-sm font-semibold truncate">{order.customerEmail}</p>
                </div>
                <button className="opacity-0 group-hover/card:opacity-100 transition-opacity p-2 hover:bg-blue-500/20 rounded-lg">
                  <span className="text-blue-400">📋</span>
                </button>
              </div>
            </div>
            
            {order.customerPhone && (
              <div className="group/card relative overflow-hidden">
                <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-lg rounded-2xl border border-green-500/20 hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02]">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center border-2 border-green-400/30 shadow-lg shadow-green-500/50 group-hover/card:scale-110 transition-transform">
                    <span className="text-2xl">📞</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">Téléphone</p>
                    <p className="text-white text-sm font-semibold">{order.customerPhone}</p>
                  </div>
                  <button className="opacity-0 group-hover/card:opacity-100 transition-opacity p-2 hover:bg-green-500/20 rounded-lg">
                    <span className="text-green-400">📋</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Section Actions et Détails */}
      <div className="mobile-px mobile-py p-6 md:p-8 space-y-4 bg-gradient-to-br from-slate-800/30 to-slate-900/30">
        {/* Bouton d'expansion Premium */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full group/expand relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover/expand:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-4 bg-white/5 backdrop-blur-lg rounded-2xl transition-all flex items-center justify-center gap-3 text-white font-bold border-2 border-white/10 group-hover/expand:border-purple-500/50 group-hover/expand:scale-[1.02]">
            <span className="text-lg">{isExpanded ? '📤' : '📥'}</span>
            <span className="text-base">{isExpanded ? 'Masquer les détails' : 'Voir les détails complets'}</span>
            <span className={`text-xl transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}>
              ⬇️
            </span>
          </div>
        </button>

        {/* Actions principales - Design Ultra Premium */}
        <div className="grid grid-mobile-1 grid-cols-1 sm:grid-cols-2 gap-4">
          {order.status === 'pending' && (
            <button 
              onClick={handleValidateOrder}
              disabled={isLoading}
              className="group/btn relative overflow-hidden px-6 py-5 bg-gradient-to-r from-green-500 via-emerald-600 to-green-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-green-500/50 border-2 border-green-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-2xl">✅</span>
                  <span className="text-base">Valider la commande</span>
                </>
              )}
            </button>
          )}
          
          {order.status === 'processing' && (
            <button 
              onClick={() => handleStatusChange('shipped')}
              disabled={isLoading}
              className="group/btn relative overflow-hidden px-6 py-5 bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-purple-500/50 border-2 border-purple-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-2xl">🚚</span>
                  <span className="text-base">Marquer comme expédiée</span>
                </>
              )}
            </button>
          )}
          
          {order.status === 'shipped' && (
            <button 
              onClick={() => handleStatusChange('delivered')}
              disabled={isLoading}
              className="group/btn relative overflow-hidden px-6 py-5 bg-gradient-to-r from-blue-500 via-cyan-600 to-blue-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/50 border-2 border-blue-400/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000"></div>
              {isLoading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="text-2xl">🎉</span>
                  <span className="text-base">Marquer comme livrée</span>
                </>
              )}
            </button>
          )}
          
          <button 
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
            className="group/btn relative overflow-hidden px-6 py-5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-2xl transition-all font-black disabled:opacity-50 flex items-center justify-center gap-3 border-2 border-red-500/40 hover:border-red-500/60 hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/30"
          >
            <span className="text-2xl">🗑️</span>
            <span className="text-base">Supprimer</span>
          </button>
        </div>

        {/* Confirmation de suppression - Design Ultra Premium */}
        {showDeleteConfirm && (
          <div className="mt-4 relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-red-600/10 to-red-500/10 animate-pulse"></div>
            <div className="relative p-6 bg-red-900/30 border-3 border-red-500/60 rounded-2xl shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center border-2 border-red-400/50 shadow-2xl shadow-red-500/50 animate-pulse">
                  <span className="text-3xl">⚠️</span>
                </div>
                <div>
                  <p className="text-red-300 font-black text-xl tracking-tight">Confirmation de suppression</p>
                  <p className="text-red-400 text-sm font-semibold mt-1">⚡ Cette action est irréversible et définitive</p>
                </div>
              </div>
              <div className="grid grid-mobile-2 grid-cols-2 gap-4">
                <button
                  onClick={handleDeleteOrder}
                  disabled={isLoading}
                  className="group/del relative overflow-hidden px-5 py-4 bg-gradient-to-r from-red-500 via-red-600 to-red-500 bg-size-200 bg-pos-0 hover:bg-pos-100 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all duration-500 disabled:opacity-50 shadow-2xl shadow-red-500/50 border-2 border-red-400/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/del:translate-x-[200%] transition-transform duration-1000"></div>
                  <span className="relative">{isLoading ? '⏳ Suppression...' : '✓ Oui, supprimer'}</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isLoading}
                  className="px-5 py-4 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-2xl transition-all border-2 border-slate-600 hover:border-slate-500 hover:scale-105 active:scale-95 shadow-lg"
                >
                  ✕ Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content - Design Ultra Premium */}
      {isExpanded && (
        <div className="mobile-px mobile-py p-6 md:p-8 space-y-6 bg-white/5 backdrop-blur-lg border-t-2 border-purple-500/30 bg-gradient-to-br from-slate-800/40 to-slate-900/40 animate-fade-in">
          {/* Order Items Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center border-2 border-purple-400/30 shadow-2xl shadow-purple-500/50">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <h5 className="text-white font-black text-responsive-xl text-xl tracking-tight">Articles commandés</h5>
                  <p className="text-slate-400 text-sm font-semibold">{order.items.length} article(s) • Total: {formatPrice(order.total)}</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/40 rounded-xl">
                <span className="text-purple-300 font-bold text-sm">#{order.orderNumber || order.id.slice(-3)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="group/item relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-purple-500/5 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative flex items-center justify-between p-5 bg-white/5 backdrop-blur-lg rounded-2xl hover:shadow-2xl transition-all duration-300 border-2 border-white/10 hover:border-purple-500/30 group-hover/item:scale-[1.02]">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-2xl shadow-purple-500/50 group-hover/item:scale-110 group-hover/item:rotate-3 transition-all duration-500">
                          {item.quantity}x
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-slate-800 flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg mb-1">{item.productName}</p>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-slate-700/50 rounded-lg text-slate-300 text-xs font-semibold">
                            Prix unitaire: {formatPrice(item.price)}
                          </span>
                          <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-xs font-bold">
                            Qté: {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-black text-2xl mb-1 drop-shadow-lg">{formatPrice(item.price * item.quantity)}</p>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Sous-total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total récapitulatif Premium */}
            <div className="mt-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/10 animate-pulse"></div>
              <div className="relative p-6 bg-white/15 backdrop-blur-xl rounded-2xl border-3 border-green-500/30 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/50">
                      <span className="text-2xl">💰</span>
                    </div>
                    <span className="text-white font-black text-xl tracking-tight">Total de la commande</span>
                  </div>
                  <span className="text-green-400 font-black text-4xl tracking-tight drop-shadow-2xl">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info - Design Premium */}
          <div className="grid grid-mobile-1 grid-cols-1 md:grid-cols-2 gap-4">
            {order.shippingAddress && (
              <div className="group/info relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover/info:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-5 bg-white/5 backdrop-blur-lg rounded-2xl border-2 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group-hover/info:scale-[1.02]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center border-2 border-blue-400/30 shadow-2xl shadow-blue-500/50 group-hover/info:scale-110 transition-transform">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h6 className="text-white font-black text-lg tracking-tight">Adresse de livraison</h6>
                      <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Destination</p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium bg-slate-700/30 p-4 rounded-xl border border-slate-600/50">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
            )}
            
            {/* Méthode de paiement */}
            {order.paymentMethod && (
              <div className="group/info relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover/info:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-5 bg-white/5 backdrop-blur-lg rounded-2xl border-2 border-green-500/20 hover:border-green-500/40 transition-all duration-300 group-hover/info:scale-[1.02]">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center border-2 border-green-400/30 shadow-2xl shadow-green-500/50 group-hover/info:scale-110 transition-transform">
                      <span className="text-2xl">💳</span>
                    </div>
                    <div>
                      <h6 className="text-white font-black text-lg tracking-tight">Méthode de paiement</h6>
                      <p className="text-green-400 text-sm font-bold mt-1">{order.paymentMethod}</p>
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Paiement sécurisé</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline de la commande */}
          <div className="p-5 bg-white/5 backdrop-blur-lg rounded-2xl border-2 border-purple-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <span className="text-xl">⏱️</span>
              </div>
              <h6 className="text-white font-black text-lg">Timeline de la commande</h6>
            </div>
            <div className="space-y-3 pl-6 border-l-3 border-purple-500/30">
              <div className="relative pl-6">
                <div className="absolute -left-[13px] top-1 w-6 h-6 bg-green-500 rounded-full border-3 border-slate-800 flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
                <p className="text-white font-semibold">Commande créée</p>
                <p className="text-slate-400 text-xs">{formatDate(order.createdAt)}</p>
              </div>
              {order.status !== 'pending' && (
                <div className="relative pl-6">
                  <div className="absolute -left-[13px] top-1 w-6 h-6 bg-blue-500 rounded-full border-3 border-slate-800 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-white font-semibold">En traitement</p>
                  <p className="text-slate-400 text-xs">Commande validée</p>
                </div>
              )}
              {(order.status === 'shipped' || order.status === 'delivered') && (
                <div className="relative pl-6">
                  <div className="absolute -left-[13px] top-1 w-6 h-6 bg-purple-500 rounded-full border-3 border-slate-800 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-white font-semibold">Expédiée</p>
                  <p className="text-slate-400 text-xs">En cours de livraison</p>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="relative pl-6">
                  <div className="absolute -left-[13px] top-1 w-6 h-6 bg-green-500 rounded-full border-3 border-slate-800 flex items-center justify-center animate-pulse">
                    <span className="text-xs">✓</span>
                  </div>
                  <p className="text-white font-semibold">Livrée</p>
                  <p className="text-green-400 text-xs font-bold">Commande terminée avec succès</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}