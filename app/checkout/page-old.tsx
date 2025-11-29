'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { checkCartStock, StockCheckResult } from '../lib/inventory';
import { formatPrice, translations, validateGuineanPhone } from '../lib/i18n';

// Helper function to handle both Cloudinary URLs and local paths
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '/placeholder-product.svg';
  // If it's already a full URL (Cloudinary), use it as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Otherwise, it's a local path
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${imagePath}`;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockCheck, setStockCheck] = useState<StockCheckResult | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '+224',
    customerEmail: '',
    deliveryAddress: '',
    deliveryZone: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deliveryZones, setDeliveryZones] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  // Fetch delivery zones
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await api.get('/api/delivery-zones');
        setDeliveryZones(response.data || []);
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  const getDeliveryFee = () => {
    const zone = deliveryZones.find(z => z.name === formData.deliveryZone);
    return zone ? zone.price : 0;
  };

  // Check stock on mount and when cart changes
  useEffect(() => {
    const validateStock = async () => {
      if (cart.length === 0) return;
      
      setCheckingStock(true);
      try {
        const result = await checkCartStock(cart);
        setStockCheck(result);
        
        if (!result.available) {
          setError('Certains articles ne sont plus disponibles en stock');
        }
      } catch (err) {
        console.error('Error checking stock:', err);
      } finally {
        setCheckingStock(false);
      }
    };

    validateStock();
  }, [cart]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.customerName || formData.customerName.length < 2) {
      errors.customerName = translations.validation.minLength(2);
    }

    if (!validateGuineanPhone(formData.customerPhone)) {
      errors.customerPhone = translations.validation.invalidPhone;
    }

    if (formData.customerEmail && !formData.customerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.customerEmail = translations.validation.invalidEmail;
    }

    if (!formData.deliveryAddress || formData.deliveryAddress.length < 10) {
      errors.deliveryAddress = translations.validation.minLength(10);
    }

    if (!formData.deliveryZone) {
      errors.deliveryZone = 'Veuillez sélectionner un quartier de livraison';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (cart.length === 0) {
      setError(translations.emptyCart);
      return;
    }

    // Final stock check before submitting
    setCheckingStock(true);
    try {
      const finalStockCheck = await checkCartStock(cart);
      setStockCheck(finalStockCheck);
      
      if (!finalStockCheck.available) {
        setError(translations.validation.insufficientStock);
        setCheckingStock(false);
        return;
      }
    } catch (err) {
      console.error('Error checking stock:', err);
      setError(translations.errors.generic);
      setCheckingStock(false);
      return;
    }
    setCheckingStock(false);

    setLoading(true);

    try {
      // Prepare order items
      const items = cart.map((item) => ({
        productId: item.product.id,
        size: item.size,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const deliveryFee = getDeliveryFee();
      const totalAmount = getTotalPrice() + deliveryFee;

      // Create order
      const response = await api.post('/api/orders', {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryAddress: `${formData.deliveryZone} - ${formData.deliveryAddress}`,
        deliveryZone: formData.deliveryZone,
        deliveryFee: deliveryFee,
        items,
        totalAmount: totalAmount,
      });

      if (response.success) {
        // Clear cart
        clearCart();
        // Redirect to confirmation page
        router.push(`/order-confirmation/${response.data.order.orderNumber}`);
      } else {
        setError(response.error?.message || translations.errors.createOrder);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      
      // Try to parse error response
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('INSUFFICIENT_STOCK')) {
        setError(translations.validation.insufficientStock);
      } else {
        setError(translations.errors.createOrder);
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-neutral-900 mb-4">
              Votre panier est vide
            </h1>
            <p className="text-neutral-600 mb-8">
              Ajoutez des articles à votre panier pour passer une commande
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-neutral-900 text-white px-8 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Continuer vos achats
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-8">
          Finaliser la commande
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Informations client
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-neutral-700 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
                        formErrors.customerName ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="Votre nom complet"
                    />
                    {formErrors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customerPhone" className="block text-sm font-medium text-neutral-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      id="customerPhone"
                      name="customerPhone"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
                        formErrors.customerPhone ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="+224XXXXXXXX"
                    />
                    {formErrors.customerPhone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.customerPhone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customerEmail" className="block text-sm font-medium text-neutral-700 mb-1">
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      id="customerEmail"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
                        formErrors.customerEmail ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="votre@email.com"
                    />
                    {formErrors.customerEmail && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.customerEmail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                  Adresse de livraison
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="deliveryZone" className="block text-sm font-medium text-neutral-700 mb-1">
                      Quartier de livraison *
                    </label>
                    <select
                      id="deliveryZone"
                      name="deliveryZone"
                      value={formData.deliveryZone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
                        formErrors.deliveryZone ? 'border-red-500' : 'border-neutral-300'
                      }`}
                    >
                      <option value="">Sélectionnez votre quartier</option>
                      {loadingZones ? (
                        <option disabled>Chargement...</option>
                      ) : (
                        deliveryZones.map((zone) => (
                          <option key={zone.id} value={zone.name}>
                            {zone.name} - {formatPrice(zone.price)} frais de livraison
                          </option>
                        ))
                      )}
                    </select>
                    {formErrors.deliveryZone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.deliveryZone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deliveryAddress" className="block text-sm font-medium text-neutral-700 mb-1">
                      Adresse complète *
                    </label>
                    <textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-neutral-900 focus:border-transparent ${
                        formErrors.deliveryAddress ? 'border-red-500' : 'border-neutral-300'
                      }`}
                      placeholder="Rue, numéro de maison, points de repère..."
                    />
                    {formErrors.deliveryAddress && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.deliveryAddress}</p>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">
                      Exemple: Près de la mosquée, maison bleue à gauche
                    </p>
                  </div>
                </div>
              </div>

              {/* Stock Warning */}
              {stockCheck && stockCheck.available === false && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-semibold text-yellow-900 mb-2">Articles en rupture de stock</h3>
                      <ul className="space-y-2 text-sm text-yellow-800">
                        {stockCheck.outOfStockItems.map((item) => (
                          <li key={item.productId} className="flex items-center justify-between">
                            <span>
                              <strong>{item.productName}</strong> - Demandé: {item.requestedQuantity}, Disponible: {item.availableStock}
                            </span>
                            <button
                              onClick={() => removeFromCart(item.productId, cart.find(c => c.product.id === item.productId)?.size || '')}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold ml-2"
                            >
                              Retirer
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || checkingStock || (stockCheck?.available === false)}
                className="w-full bg-neutral-900 text-white py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:bg-neutral-400 disabled:cursor-not-allowed touch-target"
              >
                {checkingStock ? translations.loading : loading ? translations.loading : translations.placeOrder}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Résumé de la commande
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                      {item.product.images[0] && (
                        <Image
                          src={getImageUrl(item.product.images[0])}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                          loading="lazy"
                          quality={75}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-neutral-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        Taille: {item.size} • Qté: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-neutral-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-600">Sous-total</span>
                  <span className="font-semibold text-neutral-900">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-neutral-600">
                    Livraison {formData.deliveryZone && `(${formData.deliveryZone})`}
                  </span>
                  <span className="font-semibold text-neutral-900">
                    {formData.deliveryZone ? formatPrice(getDeliveryFee()) : '—'}
                  </span>
                </div>
                <div className="border-t border-neutral-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-neutral-900">Total</span>
                    <span className="text-2xl font-bold text-neutral-900">
                      {formatPrice(totalPrice + getDeliveryFee())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
                <p className="text-sm text-neutral-600">
                  <strong>Paiement:</strong> À la livraison (espèces)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
