'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number, color?: string) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  forceCleanCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  updateCartWithFreshStock: (updatedProducts: Product[]) => void;
  validateCartStock: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('grandson-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const validCart = parsedCart.filter((item: CartItem) => 
          item.product && item.product.id && item.size && item.quantity > 0
        );
        setCart(validCart);
        if (validCart.length !== parsedCart.length) {
          localStorage.setItem('grandson-cart', JSON.stringify(validCart));
        }
      } catch (error) {
        localStorage.removeItem('grandson-cart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('grandson-cart', JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: Product, size: string, quantity: number = 1, color?: string) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item, but don't exceed stock
        const newCart = [...prevCart];
        const newQuantity = newCart[existingItemIndex].quantity + quantity;
        
        // Check if new quantity exceeds stock
        if (newQuantity > product.stock) {
          console.warn(`Cannot add more items. Stock limit: ${product.stock}`);
          // Set to maximum available stock
          newCart[existingItemIndex].quantity = product.stock;
        } else {
          newCart[existingItemIndex].quantity = newQuantity;
        }
        return newCart;
      } else {
        // Add new item, but don't exceed stock
        const validQuantity = Math.min(quantity, product.stock);
        return [...prevCart, { product, size, color, quantity: validQuantity }];
      }
    });
  };

  const removeFromCart = (productId: string, size: string, color?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('grandson-cart');
    console.log('🧹 Cart cleared completely');
  };

  const forceCleanCart = () => {
    setCart((prevCart) => {
      const validCart = prevCart.filter(item => 
        item.product && item.product.id && item.size && item.quantity > 0
      );
      return validCart;
    });
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const updateCartWithFreshStock = (updatedProducts: Product[]) => {
    setCart((prevCart) => 
      prevCart
        .map((item) => {
          const updatedProduct = updatedProducts.find(p => p.id === item.product.id);
          if (updatedProduct) {
            return {
              ...item,
              product: updatedProduct,
              quantity: Math.min(item.quantity, updatedProduct.stock),
            };
          }
          return item;
        })
        .filter(item => item.product.isActive && item.product.stock > 0 && item.quantity > 0)
    );
  };

  const validateCartStock = async () => {
    if (cart.length === 0) return;
    
    try {
      const productIds = [...new Set(cart.map(item => item.product.id))];
      const responses = await Promise.all(
        productIds.map(id => 
          fetch(`/api/products/${id}`)
            .then(res => res.json())
            .catch(() => null)
        )
      );
      
      const freshProducts = responses
        .filter(response => response?.success)
        .map(response => response.data.product);
      
      if (freshProducts.length > 0) {
        updateCartWithFreshStock(freshProducts);
      }
    } catch (error) {
      console.error('Error validating cart stock:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        forceCleanCart,
        getTotalItems,
        getTotalPrice,
        updateCartWithFreshStock,
        validateCartStock,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
