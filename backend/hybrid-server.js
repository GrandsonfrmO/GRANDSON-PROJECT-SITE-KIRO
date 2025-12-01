require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Initializing Hybrid Server...');
console.log('📡 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.252:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(null, true); // Allow anyway in development
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve static files with proper headers
app.use('/images', express.static('images', {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Serve uploads from both backend and frontend directories
const path = require('path');
const frontendUploadsPath = path.join(__dirname, '..', 'frontend', 'public', 'uploads');
const backendUploadsPath = path.join(__dirname, 'uploads');

// Try frontend uploads first (where Next.js stores them)
app.use('/uploads', express.static(frontendUploadsPath, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Fallback to backend uploads
app.use('/uploads', express.static(backendUploadsPath, {
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'public, max-age=31536000');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// ==================== EMAIL ROUTES ====================
// Import email routes early to avoid conflicts
try {
  const emailRoutes = require('./emailRoutes');
  app.use('/api/email', emailRoutes);
  console.log('✅ Email routes mounted successfully');
} catch (error) {
  console.error('❌ Error loading email routes:', error.message);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Grandson Project API is running' });
});

// Debug endpoint to list available images
app.get('/api/debug/images', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    const imageFiles = files.filter(file => 
      file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
    );
    
    res.json({
      success: true,
      uploadsDir,
      totalFiles: files.length,
      imageFiles: imageFiles.map(file => ({
        filename: file,
        url: `/uploads/${file}`,
        fullUrl: `${req.protocol}://${req.get('host')}/uploads/${file}`
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== AUTH ROUTES ====================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Login attempt for:', username);

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nom d\'utilisateur et mot de passe requis'
        }
      });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Database error: ${error.message}`);
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Nom d\'utilisateur ou mot de passe incorrect'
        }
      });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Nom d\'utilisateur ou mot de passe incorrect'
        }
      });
    }

    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username
      },
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    console.log('✅ Login successful for:', username);

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin.id,
          username: admin.username
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la connexion'
      }
    });
  }
});

// ==================== PRODUCT ROUTES ====================

// Transform product data from snake_case to camelCase
const transformProduct = (product) => {
  if (!product) return null;
  
  return {
    ...product,
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
};

// Get all products (public endpoint)
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching products...');
    
    const { category, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }
    
    console.log(`✅ Found ${products.length} products`);
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex).map(transformProduct);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: products.length,
          totalPages: Math.ceil(products.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des produits'
      }
    });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📦 Fetching product ${id}...`);

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Produit non trouvé'
          }
        });
      }
      console.error('❌ Error fetching product:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log(`✅ Found product: ${product.name} (Stock: ${product.stock})`);

    res.json({
      success: true,
      data: { product: transformProduct(product) }
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération du produit'
      }
    });
  }
});

// ==================== ADMIN MIDDLEWARE ====================

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token d\'authentification requis'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token invalide'
      }
    });
  }
};

// ==================== ADMIN AUTH ROUTES ====================

// GET /api/admin/verify - Verify admin token
app.get('/api/admin/verify', authenticateAdmin, async (req, res) => {
  try {
    // If we reach here, the token is valid (middleware passed)
    res.json({
      success: true,
      admin: {
        id: req.admin.id,
        username: req.admin.username
      }
    });
  } catch (error) {
    console.error('❌ Admin verify error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la vérification'
      }
    });
  }
});

// ==================== ADMIN PRODUCT ROUTES ====================

// GET /api/admin/products - Get all products for admin
app.get('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    console.log('📦 Admin fetching all products...');
    
    const { category, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;
    
    if (error) {
      console.error('❌ Error fetching admin products:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }
    
    console.log(`✅ Found ${products.length} products for admin`);
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = products.slice(startIndex, endIndex).map(transformProduct);
    
    res.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: products.length,
          totalPages: Math.ceil(products.length / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des produits'
      }
    });
  }
});

