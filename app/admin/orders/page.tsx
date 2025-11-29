'use client';

import { useEffect, useState } from 'react';
import AdminRoute from '../../components/AdminRoute';
import AdminLayout from '../../components/admin/AdminLayout';
import api from '../../lib/api';
import { Order, OrderStatus } from '../../types';

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  confirmed: 'bg-blue-500/20 text-blue-400 border-blue-500',
  processing: 'bg-purple-500/20 text-purple-400 border-purple-500',
  shipped: 'bg-indigo-500/20 text-indigo-400 border-indigo-500',
  delivered: 'bg-green-500/20 text-green-400 border-green-500',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500',
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/orders', true);
      // Handle response format: { success: true, data: { orders: [...] } }
      const ordersList = response.data?.orders || response.orders || [];
      // Sort by most recent first
      const sortedOrders = ordersList.sort(
        (a: Order, b: Order) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter((order) => order.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.customerName.toLowerCase().includes(query) ||
          order.customerPhone.includes(query)
      );
    }

    setFilteredOrders(filtered);
  }, [selectedStatus, searchQuery, orders]);

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await api.put(`/api/admin/orders/${orderId}`, { status: newStatus }, true);
      
      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      // Update selected order if it's the one being updated
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.')) {
      return;
    }

    try {
      await api.delete(`/api/admin/orders/${orderId}`, true);
      
      // Remove from local state
      setOrders((prev) => prev.filter((order) => order.id !== orderId));
      
      // Close modal if it's the deleted order
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
      
      alert('Commande supprimée avec succès');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Erreur lors de la suppression de la commande');
    }
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in-up">
          {/* Header with Stats */}
          <div className="flex flex-col gap-4 animate-fade-in-down">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Gestion des Commandes
              </h2>
              <p className="text-sm md:text-base text-neutral-400">
                {orders.length} commande(s) au total
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
              <div className="px-3 md:px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                <p className="text-xs text-yellow-400 uppercase">En attente</p>
                <p className="text-lg md:text-xl font-bold text-yellow-400">
                  {orders.filter((o) => o.status === 'pending').length}
                </p>
              </div>
              <div className="px-3 md:px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-xs text-blue-400 uppercase">Confirmées</p>
                <p className="text-lg md:text-xl font-bold text-blue-400">
                  {orders.filter((o) => o.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="section-gradient-overlay bg-neutral-800 border border-neutral-700 rounded-lg p-4 space-y-4">
            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Rechercher par numéro, nom ou téléphone..."
              className="w-full px-4 py-3 bg-neutral-900 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
            />

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                  selectedStatus === 'ALL'
                    ? 'bg-accent text-white'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                Toutes ({orders.length})
              </button>
              {(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as OrderStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all ${
                      selectedStatus === status
                        ? 'bg-accent text-white'
                        : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    {STATUS_LABELS[status]} (
                    {orders.filter((o) => o.status === status).length})
                  </button>
                )
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-neutral-400">
              {filteredOrders.length} commande(s) trouvée(s)
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`bg-neutral-800 rounded-lg p-6 animate-fade-in-up delay-${(i + 1) * 100}`}
                >
                  <div className="h-6 bg-neutral-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-neutral-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-12 text-center">
              <p className="text-neutral-400 text-lg">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order, index) => (
                <div
                  key={order.id}
                  className={`bg-neutral-800 border border-neutral-700 rounded-lg p-3 md:p-6 hover:border-neutral-600 transition-all hover:shadow-lg animate-fade-in-up delay-${Math.min((index % 5 + 1) * 100, 500)} overflow-hidden`}
                >
                  <div className="flex flex-col gap-3">
                    {/* Order Header - Enhanced */}
                    <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-3 border border-purple-500/30">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h3 className="text-base md:text-lg font-bold text-white truncate">
                          {order.orderNumber}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded border ${
                            STATUS_COLORS[order.status]
                          }`}
                        >
                          {STATUS_LABELS[order.status]}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-white/70 mb-2">
                        <span className="flex items-center gap-1">
                          🕐 {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          📦 {order.items?.length || 0} article(s)
                        </span>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-2"></div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-accent font-bold text-lg md:text-xl">
                            {(order.totalAmount || 0).toLocaleString()}
                          </span>
                          <span className="text-accent/70 text-xs font-medium">GNF</span>
                        </div>
                        {order.deliveryZone && (
                          <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                            <span className="text-xs">🏘️</span>
                            <span className="text-white text-xs font-medium">{order.deliveryZone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Images Preview */}
                    {order.items && order.items.length > 0 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {order.items.slice(0, 4).map((item, idx) => (
                          <div
                            key={idx}
                            className="relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 border-white/20 bg-neutral-900"
                          >
                            {item.product?.images?.[0] ? (
                              <img
                                src={item.product.images[0]}
                                alt={item.product.name || 'Produit'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-600">
                                📦
                              </div>
                            )}
                            {item.quantity > 1 && (
                              <div className="absolute top-0 right-0 bg-accent text-white text-xs font-bold px-1.5 py-0.5 rounded-bl-lg">
                                x{item.quantity}
                              </div>
                            )}
                          </div>
                        ))}
                        {order.items.length > 4 && (
                          <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg bg-neutral-900 border-2 border-dashed border-white/20 flex items-center justify-center">
                            <span className="text-white/60 text-xs font-semibold">
                              +{order.items.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Customer Info - Compact */}
                    <div className="space-y-1.5 text-xs md:text-sm">
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1.5">
                        <span className="text-neutral-500">👤</span>
                        <span className="text-white font-semibold truncate">{order.customerName}</span>
                        
                        <span className="text-neutral-500">📞</span>
                        <span className="text-white font-semibold">{order.customerPhone}</span>
                        
                        {order.deliveryZone && (
                          <>
                            <span className="text-neutral-500">🏘️</span>
                            <span className="text-white font-semibold">{order.deliveryZone}</span>
                          </>
                        )}
                        
                        <span className="text-neutral-500">📍</span>
                        <span className="text-white line-clamp-2">{order.deliveryAddress}</span>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-700">
                      <div className="flex flex-col">
                        <span className="text-accent font-bold text-sm md:text-lg">
                          {(order.totalAmount || 0).toLocaleString()} GNF
                        </span>
                        <span className="text-neutral-400 text-xs">
                          {order.items?.length || 0} article(s)
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 md:px-4 py-2 bg-accent hover:bg-accent/90 text-white text-xs md:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                      >
                        📋 Détails
                      </button>
                    </div>

                    {/* Status Update */}
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusUpdate(order.id, e.target.value as OrderStatus)
                        }
                        className="w-full px-3 py-2 bg-neutral-900 border border-neutral-600 rounded-lg text-white text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="confirmed">✓ Confirmée</option>
                        <option value="processing">🔄 En traitement</option>
                        <option value="shipped">📦 Expédiée</option>
                        <option value="delivered">✓✓ Livrée</option>
                        <option value="cancelled">✕ Annulée</option>
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          {selectedOrder && (
            <OrderDetailsModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDeleteOrder}
            />
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
  onDelete,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-bounce-in">
        {/* Header */}
        <div className="sticky top-0 bg-white/5 backdrop-blur-xl border-b border-white/20 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Commande {order.orderNumber}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <svg
              className="w-6 h-6 text-white/60 hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2 uppercase tracking-wide">
              Statut
            </label>
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value as OrderStatus)}
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white focus:outline-none focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all duration-300"
            >
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="processing">En traitement</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">
              Informations Client
            </h3>
            <div className="space-y-2 text-white/80 text-sm md:text-base">
              <p className="break-words">
                <span className="font-semibold text-accent">Nom:</span> {order.customerName}
              </p>
              <p className="break-all">
                <span className="font-semibold text-accent">Téléphone:</span> {order.customerPhone}
              </p>
              {order.customerEmail && (
                <p className="break-all">
                  <span className="font-semibold text-accent">Email:</span> {order.customerEmail}
                </p>
              )}
              {order.deliveryZone && (
                <p>
                  <span className="font-semibold text-accent">Quartier:</span> {order.deliveryZone}
                </p>
              )}
              <p className="break-words">
                <span className="font-semibold text-accent">Adresse de livraison:</span>{' '}
                {order.deliveryAddress}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">
              Articles commandés
            </h3>
            <div className="space-y-3">
              {(order.items || []).map((item) => (
                <div
                  key={item.id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/10"
                >
                  <div>
                    <p className="text-white font-semibold">
                      {item.product?.name || 'Produit'}
                    </p>
                    <p className="text-white/60 text-sm">
                      Taille: {item.size || 'N/A'} • Quantité: {item.quantity || 0}
                    </p>
                  </div>
                  <p className="text-accent font-bold">
                    {((item.price || 0) * (item.quantity || 0)).toLocaleString()} GNF
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-white/20 pt-4">
            <div className="flex items-center justify-between text-xl">
              <span className="font-bold text-white uppercase">Total</span>
              <span className="font-bold text-accent">
                {(order.totalAmount || 0).toLocaleString()} GNF
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="text-white/60 text-sm">
            Commande passée le{' '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>

          {/* Delete Button */}
          <div className="border-t border-white/20 pt-4">
            <button
              onClick={() => onDelete(order.id)}
              className="w-full py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Supprimer la commande
            </button>
            <p className="text-white/50 text-xs text-center mt-2">
              ⚠️ Cette action est irréversible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
