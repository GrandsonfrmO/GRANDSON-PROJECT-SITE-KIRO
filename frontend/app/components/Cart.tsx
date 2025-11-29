'use client';

import { useCart } from '../context/CartContext';
import CartItem from './CartItem';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { checkCartStock, StockCheckResult } from '../lib/inventory';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, validateCartStock, forceCleanCart } = useCart();
  const [stockCheck, setStockCheck] = useState<StockCheckResult | null>(null);
  const [isCheckingStock, setIsCheckingStock] = useState(false);

  // Check stock when cart opens or cart changes
  useEffect(() => {
    const validateStock = async () => {
      if (!isOpen || cart.length === 0) {
        setStockCheck(null);
        return;
      }
      
      setIsCheckingStock(true);
      try {
        const result = await checkCartStock(cart);
        setStockCheck(result);
      } catch (err) {
        console.error('Error checking stock:', err);
      } finally {
        setIsCheckingStock(false);
      }
    };

    validateStock();
  }, [isOpen, cart]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-GN', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Cart Sidebar - Mobile Optimized */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-neutral-900 shadow-xl z-50 flex flex-col transition-all duration-300 transform animate-slide-in-right mobile-safe-area">
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between mobile-px mobile-py border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-neutral-50 to-white dark:from-neutral-800 dark:to-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                Mon Panier
              </h2>
              <p className="text-sm text-neutral-500">
                {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="touch-target p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all duration-200 border-2 border-transparent hover:border-accent active:scale-95"
            aria-label="Fermer le panier"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="grow overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-neutral-300 dark:text-neutral-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-neutral-500 dark:text-neutral-400 mb-4">Votre panier est vide</p>
              <button
                onClick={onClose}
                className="text-accent hover:underline font-medium border-2 border-transparent hover:border-accent px-4 py-2 rounded-lg transition-all"
              >
                Continuer vos achats
              </button>
            </div>
          ) : (
            <>
              {/* Stock Warning */}
              {isCheckingStock && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-blue-800">Vérification du stock...</p>
                  </div>
                </div>
              )}
              
              {stockCheck && !stockCheck.available && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900 mb-2">Articles non disponibles</p>
                      <ul className="space-y-1 text-xs text-red-800">
                        {stockCheck.outOfStockItems.map((item) => (
                          <li key={item.productId}>
                            <strong>{item.productName}</strong>: Demandé {item.requestedQuantity}, disponible {item.availableStock}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => {
                          stockCheck.outOfStockItems.forEach(item => {
                            const cartItems = cart.filter(cartItem => cartItem.product.id === item.productId);
                            cartItems.forEach(cartItem => {
                              removeFromCart(cartItem.product.id, cartItem.size, cartItem.color);
                            });
                          });
                          validateCartStock();
                        }}
                        className="mt-3 w-full text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Nettoyer les articles invalides
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-0">
                {cart.map((item) => (
                  <CartItem
                    key={`${item.product.id}-${item.size}-${item.color || 'no-color'}`}
                    item={item}
                    onUpdateQuantity={(quantity) =>
                      updateQuantity(item.product.id, item.size, quantity, item.color)
                    }
                    onRemove={() => removeFromCart(item.product.id, item.size, item.color)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-bold text-neutral-900 dark:text-white">
              <span>Total</span>
              <span>{formatPrice(getTotalPrice())}</span>
            </div>
            {stockCheck && !stockCheck.available ? (
              <button
                disabled
                className="block w-full py-3 bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-center font-semibold rounded-lg cursor-not-allowed border-2 border-neutral-400 dark:border-neutral-600"
              >
                Articles non disponibles
              </button>
            ) : (
              <Link
                href="/checkout"
                onClick={onClose}
                className="block w-full py-3 bg-black dark:bg-white text-white dark:text-black text-center font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors touch-target border-2 border-black dark:border-white"
              >
                Commander
              </Link>
            )}
            <button
              onClick={onClose}
              className="block w-full py-3 border-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-center font-medium rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors touch-target"
            >
              Continuer vos achats
            </button>
            
            {/* Debug buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  forceCleanCart();
                  setTimeout(() => validateCartStock(), 500);
                }}
                className="py-2 text-xs text-blue-600 hover:text-blue-800 text-center font-medium transition-colors border border-blue-300 rounded-lg"
              >
                🧹 Nettoyer
              </button>
              
              <button
                onClick={() => {
                  if (confirm('Vider complètement le panier ?')) {
                    cart.forEach(item => {
                      removeFromCart(item.product.id, item.size, item.color);
                    });
                    localStorage.removeItem('grandson-cart');
                    setStockCheck(null);
                  }
                }}
                className="py-2 text-xs text-red-600 hover:text-red-800 text-center font-medium transition-colors border border-red-300 rounded-lg"
              >
                🗑️ Vider
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