// POST /api/admin/products - Create new product
app.post('/api/admin/products', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, price, category, sizes, images, colors, stock } = req.body;

    console.log('📦 Creating new product:', name);

    // Validation - seuls name, price, category et stock sont obligatoires
    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nom, prix, catégorie et stock sont requis'
        }
      });
    }

    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le nom du produit doit contenir entre 3 et 100 caractères'
        }
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le prix doit être positif'
        }
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le stock ne peut pas être négatif'
        }
      });
    }

    // Create product
    const priceValue = parseFloat(price);
    const stockValue = parseInt(stock);
    
    // Préparer les images comme texte JSON (la colonne est de type text, pas jsonb)
    const imagesValue = Array.isArray(images) && images.length > 0 
      ? JSON.stringify(images) 
      : '[]';
    
    // Préparer les sizes comme texte JSON
    const sizesValue = sizes && sizes.length > 0 
      ? JSON.stringify(Array.isArray(sizes) ? sizes : [sizes])
      : '["Unique"]';
    
    // Préparer les colors comme texte JSON
    const colorsValue = colors && colors.length > 0 
      ? JSON.stringify(Array.isArray(colors) ? colors : [colors])
      : null;

    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name,
        description: description || 'Aucune description',
        price: priceValue,
        base_price: priceValue,
        category,
        sizes: sizesValue,
        images: imagesValue,
        colors: colorsValue,
        stock: stockValue,
        total_stock: stockValue,
        seller_id: 'admin', // Valeur par défaut pour seller_id (NOT NULL)
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating product:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Product created successfully:', product.id);

    res.status(201).json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('❌ Create product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la création du produit'
      }
    });
  }
});

// PUT /api/admin/products/:id - Update product
app.put('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, sizes, images, colors, stock, is_active } = req.body;

    console.log('📦 Updating product:', id);

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Produit non trouvé'
        }
      });
    }

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Validation
    if (name && (name.length < 3 || name.length > 100)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le nom du produit doit contenir entre 3 et 100 caractères'
        }
      });
    }

    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le prix doit être positif'
        }
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le stock ne peut pas être négatif'
        }
      });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (category !== undefined) updateData.category = category;
    if (sizes !== undefined) updateData.sizes = Array.isArray(sizes) ? sizes : [sizes];
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : (images ? [images] : []);
    if (colors !== undefined) updateData.colors = colors && colors.length > 0 ? (Array.isArray(colors) ? colors : [colors]) : null;
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update product
    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating product:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Product updated successfully:', product.id);

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('❌ Update product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la mise à jour du produit'
      }
    });
  }
});

// DELETE /api/admin/products/:id - Delete product
app.delete('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📦 Deleting product:', id);

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Produit non trouvé'
        }
      });
    }

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting product:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Product deleted successfully:', id);

    res.json({
      success: true,
      data: { message: 'Produit supprimé avec succès' }
    });
  } catch (error) {
    console.error('❌ Delete product error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la suppression du produit'
      }
    });
  }
});

// Test route after products
app.get('/api/admin/test-after-products', (req, res) => {
  res.json({ success: true, message: 'After products section' });
});

// ==================== ADMIN ORDERS ROUTES ====================

// Test route to verify this section loads
app.get('/api/admin/orders-test', (req, res) => {
  res.json({ success: true, message: 'Orders section loaded' });
});

// GET /api/admin/orders - Get all orders for admin (simplified version)
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    console.log('🛒 Admin fetching all orders...');
    
    // Simple query without complex joins
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Error fetching admin orders:', ordersError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: ordersError.message
        }
      });
    }

    // Transform orders to match expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      deliveryAddress: order.delivery_address,
      deliveryZone: order.delivery_zone,
      deliveryFee: order.delivery_fee,
      total: order.total_amount,
      status: order.status.toLowerCase(),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: [] // Will be populated later if needed
    }));
    
    console.log(`✅ Found ${transformedOrders.length} orders for admin`);
    
    res.json({
      success: true,
      data: {
        orders: transformedOrders
      }
    });
  } catch (error) {
    console.error('❌ Admin orders fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des commandes'
      }
    });
  }
});

// PUT /api/admin/orders/:id - Update order status
app.put('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`🔄 Admin updating order ${id} status to: ${status}`);

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Statut invalide'
        }
      });
    }

    // Map status for database (temporary mapping for enum compatibility)
    let dbStatus = status.toUpperCase();
    if (status.toLowerCase() === 'processing') {
      dbStatus = 'CONFIRMED'; // Temporary mapping
      console.log('⚠️ Mapping PROCESSING to CONFIRMED (temporary)');
    }
    if (status.toLowerCase() === 'shipped') {
      dbStatus = 'CONFIRMED'; // Temporary mapping
      console.log('⚠️ Mapping SHIPPED to CONFIRMED (temporary)');
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order status:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log(`✅ Order ${id} status updated to ${dbStatus}`);

    // Return the requested status (not the mapped one)
    res.json({
      success: true,
      data: {
        order: {
          ...data,
          status: status.toLowerCase() // Return the requested status
        }
      }
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la mise à jour du statut'
      }
    });
  }
});

