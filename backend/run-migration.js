require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Running migration to add customer_email column...');
    
    const sql = fs.readFileSync('./add-customer-email-column.sql', 'utf8');
    console.log('SQL:', sql);
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error running migration:', error);
      console.log('\n⚠️  Note: You may need to run this SQL manually in the Supabase SQL editor:');
      console.log(sql);
      return;
    }
    
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Exception:', error);
    console.log('\n⚠️  Please run this SQL manually in the Supabase SQL editor:');
    console.log(fs.readFileSync('./add-customer-email-column.sql', 'utf8'));
  }
}

runMigration();
