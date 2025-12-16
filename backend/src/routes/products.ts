import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
import { Product, ApiResponse } from '../types';

const router = Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all active products
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('📦 Fetching products...');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching products:', error);
    throw new AppError(500, 'Failed to fetch products', 'DB_ERROR');
  }

  // Parse JSON fields
  const products = (data || []).map(product => ({
    ...product,
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
    colors: product.colors ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors) : null,
    images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images
  }));

  const response: ApiResponse<Product[]> = {
    success: true,
    data: products
  };

  res.json(response);
}));

// Get single product
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`📦 Fetching product ${id}...`);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Product not found', 'NOT_FOUND');
  }

  // Parse JSON fields
  const product = {
    ...data,
    sizes: typeof data.sizes === 'string' ? JSON.parse(data.sizes) : data.sizes,
    colors: data.colors ? (typeof data.colors === 'string' ? JSON.parse(data.colors) : data.colors) : null,
    images: typeof data.images === 'string' ? JSON.parse(data.images) : data.images
  };

  const response: ApiResponse<Product> = {
    success: true,
    data: product
  };

  res.json(response);
}));

// Search products
router.get('/search/:query', asyncHandler(async (req: Request, res: Response) => {
  const { query } = req.params;
  console.log(`🔍 Searching products for: ${query}`);

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(500, 'Search failed', 'DB_ERROR');
  }

  const products = (data || []).map(product => ({
    ...product,
    sizes: typeof product.sizes === 'string' ? JSON.parse(product.sizes) : product.sizes,
    colors: product.colors ? (typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors) : null,
    images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images
  }));

  const response: ApiResponse<Product[]> = {
    success: true,
    data: products
  };

  res.json(response);
}));

export default router;
