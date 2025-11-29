require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = 3002;

// Supabase config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

app.use(cors());
app.use(express.json());

// Test route
app.post('/api/orders', async (req, res) => {
  console.log('🚨 TEST SERVER - ORDER ROUTE HIT');
  console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { items } = req.body;
    
    // Test stock update
    for (const item of items) {
      console.log(`📦 Processing item: ${item.productId}, quantity: ${item.quantity}`);
      
      // Get current stock
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('id, name, stock')
        .eq('id', item.productId)
        .single();

      if (productError || !product) {
        console.log('❌ Product not found:', item.productId);
        continue;
      }

      console.log(`📦 Current stock for ${product.name}: ${product.stock}`);
      
      // Update stock
      const newStock = product.stock - item.quantity;
      console.log(`📦 New stock will be: ${newStock}`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.productId);

      if (updateError) {
        console.error('❌ Error updating stock:', updateError);
      } else {
        console.log(`✅ Stock updated successfully for ${product.name}: ${product.stock} → ${newStock}`);
      }
    }
    
    res.json({ success: true, message: 'Test completed' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test Server running on http://localhost:${PORT}`);
});