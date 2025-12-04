import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { cacheManager } from '../lib/cacheManager';

interface UseProductCacheOptions {
  cacheKey: string;
  ttl?: number;
  fetchFn: () => Promise<Product[]>;
}

interface UseProductCacheReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Custom hook for managing product cache
 */
export function useProductCache({
  cacheKey,
  ttl = 5 * 60 * 1000, // 5 minutes default
  fetchFn,
}: UseProductCacheOptions): UseProductCacheReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async (useCache: boolean = true) => {
    try {
      setLoading(true);
      setError(null);

      // Try cache first
      if (useCache) {
        const cached = cacheManager.get<Product[]>(cacheKey);
        if (cached) {
          setProducts(cached);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const data = await fetchFn();
      setProducts(data);
      
      // Cache the results
      cacheManager.set(cacheKey, data, ttl);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Impossible de charger les produits');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [cacheKey, ttl, fetchFn]);

  const refetch = useCallback(async () => {
    await fetchProducts(false);
  }, [fetchProducts]);

  const clearCache = useCallback(() => {
    cacheManager.remove(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch,
    clearCache,
  };
}
