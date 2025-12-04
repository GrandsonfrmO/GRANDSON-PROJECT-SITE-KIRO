'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import api from '../lib/api';
import { checkCartStock, StockCheckResult } from '../lib/inventory';
import { formatPrice, translations, validateGuineanPhone } from '../lib/i18n';
import { getImageUrl } from '../lib/imageOptimization';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart, removeFromCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stockCheck, setStockCheck] = useState<StockCheckResult | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch('/api/delivery-zones');
        const data = await response.json();
        console.log('Delivery zones response:', data);
        setDeliveryZones(data.data || data || []);
      } catch (error) {
        console.error('Error fetching delivery zones:', error);
        setDeliveryZones([
          { id: '1', name: 'Camayenne', price: 30000 },
          { id: '2', name: 'Dixinn', price: 25000 },
          { id: '3', name: 'Kaloum', price: 35000 },
          { id: '4', name: 'Matam', price: 25000 },
          { id: '5', name: 'Matoto', price: 25000 },
          { id: '6', name: 'Ratoma', price: 20000 }
        ]);
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

    if (!formData.customerEmail) {
      errors.customerEmail = 'Email requis pour recevoir les notifications';
    } else if (!formData.customerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
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
      setError('Erreur lors de la vérification du stock');
      setCheckingStock(false);
      return;
    }
    setCheckingStock(false);

    setLoading(true);
    try {
      // Abonner automatiquement l'email aux notifications
      try {
        await fetch('/api/push/subscribe-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.customerEmail,
            customerName: formData.customerName,
            phone: formData.customerPhone
          })
        });
        console.log('Client abonné automatiquement aux notifications');
      } catch (subError) {
        console.error('Erreur abonnement notifications:', subError);
        // Ne pas bloquer la commande si l'abonnement échoue
      }

      const orderData = {
        ...formData,
        items: cart.map((item) => ({
          productId: item.product.id,
          size: item.size,
          quantity: item.quantity,
          price: item.product.price,
        })),
        deliveryFee: getDeliveryFee(),
        totalAmount: getTotalPrice() + getDeliveryFee(),
      };

      console.log('Creating order:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log('Order response:', data);

      if (data.success && data.data?.order) {
        // Show warning if in demo mode
        if (data.warning) {
          console.warn('Demo mode warning:', data.warning.message);
        }
        clearCart();
        router.push(`/order-confirmation/${data.data.order.orderNumber}`);
      } else if (data.error) {
        // Display user-friendly error message from the API
        const errorMessage = data.error.message || 'Impossible de créer la commande';
        const errorDetails = data.error.details ? ` (${data.error.details})` : '';
        setError(errorMessage + errorDetails);
        
        // Log error code for debugging
        console.error('Order creation failed:', {
          code: data.error.code,
          message: data.error.message,
          details: data.error.details,
          field: data.error.field
        });
      } else {
        setError('Impossible de créer la commande');
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError('Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center px-4 py-12 transition-colors duration-200">
          <div className="max-w-md w-full text-center">
            <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-2xl p-12 border-2 border-neutral-200 dark:border-neutral-700">
              <div className="text-8xl mb-6">🛒</div>
              <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-4 uppercase">
                Panier Vide
              </h1>
              <p className="text-neutral-600 dark:text-neutral-300 mb-8 text-lg">
                Ajoutez des articles à votre panier pour passer une commande
              </p>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-neutral-900 to-neutral-800 dark:from-white dark:to-neutral-100 hover:from-neutral-800 hover:to-neutral-700 dark:hover:from-neutral-200 dark:hover:to-white text-white dark:text-black px-8 py-4 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:scale-105 border-2 border-neutral-900 dark:border-white"
              >
                Découvrir nos produits
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const totalPrice = getTotalPrice();
  const deliveryFee = getDeliveryFee();
  const grandTotal = totalPrice + deliveryFee;

  const steps = [
    { number: 1, title: 'Panier', icon: '🛒' },
    { number: 2, title: 'Informations', icon: '📝' },
    { number: 3, title: 'Confirmation', icon: '✓' },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 py-8 md:py-12 transition-colors duration-200">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-neutral-900 dark:text-white mb-4 uppercase tracking-tight">
              Finaliser la Commande
            </h1>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg">
              Plus qu&apos;une étape pour recevoir vos articles
            </p>
          </div>

          {/* Progress Steps */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black transition-all duration-300 ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-accent to-accent/80 text-black shadow-lg scale-110'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`mt-2 text-sm font-bold uppercase ${
                        currentStep >= step.number ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-4 rounded-full transition-all duration-300 ${
                        currentStep > step.number ? 'bg-accent' : 'bg-neutral-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-4xl mx-auto mb-8 animate-in slide-in-from-top duration-300">
              <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-6 flex items-start gap-4">
                <svg className="w-6 h-6 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-800 font-semibold">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl p-8 border-2 border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-accent to-accent/80 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase">
                      Vos Informations
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">
                        Nom Complet *
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all text-lg ${
                          formErrors.customerName ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white'
                        }`}
                        placeholder="Votre nom complet"
                      />
                      {formErrors.customerName && (
                        <p className="text-red-600 text-sm mt-2 font-semibold flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formErrors.customerName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="customerPhone" className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">
                          Téléphone *
                        </label>
                        <input
                          type="tel"
                          id="customerPhone"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={handleInputChange}
                          className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all text-lg ${
                            formErrors.customerPhone ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white'
                          }`}
                          placeholder="+224XXXXXXXX"
                        />
                        {formErrors.customerPhone && (
                          <p className="text-red-600 text-sm mt-2 font-semibold">{formErrors.customerPhone}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="customerEmail" className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="customerEmail"
                          name="customerEmail"
                          value={formData.customerEmail}
                          onChange={handleInputChange}
                          className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all text-lg ${
                            formErrors.customerEmail ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white'
                          }`}
                          placeholder="email@exemple.com"
                        />
                        {formErrors.customerEmail && (
                          <p className="text-red-600 text-sm mt-2 font-semibold">{formErrors.customerEmail}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Information Card */}
                <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl p-8 border-2 border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white uppercase">
                      Livraison
                    </h2>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label htmlFor="deliveryZone" className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">
                        Quartier de Livraison *
                      </label>
                      <select
                        id="deliveryZone"
                        name="deliveryZone"
                        value={formData.deliveryZone}
                        onChange={handleInputChange}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all text-lg appearance-none bg-white dark:bg-neutral-700 ${
                          formErrors.deliveryZone ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white'
                        }`}
                        style={{ 
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1rem center',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '3rem'
                        }}
                      >
                        <option value="">Sélectionnez votre quartier</option>
                        {loadingZones ? (
                          <option disabled>Chargement...</option>
                        ) : deliveryZones.length === 0 ? (
                          <option disabled>Aucune zone disponible</option>
                        ) : (
                          deliveryZones.map((zone) => (
                            <option key={zone.id} value={zone.name}>
                              {zone.name} - {formatPrice(zone.price)}
                            </option>
                          ))
                        )}
                      </select>
                      {formErrors.deliveryZone && (
                        <p className="text-red-600 text-sm mt-2 font-semibold">{formErrors.deliveryZone}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="deliveryAddress" className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wide">
                        Adresse Complète *
                      </label>
                      <textarea
                        id="deliveryAddress"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-accent/20 focus:border-accent transition-all text-lg resize-none ${
                          formErrors.deliveryAddress ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white'
                        }`}
                        placeholder="Numéro de maison, rue, repères..."
                      />
                      {formErrors.deliveryAddress && (
                        <p className="text-red-600 text-sm mt-2 font-semibold">{formErrors.deliveryAddress}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || checkingStock}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white px-8 py-6 rounded-2xl font-black uppercase tracking-wide transition-all shadow-2xl hover:shadow-green-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-xl border-2 border-green-600"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traitement en cours...
                    </span>
                  ) : checkingStock ? (
                    'Vérification du stock...'
                  ) : (
                    <>
                      Confirmer la Commande - {formatPrice(grandTotal)}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-2xl p-8 border border-neutral-200 sticky top-8">
                <h2 className="text-2xl font-black text-neutral-900 mb-6 uppercase">
                  Récapitulatif
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}`} className="flex gap-4 p-4 bg-neutral-50 rounded-2xl">
                      <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-neutral-200">
                        <Image
                          src={getImageUrl(item.product.images[0], 'cart')}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-neutral-900 text-sm line-clamp-2 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-xs text-neutral-600 mb-2">
                          Taille: <span className="font-bold">{item.size}</span> • Qté: <span className="font-bold">{item.quantity}</span>
                        </p>
                        <p className="text-accent font-black">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Summary */}
                <div className="space-y-3 pt-6 border-t-2 border-neutral-200">
                  <div className="flex justify-between text-neutral-700">
                    <span className="font-semibold">Sous-total</span>
                    <span className="font-bold">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span className="font-semibold">Livraison</span>
                    <span className="font-bold">
                      {deliveryFee > 0 ? formatPrice(deliveryFee) : 'À calculer'}
                    </span>
                  </div>
                  <div className="flex justify-between text-2xl font-black text-neutral-900 pt-3 border-t-2 border-neutral-200">
                    <span>Total</span>
                    <span className="text-accent">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-8 pt-6 border-t border-neutral-200 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Paiement à la livraison</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Livraison rapide</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-600">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Support client 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