// DELETE /api/admin/orders/:id - Delete order (admin only)
app.delete('/api/admin/orders/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🗑️ Admin deleting order:', id);

    // Check if order exists
    const { data: existingOrder, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Commande non trouvée'
        }
      });
    }

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Delete order (order_items will be deleted automatically due to CASCADE)
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting order:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Order deleted successfully:', id);

    res.json({
      success: true,
      data: { message: 'Commande supprimée avec succès' }
    });
  } catch (error) {
    console.error('❌ Delete order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la suppression de la commande'
      }
    });
  }
});

// ==================== ORDERS ROUTES ====================

// GET /api/orders - Get all orders from database
app.get('/api/orders', async (req, res) => {
  try {
    console.log('🛒 Fetching orders from database...');
    
    // Get orders from database
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: ordersError.message
        }
      });
    }

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            products (
              id,
              name,
              price
            )
          `)
          .eq('order_id', order.id);

        if (itemsError) {
          console.error('❌ Error fetching order items for order:', order.id, itemsError);
          return {
            id: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerPhone: order.customer_phone,
            total: order.total_amount,
            status: order.status.toLowerCase(),
            createdAt: order.created_at,
            items: []
          };
        }

        return {
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          total: order.total_amount,
          status: order.status.toLowerCase(),
          createdAt: order.created_at,
          items: orderItems.map(item => ({
            productName: item.products ? item.products.name : `Produit ID: ${item.product_id}`,
            quantity: item.quantity,
            price: item.price
          }))
        };
      })
    );
    
    console.log(`✅ Found ${ordersWithItems.length} orders in database`);
    
    res.json({
      success: true,
      orders: ordersWithItems
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des commandes'
      }
    });
  }
});

// POST /api/orders - Create new order
app.post('/api/orders', async (req, res) => {
  console.log('🚨 ORDER ROUTE HIT - NEW VERSION WITH STOCK MANAGEMENT');
  try {
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      deliveryAddress, 
      deliveryZone, 
      deliveryFee, 
      totalAmount, 
      items 
    } = req.body;

    console.log('🛒 Creating new order for:', customerName);
    console.log('🛒 ORDER DATA RECEIVED:', JSON.stringify({ customerName, items }, null, 2));

    // Validation
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryZone || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tous les champs requis doivent être remplis'
        }
      });
    }

    // Vérifier le stock avant de créer la commande
    console.log('📦 Checking stock availability...');
    console.log('📦 ITEMS TO CHECK:', JSON.stringify(items, null, 2));
    const stockCheckResults = [];
    
    for (const item of items) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, stock, is_active')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Produit ${item.productId} non trouvé`
          }
        });
      }

      if (!product.is_active) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'PRODUCT_INACTIVE',
            message: `Le produit ${product.name} n'est plus disponible`
          }
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}, Demandé: ${item.quantity}`
          }
        });
      }

      stockCheckResults.push({
        productId: product.id,
        name: product.name,
        currentStock: product.stock,
        requestedQuantity: item.quantity,
        newStock: product.stock - item.quantity
      });
    }

    console.log('✅ Stock check passed for all items');

    // Generate order number
    const orderNumber = `GS${Date.now().toString().slice(-6)}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        delivery_address: deliveryAddress,
        delivery_zone: deliveryZone,
        delivery_fee: parseFloat(deliveryFee) || 0,
        total_amount: parseFloat(totalAmount),
        status: 'PENDING'
      }])
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: orderError.message
        }
      });
    }

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      size: item.size,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      // Rollback order creation
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: itemsError.message
        }
      });
    }

    // Mettre à jour le stock des produits
    console.log('📦 Updating product stock...');
    const stockUpdatePromises = stockCheckResults.map(async (stockResult) => {
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: stockResult.newStock })
        .eq('id', stockResult.productId);

      if (updateError) {
        console.error(`❌ Error updating stock for product ${stockResult.productId}:`, updateError);
        throw new Error(`Erreur lors de la mise à jour du stock pour ${stockResult.name}`);
      }

      console.log(`✅ Stock updated for ${stockResult.name}: ${stockResult.currentStock} → ${stockResult.newStock}`);
    });

    try {
      await Promise.all(stockUpdatePromises);
      console.log('✅ All product stocks updated successfully');
    } catch (stockUpdateError) {
      console.error('❌ Error updating stock:', stockUpdateError);
      // Rollback order and items creation
      await supabase.from('order_items').delete().eq('order_id', order.id);
      await supabase.from('orders').delete().eq('id', order.id);
      return res.status(500).json({
        success: false,
        error: {
          code: 'STOCK_UPDATE_ERROR',
          message: stockUpdateError.message
        }
      });
    }

    console.log('✅ Order created successfully:', orderNumber);

    // Récupérer les détails des produits pour les emails
    const itemsWithProductDetails = await Promise.all(
      items.map(async (item) => {
        try {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, images, price')
            .eq('id', item.productId)
            .single();

          if (productError || !product) {
            return {
              name: `Produit ID: ${item.productId}`,
              quantity: item.quantity,
              price: item.price,
              image: null,
              size: item.size
            };
          }

          return {
            name: product.name,
            quantity: item.quantity,
            price: item.price,
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            size: item.size
          };
        } catch (error) {
          console.error('Error fetching product details:', error);
          return {
            name: `Produit ID: ${item.productId}`,
            quantity: item.quantity,
            price: item.price,
            image: null,
            size: item.size
          };
        }
      })
    );

    // Préparer les détails de la commande pour les emails
    const orderDetailsForEmail = {
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      deliveryAddress: order.delivery_address,
      deliveryZone: order.delivery_zone,
      deliveryFee: order.delivery_fee,
      total: order.total_amount,
      items: itemsWithProductDetails
    };

    // Envoyer les emails de notification automatiquement
    try {
      const axios = require('axios');
      
      // 1. Email de confirmation au client (si email fourni)
      if (order.customer_email) {
        await axios.post(`http://localhost:${PORT}/api/email/send-customer-confirmation`, {
          orderDetails: orderDetailsForEmail
        });
        console.log('✅ Customer confirmation email sent for order:', orderNumber);
      } else {
        console.log('⚠️ No customer email provided for order:', orderNumber);
      }

      // 2. Notification à l'admin
      await axios.post(`http://localhost:${PORT}/api/email/send-admin-notification`, {
        orderDetails: orderDetailsForEmail
      });
      console.log('✅ Admin notification email sent for order:', orderNumber);
    } catch (emailError) {
      console.error('⚠️ Error sending notification emails:', emailError.message);
      // Ne pas faire échouer la commande si les emails échouent
    }

    res.status(201).json({
      success: true,
      data: { 
        order: {
          ...order,
          orderNumber: order.order_number
        }
      }
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la création de la commande'
      }
    });
  }
});

