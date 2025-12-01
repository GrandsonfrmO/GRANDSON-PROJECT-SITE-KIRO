require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Testing product insertion...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testInsert() {
  try {
    console.log('\n📦 Attempting to insert test product...');
    
    const productData = {
      name: 'TEST PRODUCT',
      description: 'Test description',
      price: 50000,
      base_price: 50000,
      category: 'Tshirt',
      sizes: '["M", "L", "XL"]',
      images: '[]',
      colors: '["Noir"]',
      stock: 10,
      total_stock: 10,
      is_active: true
    };
    
    console.log('Data to insert:', JSON.stringify(productData, null, 2));
    
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('\n❌ ERROR:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      process.exit(1);
    }

    console.log('\n✅ SUCCESS! Product created:');
    console.log('ID:', data.id);
    console.log('Name:', data.name);
    console.log('Price:', data.price);
    
    // Clean up
    console.log('\n🧹 Cleaning up test product...');
    await supabase.from('products').delete().eq('id', data.id);
    console.log('✅ Test product deleted');
    
  } catch (error) {
    console.error('\n❌ EXCEPTION:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testInsert();
