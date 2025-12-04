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
  'https://grandson-project.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

console.log('🔒 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      console.log('✅ CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log(`✅ CORS: Allowing request from: ${origin}`);
      callback(null, true);
    } else {
      // In production, be more strict
      if (process.env.NODE_ENV === 'production') {
        console.error(`❌ CORS: Blocked request from unauthorized origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      } else {
        // In development, allow but warn
        console.warn(`⚠️  CORS: Allowing request from non-whitelisted origin (dev mode): ${origin}`);
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.error('🔒 Auth failed: No authorization header');
    return res.status(401).json({
      success: false,
      error: {
        code: 'NO_TOKEN',
        message: 'Authentication token required. Please log in again.',
        timestamp: new Date().toISOString()
      }
    });
  }

  const token = authHeader.replace('Bearer ', '');
  
  if (!token || token === authHeader) {
    console.error('🔒 Auth failed: Invalid authorization header format');
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Invalid authorization header format. Expected: Bearer <token>',
        timestamp: new Date().toISOString()
      }
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
    const decoded = jwt.verify(token, jwtSecret);
    
    console.log(`✅ Auth successful for user: ${decoded.username} (ID: ${decoded.id})`);
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('🔒 Auth failed:', error.message);
    
    let errorCode = 'INVALID_TOKEN';
    let errorMessage = 'Invalid or expired authentication token. Please log in again.';
    
    if (error.name === 'TokenExpiredError') {
      errorCode = 'TOKEN_EXPIRED';
      errorMessage = 'Authentication token has expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      errorCode = 'INVALID_TOKEN';
      errorMessage = 'Invalid authentication token. Please log in again.';
    } else if (error.name === 'NotBeforeError') {
      errorCode = 'TOKEN_NOT_ACTIVE';
      errorMessage = 'Authentication token is not yet active.';
    }
    
    return res.status(401).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        timestamp: new Date().toISOString()
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

// Helper function to get timestamp
const getTimestamp = () => new Date().toISOString();

// POST /api/orders - Create new order
app.post('/api/orders', async (req, res) => {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${getTimestamp()}] 🛒 Backend POST /api/orders - START`);
  console.log(`${'='.repeat(80)}`);
  
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

    console.log(`[${getTimestamp()}] 📝 Order creation request received`);
    console.log(`[${getTimestamp()}] 👤 Customer: ${customerName}`);
    console.log(`[${getTimestamp()}] 📞 Phone: ${customerPhone}`);
    console.log(`[${getTimestamp()}] 📧 Email: ${customerEmail || 'Not provided'}`);
    console.log(`[${getTimestamp()}] 📍 Delivery zone: ${deliveryZone}`);
    console.log(`[${getTimestamp()}] 💰 Total amount: ${totalAmount}`);
    console.log(`[${getTimestamp()}] 📦 Items count: ${items?.length || 0}`);
    console.log(`[${getTimestamp()}] 📄 Full request body:`, JSON.stringify(req.body, null, 2));

    // Validation
    console.log(`[${getTimestamp()}] 🔍 Validating request data...`);
    
    // Check for missing required fields
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryZone || !items || items.length === 0) {
      console.error(`[${getTimestamp()}] ❌ Validation failed - Missing required fields`);
      console.error(`[${getTimestamp()}] 📄 Validation details:`, {
        hasCustomerName: !!customerName,
        hasCustomerPhone: !!customerPhone,
        hasDeliveryAddress: !!deliveryAddress,
        hasDeliveryZone: !!deliveryZone,
        hasItems: !!items,
        itemsLength: items?.length || 0
      });
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      // Provide specific error messages in French
      let errorMessage = 'Tous les champs requis doivent être remplis';
      if (!customerName) errorMessage = 'Le nom du client est requis';
      else if (!customerPhone) errorMessage = 'Le numéro de téléphone est requis';
      else if (!deliveryAddress) errorMessage = 'L\'adresse de livraison est requise';
      else if (!deliveryZone) errorMessage = 'La zone de livraison est requise';
      else if (!items || items.length === 0) errorMessage = 'Le panier ne peut pas être vide';
      
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errorMessage
        }
      });
    }
    
    // Validate phone number format (French format)
    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
    if (!phoneRegex.test(customerPhone.replace(/\s/g, ''))) {
      console.error(`[${getTimestamp()}] ❌ Validation failed - Invalid phone format: ${customerPhone}`);
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le numéro de téléphone doit être au format français valide (ex: 06 12 34 56 78)'
        }
      });
    }
    
    // Validate email format if provided
    if (customerEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        console.error(`[${getTimestamp()}] ❌ Validation failed - Invalid email format: ${customerEmail}`);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'L\'adresse email n\'est pas valide'
          }
        });
      }
    }
    
    // Validate items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        console.error(`[${getTimestamp()}] ❌ Validation failed - Missing productId for item ${i}`);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `L'article ${i + 1} n'a pas d'identifiant de produit`
          }
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        console.error(`[${getTimestamp()}] ❌ Validation failed - Invalid quantity for item ${i}`);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `La quantité de l'article ${i + 1} doit être supérieure à zéro`
          }
        });
      }
      if (!item.price || item.price <= 0) {
        console.error(`[${getTimestamp()}] ❌ Validation failed - Invalid price for item ${i}`);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Le prix de l'article ${i + 1} doit être supérieur à zéro`
          }
        });
      }
    }
    
    // Validate total amount
    if (!totalAmount || totalAmount <= 0) {
      console.error(`[${getTimestamp()}] ❌ Validation failed - Invalid total amount: ${totalAmount}`);
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Le montant total doit être supérieur à zéro'
        }
      });
    }
    
    console.log(`[${getTimestamp()}] ✅ Validation passed`);

    // Vérifier le stock avant de créer la commande
    console.log(`[${getTimestamp()}] 📦 Checking stock availability for ${items.length} items...`);
    console.log(`[${getTimestamp()}] 📦 Items to check:`, JSON.stringify(items, null, 2));
    const stockCheckResults = [];
    
    for (const item of items) {
      console.log(`[${getTimestamp()}] 🔍 Checking product: ${item.productId}`);
      
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, stock, is_active')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        console.error(`[${getTimestamp()}] ❌ Product not found: ${item.productId}`);
        console.error(`[${getTimestamp()}] 📄 Database error:`, productError);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Le produit demandé n'existe pas ou n'est plus disponible. Veuillez actualiser votre panier.`
          }
        });
      }

      console.log(`[${getTimestamp()}] 📦 Product found: ${product.name} (Stock: ${product.stock}, Active: ${product.is_active})`);

      if (!product.is_active) {
        console.error(`[${getTimestamp()}] ❌ Product inactive: ${product.name}`);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return res.status(400).json({
          success: false,
          error: {
            code: 'PRODUCT_INACTIVE',
            message: `Le produit "${product.name}" n'est plus disponible à la vente. Veuillez le retirer de votre panier.`
          }
        });
      }

      if (product.stock < item.quantity) {
        console.error(`[${getTimestamp()}] ❌ Insufficient stock for: ${product.name}`);
        console.error(`[${getTimestamp()}] 📊 Available: ${product.stock}, Requested: ${item.quantity}`);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        
        // Provide helpful message based on stock availability
        let stockMessage;
        if (product.stock === 0) {
          stockMessage = `Le produit "${product.name}" est en rupture de stock. Veuillez le retirer de votre panier.`;
        } else if (product.stock === 1) {
          stockMessage = `Il ne reste qu'un seul exemplaire de "${product.name}" en stock. Veuillez ajuster la quantité dans votre panier.`;
        } else {
          stockMessage = `Stock insuffisant pour "${product.name}". Il ne reste que ${product.stock} exemplaire${product.stock > 1 ? 's' : ''} en stock. Veuillez ajuster la quantité dans votre panier.`;
        }
        
        return res.status(400).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: stockMessage,
            details: {
              productName: product.name,
              availableStock: product.stock,
              requestedQuantity: item.quantity
            }
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
      
      console.log(`[${getTimestamp()}] ✅ Stock check passed for: ${product.name}`);
    }

    console.log(`[${getTimestamp()}] ✅ Stock check passed for all ${items.length} items`);
    console.log(`[${getTimestamp()}] 📊 Stock check results:`, JSON.stringify(stockCheckResults, null, 2));

    // Generate order number
    const orderNumber = `GS${Date.now().toString().slice(-6)}`;
    console.log(`[${getTimestamp()}] 🎫 Generated order number: ${orderNumber}`);

    // Create order
    console.log(`[${getTimestamp()}] 💾 Creating order in database...`);
    const orderData = {
      order_number: orderNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      delivery_address: deliveryAddress,
      delivery_zone: deliveryZone,
      delivery_fee: parseFloat(deliveryFee) || 0,
      total_amount: parseFloat(totalAmount),
      status: 'PENDING'
    };
    console.log(`[${getTimestamp()}] 📄 Order data:`, JSON.stringify(orderData, null, 2));
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error(`[${getTimestamp()}] ❌ Error creating order in database`);
      console.error(`[${getTimestamp()}] 📄 Database error:`, orderError);
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      // Provide user-friendly error message
      let errorMessage = 'Erreur lors de la création de la commande. Veuillez réessayer.';
      if (orderError.code === '23505') {
        // Duplicate key error
        errorMessage = 'Une erreur s\'est produite lors de la génération du numéro de commande. Veuillez réessayer.';
      } else if (orderError.code === '23503') {
        // Foreign key violation
        errorMessage = 'Une erreur s\'est produite avec les données de la commande. Veuillez vérifier votre panier et réessayer.';
      }
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: errorMessage
        }
      });
    }
    
    console.log(`[${getTimestamp()}] ✅ Order created in database with ID: ${order.id}`);

    // Create order items
    console.log(`[${getTimestamp()}] 📦 Creating ${items.length} order items...`);
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      size: item.size,
      quantity: parseInt(item.quantity),
      price: parseFloat(item.price)
    }));
    console.log(`[${getTimestamp()}] 📄 Order items data:`, JSON.stringify(orderItems, null, 2));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error(`[${getTimestamp()}] ❌ Error creating order items`);
      console.error(`[${getTimestamp()}] 📄 Database error:`, itemsError);
      console.log(`[${getTimestamp()}] 🔄 Rolling back order creation...`);
      
      // Rollback order creation
      try {
        const { error: rollbackError } = await supabase.from('orders').delete().eq('id', order.id);
        if (rollbackError) {
          console.error(`[${getTimestamp()}] ❌ Error during rollback:`, rollbackError);
        } else {
          console.log(`[${getTimestamp()}] ✅ Order rollback completed successfully`);
        }
      } catch (rollbackException) {
        console.error(`[${getTimestamp()}] ❌ Exception during rollback:`, rollbackException);
      }
      
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'ORDER_CREATION_FAILED',
          message: 'Erreur lors de la création de la commande. Veuillez réessayer ou contacter le support si le problème persiste.'
        }
      });
    }
    
    console.log(`[${getTimestamp()}] ✅ Order items created successfully`);

    // Mettre à jour le stock des produits
    console.log(`[${getTimestamp()}] 📦 Updating product stock for ${stockCheckResults.length} products...`);
    const stockUpdatePromises = stockCheckResults.map(async (stockResult) => {
      console.log(`[${getTimestamp()}] 🔄 Updating stock for ${stockResult.name}: ${stockResult.currentStock} → ${stockResult.newStock}`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: stockResult.newStock })
        .eq('id', stockResult.productId);

      if (updateError) {
        console.error(`[${getTimestamp()}] ❌ Error updating stock for product ${stockResult.productId}`);
        console.error(`[${getTimestamp()}] 📄 Database error:`, updateError);
        throw new Error(`Erreur lors de la mise à jour du stock pour ${stockResult.name}`);
      }

      console.log(`[${getTimestamp()}] ✅ Stock updated for ${stockResult.name}`);
    });

    try {
      await Promise.all(stockUpdatePromises);
      console.log(`[${getTimestamp()}] ✅ All product stocks updated successfully`);
    } catch (stockUpdateError) {
      console.error(`[${getTimestamp()}] ❌ Error updating stock`);
      console.error(`[${getTimestamp()}] 📄 Error:`, stockUpdateError);
      console.log(`[${getTimestamp()}] 🔄 Rolling back order and items creation...`);
      
      // Rollback order and items creation with proper error handling
      try {
        const { error: itemsRollbackError } = await supabase.from('order_items').delete().eq('order_id', order.id);
        if (itemsRollbackError) {
          console.error(`[${getTimestamp()}] ❌ Error rolling back order items:`, itemsRollbackError);
        } else {
          console.log(`[${getTimestamp()}] ✅ Order items rollback completed`);
        }
        
        const { error: orderRollbackError } = await supabase.from('orders').delete().eq('id', order.id);
        if (orderRollbackError) {
          console.error(`[${getTimestamp()}] ❌ Error rolling back order:`, orderRollbackError);
        } else {
          console.log(`[${getTimestamp()}] ✅ Order rollback completed`);
        }
      } catch (rollbackException) {
        console.error(`[${getTimestamp()}] ❌ Exception during rollback:`, rollbackException);
      }
      
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'STOCK_UPDATE_FAILED',
          message: 'Erreur lors de la mise à jour du stock. La commande n\'a pas été créée. Veuillez réessayer.'
        }
      });
    }

    console.log(`[${getTimestamp()}] ✅ Order created successfully: ${orderNumber}`);

    // Récupérer les détails des produits pour les emails
    console.log(`[${getTimestamp()}] 📧 Fetching product details for email notifications...`);
    const itemsWithProductDetails = await Promise.all(
      items.map(async (item) => {
        try {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('id, name, images, price')
            .eq('id', item.productId)
            .single();

          if (productError || !product) {
            console.log(`[${getTimestamp()}] ⚠️  Could not fetch product details for: ${item.productId}`);
            return {
              name: `Produit ID: ${item.productId}`,
              quantity: item.quantity,
              price: item.price,
              image: null,
              size: item.size
            };
          }

          // Parse images if it's a string
          let images = product.images;
          if (typeof images === 'string') {
            try {
              images = JSON.parse(images);
            } catch (e) {
              images = [];
            }
          }
          
          return {
            name: product.name,
            quantity: item.quantity,
            price: item.price,
            image: images && images.length > 0 ? images[0] : null,
            size: item.size
          };
        } catch (error) {
          console.error(`[${getTimestamp()}] ❌ Error fetching product details for ${item.productId}:`, error);
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
    console.log(`[${getTimestamp()}] ✅ Product details fetched for email`);

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
    console.log(`[${getTimestamp()}] 📧 Sending email notifications...`);
    const emailService = require('./emailService');
    
    // 1. Email de confirmation au client (si email fourni)
    if (order.customer_email) {
      try {
        console.log(`[${getTimestamp()}] 📧 Attempting to send customer confirmation email to: ${order.customer_email}`);
        const customerEmailResult = await emailService.sendCustomerConfirmation(orderDetailsForEmail);
        
        if (customerEmailResult.success) {
          console.log(`[${getTimestamp()}] ✅ Customer confirmation email sent successfully for order: ${orderNumber}`);
          console.log(`[${getTimestamp()}] 📧 Message ID: ${customerEmailResult.messageId}`);
        } else {
          console.error(`[${getTimestamp()}] ⚠️  Customer confirmation email failed: ${customerEmailResult.error}`);
        }
      } catch (emailError) {
        console.error(`[${getTimestamp()}] ❌ Exception sending customer confirmation:`, emailError.message);
        console.error(`[${getTimestamp()}] 📄 Stack trace:`, emailError.stack);
        // Ne pas faire échouer la commande si l'email échoue
      }
    } else {
      console.log(`[${getTimestamp()}] ⚠️  No customer email provided for order: ${orderNumber}`);
    }

    // 2. Notification à l'admin
    try {
      console.log(`[${getTimestamp()}] 📧 Attempting to send admin notification email...`);
      const adminEmailResult = await emailService.sendAdminNotification(orderDetailsForEmail);
      
      if (adminEmailResult.success) {
        console.log(`[${getTimestamp()}] ✅ Admin notification email sent successfully for order: ${orderNumber}`);
        console.log(`[${getTimestamp()}] 📧 Message ID: ${adminEmailResult.messageId}`);
      } else {
        console.error(`[${getTimestamp()}] ⚠️  Admin notification email failed: ${adminEmailResult.error}`);
      }
    } catch (emailError) {
      console.error(`[${getTimestamp()}] ❌ Exception sending admin notification:`, emailError.message);
      console.error(`[${getTimestamp()}] 📄 Stack trace:`, emailError.stack);
      // Ne pas faire échouer la commande si l'email échoue
    }

    console.log(`[${getTimestamp()}] 🎉 Order creation completed successfully`);
    console.log(`[${getTimestamp()}] 📊 Final order details:`, JSON.stringify({
      orderNumber: order.order_number,
      orderId: order.id,
      customerName: order.customer_name,
      totalAmount: order.total_amount,
      itemCount: items.length
    }, null, 2));
    console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);

    // Transform response to include both formats for compatibility
    const responseOrder = {
      ...order,
      orderNumber: order.order_number,  // camelCase for frontend
      order_number: order.order_number  // snake_case for compatibility
    };

    res.status(201).json({
      success: true,
      data: { 
        order: responseOrder
      }
    });
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ Create order error - Unexpected exception`);
    console.error(`[${getTimestamp()}] 📄 Error type: ${error instanceof Error ? error.name : 'Unknown'}`);
    console.error(`[${getTimestamp()}] 📄 Error message: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`[${getTimestamp()}] 📄 Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
    // Ensure consistent error response format
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur inattendue s\'est produite lors de la création de votre commande. Veuillez réessayer ou contacter le support si le problème persiste.'
      }
    });
  }
});

// GET /api/orders/:orderNumber - Get order by order number
app.get('/api/orders/:orderNumber', async (req, res) => {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${getTimestamp()}] 🔍 Backend GET /api/orders/:orderNumber - START`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    const { orderNumber } = req.params;
    
    console.log(`[${getTimestamp()}] 🎫 Fetching order: ${orderNumber}`);
    console.log(`[${getTimestamp()}] 💾 Querying database...`);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        console.log(`[${getTimestamp()}] ❌ Order not found: ${orderNumber}`);
        console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Commande non trouvée'
          }
        });
      }
      console.error(`[${getTimestamp()}] ❌ Error fetching order from database`);
      console.error(`[${getTimestamp()}] 📄 Database error:`, orderError);
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: orderError.message
        }
      });
    }

    console.log(`[${getTimestamp()}] ✅ Order found in database`);
    console.log(`[${getTimestamp()}] 📊 Order details:`, JSON.stringify({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      status: order.status,
      totalAmount: order.total_amount
    }, null, 2));

    // Get order items with product details
    console.log(`[${getTimestamp()}] 📦 Fetching order items...`);
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
      console.error(`[${getTimestamp()}] ❌ Error fetching order items`);
      console.error(`[${getTimestamp()}] 📄 Database error:`, itemsError);
      console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      return res.status(500).json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: itemsError.message
        }
      });
    }

    console.log(`[${getTimestamp()}] ✅ Order items fetched: ${orderItems.length} items`);

    // Transform the order data with both camelCase and snake_case for compatibility
    console.log(`[${getTimestamp()}] 🔄 Transforming order data...`);
    const transformedOrder = {
      id: order.id,
      orderNumber: order.order_number,      // camelCase for frontend
      order_number: order.order_number,     // snake_case for compatibility
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

    console.log(`[${getTimestamp()}] ✅ Order data transformed successfully`);
    console.log(`[${getTimestamp()}] 📤 Sending response with orderNumber: ${transformedOrder.orderNumber}`);
    console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);

    res.json({
      success: true,
      data: { order: transformedOrder }
    });
  } catch (error) {
    console.error(`[${getTimestamp()}] ❌ Get order error - Unexpected exception`);
    console.error(`[${getTimestamp()}] 📄 Error type: ${error instanceof Error ? error.name : 'Unknown'}`);
    console.error(`[${getTimestamp()}] 📄 Error message: ${error instanceof Error ? error.message : String(error)}`);
    console.error(`[${getTimestamp()}] 📄 Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    console.log(`[${getTimestamp()}] ⏱️  Request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
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