// GET /api/orders/:orderNumber - Get order by order number
app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    console.log('🔍 Fetching order:', orderNumber);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Commande non trouvée'
          }
        });
      }
      console.error('❌ Error fetching order:', orderError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: orderError.message
        }
      });
    }

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products (
          id,
          name,
          images,
          price
        )
      `)
      .eq('order_id', order.id);

    if (itemsError) {
      console.error('❌ Error fetching order items:', itemsError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: itemsError.message
        }
      });
    }

    // Transform the order data
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      deliveryAddress: order.delivery_address,
      deliveryZone: order.delivery_zone,
      deliveryFee: order.delivery_fee,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: orderItems.map(item => ({
        id: item.id,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        product: item.products
      }))
    };

    console.log('✅ Order found:', orderNumber);

    res.json({
      success: true,
      data: { order: transformedOrder }
    });
  } catch (error) {
    console.error('❌ Get order error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération de la commande'
      }
    });
  }
});

// PUT /api/orders/:id - Update order status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating order ${id} to status: ${status}`);
    
    // Récupérer les détails de la commande depuis la base de données
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Commande non trouvée'
          }
        });
      }
      throw new Error(`Database error: ${orderError.message}`);
    }

    // Valider le statut et mapper les statuts non supportés
    const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const dbSupportedStatuses = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED'];
    const upperStatus = status.toUpperCase();
    
    if (!validStatuses.includes(upperStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Statut invalide. Statuts valides: ${validStatuses.join(', ')}`
        }
      });
    }

    // Mapper les statuts non supportés temporairement
    let dbStatus = upperStatus;
    if (upperStatus === 'PROCESSING') {
      dbStatus = 'CONFIRMED'; // PROCESSING -> CONFIRMED temporairement
      console.log('⚠️  Mapping PROCESSING to CONFIRMED (temporary fix)');
    } else if (upperStatus === 'SHIPPED') {
      dbStatus = 'CONFIRMED'; // SHIPPED -> CONFIRMED temporairement  
      console.log('⚠️  Mapping SHIPPED to CONFIRMED (temporary fix)');
    }

    // Mettre à jour le statut de la commande
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: dbStatus })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating order status:', updateError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: updateError.message
        }
      });
    }

    // Si le statut est "CONFIRMED" ou "VALIDATED", envoyer l'email de validation
    if (status.toUpperCase() === 'CONFIRMED' || status.toUpperCase() === 'VALIDATED') {
      try {
        // Récupérer les articles de la commande
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            products (
              id,
              name,
              price
            )
          `)
          .eq('order_id', id);

        if (!itemsError && order.customer_email) {
          const orderDetailsForEmail = {
            orderNumber: order.order_number,
            customerName: order.customer_name,
            customerEmail: order.customer_email,
            customerPhone: order.customer_phone,
            deliveryAddress: order.delivery_address,
            deliveryZone: order.delivery_zone,
            deliveryFee: order.delivery_fee,
            total: order.total_amount,
            items: orderItems.map(item => ({
              name: item.products ? item.products.name : `Produit ID: ${item.product_id}`,
              quantity: item.quantity,
              price: item.price
            }))
          };

          const axios = require('axios');
          await axios.post(`http://localhost:${PORT}/api/email/send-validation-confirmation`, {
            orderDetails: orderDetailsForEmail
          });
          console.log('✅ Validation email sent for order:', order.order_number);
        }
      } catch (emailError) {
        console.error('⚠️ Error sending validation email:', emailError.message);
        // Ne pas faire échouer la mise à jour si l'email échoue
      }
    }
    
    res.json({
      success: true,
      message: `Commande ${id} mise à jour vers ${status}`,
      order: {
        id: updatedOrder.id,
        status: upperStatus, // Retourner le statut demandé, pas le statut mappé
        actualDbStatus: updatedOrder.status, // Pour debug
        updatedAt: updatedOrder.updated_at || new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la mise à jour de la commande'
      }
    });
  }
});



