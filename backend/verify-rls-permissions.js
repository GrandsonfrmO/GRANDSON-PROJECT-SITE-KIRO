/**
 * Script to verify Supabase RLS policies and permissions
 * Tests that service role key can bypass RLS and perform all CRUD operations
 */

require('dotenv').config({ path: __dirname + '/.env.production' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verifying Supabase RLS Policies and Permissions\n');
console.log('📡 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
console.log('🔑 Anon Key:', supabaseAnonKey ? 'Present' : 'Missing');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create clients
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testPermissions() {
  console.log('='.repeat(80));
  console.log('Testing Service Role Key Permissions');
  console.log('='.repeat(80));
  console.log('');

  let testProductId = null;

  try {
    // Test 1: SELECT with service role key
    console.log('📋 Test 1: SELECT products with service role key');
    const { data: products, error: selectError } = await supabaseAdmin
      .from('products')
      .select('*')
      .limit(5);

    if (selectError) {
      console.error('❌ SELECT failed:', selectError.message);
      console.error('   Code:', selectError.code);
      console.error('   Details:', selectError.details);
      console.error('   Hint:', selectError.hint);
    } else {
      console.log(`✅ SELECT successful: Found ${products.length} products`);
      if (products.length > 0) {
        console.log(`   Sample product: ${products[0].name} (ID: ${products[0].id})`);
      }
    }
    console.log('');

    // Test 2: INSERT with service role key
    console.log('📋 Test 2: INSERT product with service role key');
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'Test product for RLS verification',
      price: 99.99,
      base_price: 99.99,
      category: 'Test',
      stock: 10,
      total_stock: 10,
      sizes: ['Unique'],
      images: [],
      colors: null,
      is_active: true
    };

    const { data: insertedProduct, error: insertError } = await supabaseAdmin
      .from('products')
      .insert([testProduct])
      .select()
      .single();

    if (insertError) {
      console.error('❌ INSERT failed:', insertError.message);
      console.error('   Code:', insertError.code);
      console.error('   Details:', insertError.details);
      console.error('   Hint:', insertError.hint);
    } else {
      testProductId = insertedProduct.id;
      console.log('✅ INSERT successful');
      console.log(`   Product ID: ${testProductId}`);
      console.log(`   Product name: ${insertedProduct.name}`);
    }
    console.log('');

    if (testProductId) {
      // Test 3: UPDATE with service role key
      console.log('📋 Test 3: UPDATE product with service role key');
      const { data: updatedProduct, error: updateError } = await supabaseAdmin
        .from('products')
        .update({ 
          name: `Updated Test Product ${Date.now()}`,
          price: 149.99
        })
        .eq('id', testProductId)
        .select()
        .single();

      if (updateError) {
        console.error('❌ UPDATE failed:', updateError.message);
        console.error('   Code:', updateError.code);
        console.error('   Details:', updateError.details);
        console.error('   Hint:', updateError.hint);
      } else {
        console.log('✅ UPDATE successful');
        console.log(`   New name: ${updatedProduct.name}`);
        console.log(`   New price: ${updatedProduct.price}`);
      }
      console.log('');

      // Test 4: DELETE with service role key
      console.log('📋 Test 4: DELETE product with service role key');
      const { error: deleteError } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', testProductId);

      if (deleteError) {
        console.error('❌ DELETE failed:', deleteError.message);
        console.error('   Code:', deleteError.code);
        console.error('   Details:', deleteError.details);
        console.error('   Hint:', deleteError.hint);
      } else {
        console.log('✅ DELETE successful');
        console.log(`   Deleted product ID: ${testProductId}`);
      }
      console.log('');
    }

    // Test 5: Compare with anon key (should have restrictions)
    console.log('📋 Test 5: SELECT products with anon key (for comparison)');
    const { data: anonProducts, error: anonSelectError } = await supabaseAnon
      .from('products')
      .select('*')
      .limit(5);

    if (anonSelectError) {
      console.log('⚠️  Anon key SELECT restricted (expected):', anonSelectError.message);
    } else {
      console.log(`ℹ️  Anon key SELECT allowed: Found ${anonProducts.length} products`);
      console.log('   Note: This is OK if RLS policies allow public read access');
    }
    console.log('');

    // Summary
    console.log('='.repeat(80));
    console.log('Summary');
    console.log('='.repeat(80));
    console.log('');
    
    const allTestsPassed = !selectError && !insertError && !updateError && !deleteError;
    
    if (allTestsPassed) {
      console.log('✅ All tests passed!');
      console.log('   Service role key has full access to products table');
      console.log('   RLS policies are correctly bypassed with service role key');
    } else {
      console.log('❌ Some tests failed');
      console.log('   Please check the errors above');
      console.log('   You may need to:');
      console.log('   1. Verify SUPABASE_SERVICE_ROLE_KEY is correct');
      console.log('   2. Check RLS policies on products table');
      console.log('   3. Verify table schema matches expected structure');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.error('   Message:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
  }
}

// Run tests
testPermissions()
  .then(() => {
    console.log('✅ Verification complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });
