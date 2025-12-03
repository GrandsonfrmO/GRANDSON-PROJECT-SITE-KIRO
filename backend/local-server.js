require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { mockProducts, mockOrders, mockAdmin } = require('./mock-data');
let orderCounter = 1000;

const app = express();
const PORT = 3001;

console.log('🔧 Starting Local Development Server...');

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Local Development Server is running' });
});

// Products API
app.get('/api/products', (req, res) => {
  console.log('📦 Fetching products (local)...');
  res.json({
    success: true,
    data: mockProducts
  });
});

app.get('/api/products/:id', (req, res) => {
  const id = req.params.id;
  const product = mockProducts.find(p => p.id == id || p.id.toString() === id);
  
  if (!product) {
    return res.status(404).json({
      success: false,
      error: { message: 'Product not found' }
    });
  }
  
  res.json({
    success: true,
    data: product
  });
});

// Orders API
app.post('/api/orders', (req, res) => {
  console.log('📝 Creating order (local)...');
  
  const orderData = req.body;
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newOrder = {
    id: orderCounter++,
    orderNumber,
    ...orderData,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  
  mockOrders.push(newOrder);
  
  res.json({
    success: true,
    data: { order: newOrder }
  });
});

app.get('/api/orders/:orderNumber', (req, res) => {
  const orderNumber = req.params.orderNumber;
  const order = mockOrders.find(o => o.orderNumber === orderNumber);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: { message: 'Order not found' }
    });
  }
  
  res.json({
    success: true,
    data: order
  });
});

// Admin Auth
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login attempt (local)...');
  
  const { username, password } = req.body;
  
  if (username !== mockAdmin.username) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid credentials' }
    });
  }
  
  const isValid = await bcrypt.compare(password, mockAdmin.password);
  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid credentials' }
    });
  }
  
  const token = jwt.sign(
    { username: mockAdmin.username, role: mockAdmin.role },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '8h' }
  );
  
  res.json({
    success: true,
    data: {
      token,
      admin: { username: mockAdmin.username, role: mockAdmin.role }
    }
  });
});

// Admin Orders
app.get('/api/admin/orders', (req, res) => {
  res.json({
    success: true,
    data: mockOrders
  });
});

app.put('/api/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const orderIndex = mockOrders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { message: 'Order not found' }
    });
  }
  
  mockOrders[orderIndex] = { ...mockOrders[orderIndex], ...req.body };
  
  res.json({
    success: true,
    data: mockOrders[orderIndex]
  });
});

app.delete('/api/admin/orders/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const orderIndex = mockOrders.findIndex(o => o.id === id);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { message: 'Order not found' }
    });
  }
  
  mockOrders.splice(orderIndex, 1);
  
  res.json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// Admin Products
app.get('/api/admin/products', (req, res) => {
  res.json({
    success: true,
    data: mockProducts
  });
});

app.put('/api/admin/products/:id', (req, res) => {
  const id = req.params.id;
  console.log(`📝 Updating product ${id}...`);
  
  // Try to find by ID (number or string)
  let productIndex = mockProducts.findIndex(p => p.id == id || p.id.toString() === id);
  
  if (productIndex === -1) {
    console.log(`❌ Product ${id} not found`);
    return res.status(404).json({
      success: false,
      error: { message: 'Product not found' }
    });
  }
  
  mockProducts[productIndex] = { ...mockProducts[productIndex], ...req.body };
  console.log(`✅ Product ${id} updated successfully`);
  
  res.json({
    success: true,
    data: mockProducts[productIndex]
  });
});

app.post('/api/admin/products', (req, res) => {
  const newProduct = {
    id: Math.max(...mockProducts.map(p => p.id)) + 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  
  mockProducts.push(newProduct);
  
  res.json({
    success: true,
    data: newProduct
  });
});

app.delete('/api/admin/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const productIndex = mockProducts.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      error: { message: 'Product not found' }
    });
  }
  
  mockProducts.splice(productIndex, 1);
  
  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

// Delivery zones
app.get('/api/delivery-zones', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Camayenne', fee: 30000 },
      { id: 2, name: 'Dixinn', fee: 25000 },
      { id: 3, name: 'Kaloum', fee: 35000 },
      { id: 4, name: 'Matam', fee: 25000 },
      { id: 5, name: 'Matoto', fee: 25000 },
      { id: 6, name: 'Ratoma', fee: 20000 }
    ]
  });
});

// Upload endpoint (mock)
app.post('/api/upload', (req, res) => {
  // Mock upload response
  res.json({
    success: true,
    data: {
      url: '/images/mock-image.jpg',
      publicId: 'mock-' + Date.now()
    }
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Local Development Server running on http://localhost:${PORT}`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/login`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🎯 Admin Login Credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: admin123`);
});