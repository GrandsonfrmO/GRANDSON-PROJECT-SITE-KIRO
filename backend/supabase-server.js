require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jwt-simple');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3001;

console.log('🔧 Starting Supabase Server...');

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: false
  }
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.1.252:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true); // Allow anyway in development
    }
  },
  credentials: true
}));

app.use(express.json());

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Access token required' }
    });
  }

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Supabase Server is running',
    database: 'Supabase'
  });
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Fetching products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch products' }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📦 Fetching product ${id} from Supabase...`);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Error fetching product:', error);
      return res.status(404).json({
        success: false,
        error: { message: 'Product not found' }
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Orders API
app.post('/api/orders', async (req, res) => {
  try {
    console.log('📝 Creating order in Supabase...');
    
    const orderData = req.body;
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        delivery_address: orderData.delivery_address,
        delivery_zone: orderData.delivery_zone,
        delivery_fee: orderData.delivery_fee || 0,
        total_amount: orderData.total_amount,
        status: 'PENDING'
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to create order' }
      });
    }

    // Créer les items de commande
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('❌ Error creating order items:', itemsError);
        // Supprimer la commande si les items n'ont pas pu être créés
        await supabase.from('orders').delete().eq('id', order.id);
        return res.status(500).json({
          success: false,
          error: { message: 'Failed to create order items' }
        });
      }
    }

    // Ajouter automatiquement le client à la newsletter
    if (orderData.customer_email) {
      try {
        console.log('📧 Auto-subscribing customer to newsletter:', orderData.customer_email);
        
        // Vérifier si l'email existe déjà
        const { data: existingSubscriber } = await supabase
          .from('newsletter_subscribers')
          .select('id, is_active')
          .eq('email', orderData.customer_email)
          .single();

        if (existingSubscriber) {
          // Si l'abonné existe mais est inactif, le réactiver
          if (!existingSubscriber.is_active) {
            await supabase
              .from('newsletter_subscribers')
              .update({ 
                is_active: true,
                name: orderData.customer_name,
                phone: orderData.customer_phone,
                unsubscribed_at: null
              })
              .eq('id', existingSubscriber.id);
            console.log('✅ Reactivated existing subscriber');
          } else {
            console.log('ℹ️ Customer already subscribed to newsletter');
          }
        } else {
          // Créer un nouvel abonné
          await supabase
            .from('newsletter_subscribers')
            .insert({
              email: orderData.customer_email,
              name: orderData.customer_name,
              phone: orderData.customer_phone,
              is_active: true
            });
          console.log('✅ Customer auto-subscribed to newsletter');
        }
      } catch (newsletterError) {
        // Ne pas bloquer la commande si l'inscription newsletter échoue
        console.warn('⚠️ Failed to auto-subscribe to newsletter:', newsletterError.message);
      }
    }

    console.log('✅ Order created successfully:', orderNumber);
    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const orderNumber = req.params.orderNumber;
    console.log(`📋 Fetching order ${orderNumber} from Supabase...`);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, price, images)
        )
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      console.error('❌ Error fetching order:', error);
      return res.status(404).json({
        success: false,
        error: { message: 'Order not found' }
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Admin Auth
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt...');
    
    const { username, password } = req.body;
    
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }
    
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' }
      });
    }
    
    const token = jwt.encode(
      { 
        username: admin.username, 
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
      },
      process.env.JWT_SECRET || 'dev-secret'
    );
    
    console.log('✅ Login successful');
    res.json({
      success: true,
      data: {
        token,
        admin: { username: admin.username, role: 'admin' }
      }
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Admin Orders
app.get('/api/admin/orders', authenticateToken, async (req, res) => {
  try {
    console.log('📋 Fetching all orders from Supabase...');
    
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
      console.error('❌ Error fetching orders:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch orders' }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

app.put('/api/admin/orders/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📝 Updating order ${id}...`);
    
    const { data, error } = await supabase
      .from('orders')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to update order' }
      });
    }

    console.log('✅ Order updated successfully');
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

app.delete('/api/admin/orders/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🗑️ Deleting order ${id}...`);
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting order:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to delete order' }
      });
    }

    console.log('✅ Order deleted successfully');
    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Admin Products
app.get('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    console.log('📦 Fetching all products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch products' }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

app.put('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`📝 Updating product ${id}...`);
    
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating product:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to update product' }
      });
    }

    console.log('✅ Product updated successfully');
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

app.post('/api/admin/products', authenticateToken, async (req, res) => {
  try {
    console.log('📝 Creating new product...');
    console.log('📦 Product data received:', JSON.stringify(req.body, null, 2));
    
    // Validation des champs requis
    const { name, price, category, stock } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Le nom du produit est requis' }
      });
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Le prix doit être un nombre positif' }
      });
    }
    
    if (!category) {
      return res.status(400).json({
        success: false,
        error: { message: 'La catégorie est requise' }
      });
    }
    
    // Préparer les données pour Supabase
    const priceValue = parseFloat(req.body.price);
    const stockValue = parseInt(req.body.stock) || 0;
    
    // Les colonnes sont de type text, pas jsonb - convertir en JSON string
    const sizesValue = req.body.sizes && req.body.sizes.length > 0 
      ? JSON.stringify(req.body.sizes) 
      : '["Unique"]';
    const colorsValue = req.body.colors && req.body.colors.length > 0 
      ? JSON.stringify(req.body.colors) 
      : null;
    const imagesValue = req.body.images && req.body.images.length > 0 
      ? JSON.stringify(req.body.images) 
      : '[]';
    
    const productData = {
      name: req.body.name.trim(),
      description: req.body.description || 'Aucune description',
      price: priceValue,
      base_price: priceValue,
      category: req.body.category,
      stock: stockValue,
      total_stock: stockValue,
      sizes: sizesValue,
      colors: colorsValue,
      images: imagesValue,
      is_active: req.body.is_active !== false
    };
    
    console.log('📤 Sending to Supabase:', JSON.stringify(productData, null, 2));
    
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase error creating product:', error);
      return res.status(500).json({
        success: false,
        error: { 
          message: `Erreur Supabase: ${error.message}`,
          details: error.details,
          hint: error.hint
        }
      });
    }

    console.log('✅ Product created successfully:', data.id);
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Erreur serveur interne: ' + error.message }
    });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    console.log(`🗑️ Deleting product ${id}...`);
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting product:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to delete product' }
      });
    }

    console.log('✅ Product deleted successfully');
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Delivery zones
app.get('/api/delivery-zones', async (req, res) => {
  try {
    console.log('🚚 Fetching delivery zones from Supabase...');
    
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('❌ Error fetching delivery zones:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch delivery zones' }
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
});

// Upload endpoint (vous devrez configurer votre service de stockage)
app.post('/api/upload', authenticateToken, (req, res) => {
  // TODO: Implémenter l'upload vers votre service de stockage (Cloudinary, AWS S3, etc.)
  console.log('📤 Upload endpoint called - implement your storage service');
  res.json({
    success: false,
    error: { message: 'Upload service not configured' }
  });
});

// ============ MARKETING ROUTES - DISABLED ============
// Marketing routes have been removed

app.listen(PORT, () => {
  console.log(`🚀 Supabase Server running on http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/login`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Using Supabase Database - No test data`);
  console.log(`📋 Make sure your Supabase database has real data`);

});