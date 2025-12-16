import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { Product, Order, ApiResponse } from '../types';

const router = Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// ============ PRODUCTS ============

// Get all products
router.get('/products', asyncHandler(async (req: Request, res: Response) => {
  console.log('📦 Fetching all products...');

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(500, 'Failed to fetch products', 'DB_ERROR');
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

// Create product
router.post('/products', asyncHandler(async (req: Request, res: Response) => {
  const { name, price, category, stock, sizes, colors, images, description, is_active } = req.body;

  if (!name || !price || !category) {
    throw new AppError(400, 'Missing required fields', 'VALIDATION_ERROR');
  }

  console.log('📝 Creating product:', name);

  const productData = {
    name: name.trim(),
    description: description || 'No description',
    price: parseFloat(price),
    base_price: parseFloat(price),
    category,
    stock: parseInt(stock) || 0,
    total_stock: parseInt(stock) || 0,
    sizes: JSON.stringify(sizes || ['Unique']),
    colors: colors ? JSON.stringify(colors) : null,
    images: JSON.stringify(images || []),
    is_active: is_active !== false
  };

  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating product:', error);
    throw new AppError(500, 'Failed to create product', 'DB_ERROR');
  }

  console.log('✅ Product created:', data.id);

  const response: ApiResponse<Product> = {
    success: true,
    data
  };

  res.json(response);
}));

// Update product
router.put('/products/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`📝 Updating product ${id}...`);

  const updateData = { ...req.body };

  // Convert arrays to JSON strings
  if (updateData.sizes) {
    updateData.sizes = JSON.stringify(updateData.sizes);
  }
  if (updateData.colors) {
    updateData.colors = JSON.stringify(updateData.colors);
  }
  if (updateData.images) {
    updateData.images = JSON.stringify(updateData.images);
  }

  const { data, error } = await supabase
    .from('products')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Failed to update product', 'DB_ERROR');
  }

  console.log('✅ Product updated');

  const response: ApiResponse<Product> = {
    success: true,
    data
  };

  res.json(response);
}));

// Delete product
router.delete('/products/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting product ${id}...`);

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError(500, 'Failed to delete product', 'DB_ERROR');
  }

  console.log('✅ Product deleted');

  const response: ApiResponse<null> = {
    success: true
  };

  res.json(response);
}));

// ============ ORDERS ============

// Get all orders
router.get('/orders', asyncHandler(async (req: Request, res: Response) => {
  console.log('📋 Fetching all orders...');

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, price, images)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(500, 'Failed to fetch orders', 'DB_ERROR');
  }

  const response: ApiResponse<Order[]> = {
    success: true,
    data: data || []
  };

  res.json(response);
}));

// Update order
router.put('/orders/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`📝 Updating order ${id}...`);

  const { data, error } = await supabase
    .from('orders')
    .update(req.body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Failed to update order', 'DB_ERROR');
  }

  console.log('✅ Order updated');

  const response: ApiResponse<Order> = {
    success: true,
    data
  };

  res.json(response);
}));

// Delete order
router.delete('/orders/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(`🗑️ Deleting order ${id}...`);

  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    throw new AppError(500, 'Failed to delete order', 'DB_ERROR');
  }

  console.log('✅ Order deleted');

  const response: ApiResponse<null> = {
    success: true
  };

  res.json(response);
}));

export default router;
