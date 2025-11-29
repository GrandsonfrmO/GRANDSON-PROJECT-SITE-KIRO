'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../../components/Layout';
import { formatPrice } from '../../lib/i18n';
import { getImageUrl } from '../../lib/imageOptimization';
import api from '../../lib/api';

interface OrderItem {
  id: string;
  size: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryZone: string;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderNumber}`);
        const data = await response.json();
        
        if (data.success && data.data?.order) {
          setOrder(data.data.order);
        } else {
          setError('Commande non trouvée');
        }
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Erreur lors de la récupération de la commande');
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
      case 'VALIDATED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'En attente de validation';
      case 'CONFIRMED':
      case 'VALIDATED':
        return 'Confirmée';
      case 'PROCESSING':
        return 'En préparation';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">Chargement de votre commande...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-12 border-2 border-neutral-200 dark:border-neutral-700">
              <div className="text-8xl mb-6">❌</div>
              <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-4 uppercase">
                Commande Introuvable
              </h1>
              <p className="text-neutral-600 dark:text-neutral-300 mb-8 text-lg">
                {error || 'La commande demandée n\'existe pas ou a été supprimée'}
              </p>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 hover:from-neutral-800 hover:to-neutral-700 dark:hover:from-neutral-200 dark:hover:to-white text-white dark:text-black px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-105 border-2 border-neutral-900 dark:border-white"
              >
                Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4 uppercase tracking-tight">
              Commande Confirmée
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">
              Merci pour votre commande ! Voici les détails de votre achat.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Order Summary Card */}
            <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-8 mb-8 border-2 border-neutral-200 dark:border-neutral-700">
              {/* Order Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-6 border-b-2 border-neutral-200 dark:border-neutral-700">
                <div>
                  <h2 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">
                    Commande #{order.orderNumber}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-300">
                    Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className={`inline-block px-6 py-3 rounded-full text-sm font-bold border-2 ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informations Client
                  </h3>
                  <div className="space-y-2 text-neutral-600 dark:text-neutral-300">
                    <p><strong>Nom:</strong> {order.customerName}</p>
                    <p><strong>Téléphone:</strong> {order.customerPhone}</p>
                    {order.customerEmail && (
                      <p><strong>Email:</strong> {order.customerEmail}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Livraison
                  </h3>
                  <div className="space-y-2 text-neutral-600 dark:text-neutral-300">
                    <p><strong>Zone:</strong> {order.deliveryZone}</p>
                    <p><strong>Adresse:</strong> {order.deliveryAddress}</p>
                    <p><strong>Frais:</strong> {formatPrice(order.deliveryFee)}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Articles Commandés
                </h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-2xl">
                      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-200">
                        {item.product.images && item.product.images.length > 0 ? (
                          <Image
                            src={getImageUrl(item.product.images[0], 'cart')}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-neutral-900 dark:text-white text-sm line-clamp-2 mb-1">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                          Taille: <span className="font-bold">{item.size}</span> • Quantité: <span className="font-bold">{item.quantity}</span>
                        </p>
                        <p className="text-accent font-black">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Total */}
              <div className="border-t-2 border-neutral-200 dark:border-neutral-700 pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold">Sous-total</span>
                    <span className="font-bold">{formatPrice(order.totalAmount - order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                    <span className="font-semibold">Frais de livraison</span>
                    <span className="font-bold">{formatPrice(order.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-3xl font-black text-neutral-900 dark:text-white pt-3 border-t-2 border-neutral-200 dark:border-neutral-700">
                    <span>Total</span>
                    <span className="text-accent">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl p-8 mb-8 border-2 border-green-200 dark:border-green-700">
              <h3 className="text-2xl font-black text-green-900 dark:text-green-100 mb-6 flex items-center gap-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Prochaines Étapes
              </h3>
              <div className="space-y-4 text-green-800 dark:text-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">1</div>
                  <p>Notre équipe va examiner votre commande et vérifier la disponibilité des articles.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">2</div>
                  <p>Nous vous contacterons au <strong>{order.customerPhone}</strong> pour confirmer les détails et organiser la livraison.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">3</div>
                  <p>Vous recevrez une notification dès que votre commande sera validée et expédiée.</p>
                </div>
                {order.customerEmail && (
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">📧</div>
                    <p>Un email de confirmation a été envoyé à <strong>{order.customerEmail}</strong>.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 hover:from-neutral-800 hover:to-neutral-700 dark:hover:from-neutral-200 dark:hover:to-white text-white dark:text-black px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-105 border-2 border-neutral-900 dark:border-white text-center"
              >
                Continuer vos achats
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl border-2 border-neutral-300 dark:border-neutral-600 text-center"
              >
                Imprimer la commande
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}