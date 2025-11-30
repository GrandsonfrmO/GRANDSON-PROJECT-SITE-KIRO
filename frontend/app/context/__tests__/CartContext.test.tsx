import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from '../CartContext';
import { Product } from '@/app/types';

const mockProduct: Product = {
  id: '1',
  name: 'Test T-Shirt',
  description: 'A test product',
  price: 50000,
  category: 'T-Shirts',
  sizes: ['S', 'M', 'L'],
  images: ['/test-image.jpg'],
  stock: 10,
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

describe('CartContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adds items to cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 'M', 1);
    });

    expect(result.current.cart).toHaveLength(1);
    expect(result.current.getTotalItems()).toBe(1);
  });

  it('updates item quantity in cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 'M', 1);
      result.current.updateQuantity(mockProduct.id, 'M', 3);
    });

    expect(result.current.cart[0].quantity).toBe(3);
    expect(result.current.getTotalItems()).toBe(3);
  });

  it('removes items from cart', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 'M', 1);
      result.current.removeFromCart(mockProduct.id, 'M');
    });

    expect(result.current.cart).toHaveLength(0);
    expect(result.current.getTotalItems()).toBe(0);
  });

  it('calculates total price correctly', () => {
    const { result } = renderHook(() => useCart(), {
      wrapper: CartProvider,
    });

    act(() => {
      result.current.addToCart(mockProduct, 'M', 2);
    });

    expect(result.current.getTotalPrice()).toBe(100000);
  });
});