// ==================== ADMIN DELIVERY ZONES ROUTES ====================

// GET /api/admin/delivery-zones - Get all delivery zones for admin
app.get('/api/admin/delivery-zones', authenticateAdmin, async (req, res) => {
  try {
    console.log('🚚 Admin fetching delivery zones...');
    
    const { data: zones, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching admin delivery zones:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }
    
    console.log(`✅ Found ${zones.length} delivery zones for admin`);
    
    res.json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error('❌ Admin delivery zones fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des zones de livraison'
      }
    });
  }
});

// POST /api/admin/delivery-zones - Create delivery zone
app.post('/api/admin/delivery-zones', authenticateAdmin, async (req, res) => {
  try {
    const { name, price, is_active = true } = req.body;

    console.log('🚚 Creating delivery zone:', name);

    // Validation
    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nom et prix requis'
        }
      });
    }

    if (price < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le prix ne peut pas être négatif'
        }
      });
    }

    // Create delivery zone
    const { data: zone, error } = await supabase
      .from('delivery_zones')
      .insert([{
        name,
        price: parseFloat(price),
        is_active
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating delivery zone:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Delivery zone created successfully:', zone.id);

    res.status(201).json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('❌ Create delivery zone error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la création de la zone de livraison'
      }
    });
  }
});

// PUT /api/admin/delivery-zones/:id - Update delivery zone
app.put('/api/admin/delivery-zones/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, is_active } = req.body;

    console.log('🚚 Updating delivery zone:', id);

    // Check if zone exists
    const { data: existingZone, error: fetchError } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Zone de livraison non trouvée'
        }
      });
    }

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le prix ne peut pas être négatif'
        }
      });
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (is_active !== undefined) updateData.is_active = is_active;

    // Update delivery zone
    const { data: zone, error } = await supabase
      .from('delivery_zones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating delivery zone:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Delivery zone updated successfully:', zone.id);

    res.json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('❌ Update delivery zone error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la mise à jour de la zone de livraison'
      }
    });
  }
});

