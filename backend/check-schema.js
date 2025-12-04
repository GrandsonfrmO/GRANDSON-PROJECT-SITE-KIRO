require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    console.log('Checking orders table schema...\n');
    
    // Try to select from orders to see what columns exist
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Sample order record:');
      console.log(JSON.stringify(data[0], null, 2));
      console.log('\n📋 Available columns:');
      console.log(Object.keys(data[0]).join(', '));
    } else {
      console.log('⚠️  No orders found in database');
      console.log('Trying to get schema info...');
      
      // Try an empty insert to see what columns are expected
      const { error: insertError } = await supabase
        .from('orders')
        .insert([{}])
        .select();
      
      if (insertError) {
        console.log('\n📋 Error message reveals required columns:');
        console.log(insertError.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

checkSchema();
