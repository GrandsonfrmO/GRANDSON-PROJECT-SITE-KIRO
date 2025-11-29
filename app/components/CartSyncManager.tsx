'use client';

import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import api from '../lib/api';

export default function CartSyncManager() {
  const { cart, validateCartStock } = useCart();

  useEffect(() => {
    // Validate cart stock when component mounts or cart changes
    if (cart.length > 0) {
      validateCartStock();
    }
  }, [cart.length]); // Only run when cart length changes to avoid infinite loops

  // Validate cart stock every 30 seconds if cart is not empty
  useEffect(() => {
    if (cart.length === 0) return;

    const interval = setInterval(() => {
      validateCartStock();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [cart.length, validateCartStock]);

  return null; // This component doesn't render anything
}