// DELETE /api/admin/delivery-zones/:id - Delete delivery zone
app.delete('/api/admin/delivery-zones/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('🚚 Deleting delivery zone:', id);

    // Check if zone exists
    const { data: existingZone, error: fetchError } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Zone de livraison non trouvée'
        }
      });
    }

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Delete delivery zone
    const { error } = await supabase
      .from('delivery_zones')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting delivery zone:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Delivery zone deleted successfully:', id);

    res.json({
      success: true,
      data: { message: 'Zone de livraison supprimée avec succès' }
    });
  } catch (error) {
    console.error('❌ Delete delivery zone error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la suppression de la zone de livraison'
      }
    });
  }
});

// ==================== DELIVERY ZONES ROUTES ====================

// GET /api/delivery-zones - Get all active delivery zones
app.get('/api/delivery-zones', async (req, res) => {
  try {
    console.log('🚚 Fetching delivery zones...');
    
    const { data: zones, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching delivery zones:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }
    
    console.log(`✅ Found ${zones.length} delivery zones`);
    
    res.json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des zones de livraison'
      }
    });
  }
});

// ==================== ADMIN SETTINGS ROUTES ====================

// PUT /api/admin/settings - Update settings
app.put('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    console.log('⚙️ Admin updating settings...');

    // Update each setting
    const updatePromises = Object.entries(settings).map(async ([key, value]) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value: typeof value === 'string' ? value : JSON.stringify(value)
        });
      
      if (error) {
        throw new Error(`Error updating setting ${key}: ${error.message}`);
      }
    });

    await Promise.all(updatePromises);

    console.log('✅ Settings updated successfully');

    res.json({
      success: true,
      data: { message: 'Paramètres mis à jour avec succès' }
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la mise à jour des paramètres'
      }
    });
  }
});

// POST /api/admin/settings/reset - Reset settings to default
app.post('/api/admin/settings/reset', authenticateAdmin, async (req, res) => {
  try {
    console.log('⚙️ Admin resetting settings to default...');

    // Delete all current settings
    const { error: deleteError } = await supabase
      .from('site_settings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      throw new Error(`Error deleting settings: ${deleteError.message}`);
    }

    // Insert default settings
    const defaultSettings = [
      { key: 'site_name', value: '"Grandson Project"' },
      { key: 'contact_phone', value: '"+224662662958"' },
      { key: 'contact_email', value: '"contact@grandsonproject.com"' },
      { key: 'delivery_info', value: '"Livraison disponible dans toute la région de Conakry"' }
    ];

    const { error: insertError } = await supabase
      .from('site_settings')
      .insert(defaultSettings);

    if (insertError) {
      throw new Error(`Error inserting default settings: ${insertError.message}`);
    }

    // Fetch updated settings
    const { data: settings, error: fetchError } = await supabase
      .from('site_settings')
      .select('*');

    if (fetchError) {
      throw new Error(`Error fetching settings: ${fetchError.message}`);
    }

    const settingsObj = {};
    settings.forEach(setting => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });

    console.log('✅ Settings reset successfully');

    res.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('❌ Reset settings error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la réinitialisation des paramètres'
      }
    });
  }
});

// ==================== SETTINGS ROUTES ====================

app.get('/api/settings', async (req, res) => {
  try {
    console.log('⚙️ Fetching settings...');
    
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching settings:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }
    
    const settingsObj = {};
    settings.forEach(setting => {
      try {
        settingsObj[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObj[setting.key] = setting.value;
      }
    });
    
    console.log(`✅ Found ${settings.length} settings`);
    
    res.json({
      success: true,
      data: settingsObj
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des paramètres'
      }
    });
  }
});

// ==================== ADMIN PAGES ROUTES ====================

// GET /api/admin/pages - Get all pages for admin
app.get('/api/admin/pages', authenticateAdmin, async (req, res) => {
  try {
    console.log('📄 Admin fetching pages...');
    
    const { data: pages, error } = await supabase
      .from('page_contents')
      .select('*')
      .order('page_key', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching admin pages:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }
    
    console.log(`✅ Found ${pages.length} pages for admin`);
    
    res.json({
      success: true,
      data: { pages }
    });
  } catch (error) {
    console.error('❌ Admin pages fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la récupération des pages'
      }
    });
  }
});

// PUT /api/admin/pages/:pageKey/toggle - Toggle page status
app.put('/api/admin/pages/:pageKey/toggle', authenticateAdmin, async (req, res) => {
  try {
    const { pageKey } = req.params;
    
    console.log('📄 Toggling page status:', pageKey);

    // Get current page
    const { data: page, error: fetchError } = await supabase
      .from('page_contents')
      .select('*')
      .eq('page_key', pageKey)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Page non trouvée'
        }
      });
    }

    if (fetchError) {
      throw new Error(`Database error: ${fetchError.message}`);
    }

    // Toggle status
    const { data: updatedPage, error: updateError } = await supabase
      .from('page_contents')
      .update({ is_active: !page.is_active })
      .eq('page_key', pageKey)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error toggling page status:', updateError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: updateError.message
        }
      });
    }

    console.log('✅ Page status toggled successfully:', pageKey);

    res.json({
      success: true,
      data: updatedPage
    });
  } catch (error) {
    console.error('❌ Toggle page status error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la modification du statut de la page'
      }
    });
  }
});

// POST /api/admin/pages - Create or update page
app.post('/api/admin/pages', authenticateAdmin, async (req, res) => {
  try {
    const { pageKey, title, subtitle, content, isActive = true } = req.body;

    console.log('📄 Creating/updating page:', pageKey);

    // Validation
    if (!pageKey || !title || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Page key, titre et contenu requis'
        }
      });
    }

    // Upsert page
    const { data: page, error } = await supabase
      .from('page_contents')
      .upsert({
        page_key: pageKey,
        title,
        subtitle: subtitle || null,
        content: typeof content === 'string' ? content : JSON.stringify(content),
        is_active: isActive
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating/updating page:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        }
      });
    }

    console.log('✅ Page created/updated successfully:', pageKey);

    res.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('❌ Create/update page error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la création/mise à jour de la page'
      }
    });
  }
});

// ============ CUSTOMIZATION GALLERY ROUTES ============

// GET /api/customization-gallery - Public endpoint
app.get('/api/customization-gallery', async (req, res) => {
  try {
    const { data: items, error } = await supabase
      .from('customization_gallery')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('❌ Error fetching gallery:', error);
      return res.json({ success: true, data: { items: [] } });
    }

    res.json({ success: true, data: { items: items || [] } });
  } catch (error) {
    console.error('❌ Gallery error:', error);
    res.json({ success: true, data: { items: [] } });
  }
});

// POST /api/admin/customization-gallery - Admin create/update
app.post('/api/admin/customization-gallery', authenticateAdmin, async (req, res) => {
  try {
    const { id, title, subtitle, image_url, display_order, is_active } = req.body;

    if (!title || !image_url) {
      return res.status(400).json({
        success: false,
        error: { message: 'Titre et image requis' }
      });
    }

    const itemData = {
      title,
      subtitle: subtitle || '',
      image_url,
      display_order: display_order || 0,
      is_active: is_active !== false,
      updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
      // Update
      const { data, error } = await supabase
        .from('customization_gallery')
        .update(itemData)
        .eq('id', id)
        .select()
        .single();
      result = { data, error };
    } else {
      // Insert
      const { data, error } = await supabase
        .from('customization_gallery')
        .insert([itemData])
        .select()
        .single();
      result = { data, error };
    }

    if (result.error) {
      console.error('❌ Error saving gallery item:', result.error);
      return res.status(500).json({ success: false, error: { message: result.error.message } });
    }

    res.json({ success: true, data: result.data });
  } catch (error) {
    console.error('❌ Save gallery error:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// DELETE /api/admin/customization-gallery/:id - Admin delete
app.delete('/api/admin/customization-gallery/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('customization_gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting gallery item:', error);
      return res.status(500).json({ success: false, error: { message: error.message } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Delete gallery error:', error);
    res.status(500).json({ success: false, error: { message: 'Erreur serveur' } });
  }
});

// ============ MARKETING ROUTES - DISABLED ============
// Marketing routes have been removed

app.listen(PORT, () => {
  console.log(`🚀 Hybrid Server running on http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/login`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`\n🎯 Admin Login Credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: admin123\n`);
});