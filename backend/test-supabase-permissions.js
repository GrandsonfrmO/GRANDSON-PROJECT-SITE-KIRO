/**
 * Script de test des permissions Supabase
 * Vérifie que le service role key permet toutes les opérations CRUD
 * 
 * Usage: node test-supabase-permissions.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { createClient } = require('@supabase/supabase-js');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  log('❌ Missing Supabase configuration', 'red');
  log('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env', 'yellow');
  process.exit(1);
}

// Créer le client avec le service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Données de test
const testProduct = {
  name: 'TEST-PRODUCT-PERMISSIONS-' + Date.now(),
  description: 'Produit de test pour vérifier les permissions Supabase',
  price: 50000,
  base_price: 50000,
  category: 'Tshirt',
  stock: 10,
  total_stock: 10,
  sizes: JSON.stringify(['M', 'L', 'XL']),
  colors: JSON.stringify(['Noir', 'Blanc']),
  images: JSON.stringify(['https://example.com/test.jpg']),
  is_active: true
};

async function testRLSStatus() {
  log('\n📋 Test 1: Vérification de l\'état RLS', 'cyan');
  
  try {
    // Cette requête nécessite des permissions admin
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      log(`❌ Erreur lors de la lecture: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Lecture réussie - Service role key fonctionne', 'green');
    return true;
  } catch (error) {
    log(`❌ Exception: ${error.message}`, 'red');
    return false;
  }
}

async function testInsert() {
  log('\n📋 Test 2: INSERT (Création de produit)', 'cyan');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();
    
    if (error) {
      log(`❌ Erreur INSERT: ${error.message}`, 'red');
      log(`   Details: ${JSON.stringify(error.details)}`, 'yellow');
      log(`   Hint: ${error.hint}`, 'yellow');
      return null;
    }
    
    log(`✅ INSERT réussi - Product ID: ${data.id}`, 'green');
    return data.id;
  } catch (error) {
    log(`❌ Exception INSERT: ${error.message}`, 'red');
    return null;
  }
}

async function testSelect(productId) {
  log('\n📋 Test 3: SELECT (Lecture de produit)', 'cyan');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      log(`❌ Erreur SELECT: ${error.message}`, 'red');
      return false;
    }
    
    log(`✅ SELECT réussi - Produit trouvé: ${data.name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Exception SELECT: ${error.message}`, 'red');
    return false;
  }
}

async function testUpdate(productId) {
  log('\n📋 Test 4: UPDATE (Modification de produit)', 'cyan');
  
  try {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        name: 'TEST-PRODUCT-UPDATED',
        price: 60000
      })
      .eq('id', productId)
      .select()
      .single();
    
    if (error) {
      log(`❌ Erreur UPDATE: ${error.message}`, 'red');
      return false;
    }
    
    log(`✅ UPDATE réussi - Nouveau nom: ${data.name}, Prix: ${data.price}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Exception UPDATE: ${error.message}`, 'red');
    return false;
  }
}

async function testDelete(productId) {
  log('\n📋 Test 5: DELETE (Suppression de produit)', 'cyan');
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    
    if (error) {
      log(`❌ Erreur DELETE: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ DELETE réussi - Produit supprimé', 'green');
    return true;
  } catch (error) {
    log(`❌ Exception DELETE: ${error.message}`, 'red');
    return false;
  }
}

async function testOrdersTable() {
  log('\n📋 Test 6: Vérification de la table orders', 'cyan');
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (error) {
      log(`❌ Erreur lecture orders: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Lecture de la table orders réussie', 'green');
    return true;
  } catch (error) {
    log(`❌ Exception orders: ${error.message}`, 'red');
    return false;
  }
}

async function testDeliveryZonesTable() {
  log('\n📋 Test 7: Vérification de la table delivery_zones', 'cyan');
  
  try {
    const { data, error } = await supabase
      .from('delivery_zones')
      .select('*')
      .limit(1);
    
    if (error) {
      log(`❌ Erreur lecture delivery_zones: ${error.message}`, 'red');
      return false;
    }
    
    log('✅ Lecture de la table delivery_zones réussie', 'green');
    return true;
  } catch (error) {
    log(`❌ Exception delivery_zones: ${error.message}`, 'red');
    return false;
  }
}

async function cleanup() {
  log('\n🧹 Nettoyage des produits de test...', 'cyan');
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .like('name', 'TEST-PRODUCT-%');
    
    if (error) {
      log(`⚠️ Erreur nettoyage: ${error.message}`, 'yellow');
    } else {
      log('✅ Nettoyage terminé', 'green');
    }
  } catch (error) {
    log(`⚠️ Exception nettoyage: ${error.message}`, 'yellow');
  }
}

async function runTests() {
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║   TEST DES PERMISSIONS SUPABASE - SERVICE ROLE KEY        ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  log('\n📌 Configuration:', 'cyan');
  log(`   Supabase URL: ${supabaseUrl}`, 'yellow');
  log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`, 'yellow');
  
  const results = {
    rlsStatus: false,
    insert: false,
    select: false,
    update: false,
    delete: false,
    orders: false,
    deliveryZones: false
  };
  
  let testProductId = null;
  
  try {
    // Test 1: Vérifier l'état RLS
    results.rlsStatus = await testRLSStatus();
    
    // Test 2: INSERT
    testProductId = await testInsert();
    results.insert = testProductId !== null;
    
    if (testProductId) {
      // Test 3: SELECT
      results.select = await testSelect(testProductId);
      
      // Test 4: UPDATE
      results.update = await testUpdate(testProductId);
      
      // Test 5: DELETE
      results.delete = await testDelete(testProductId);
    }
    
    // Test 6: Orders table
    results.orders = await testOrdersTable();
    
    // Test 7: Delivery zones table
    results.deliveryZones = await testDeliveryZonesTable();
    
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  } finally {
    // Nettoyage
    await cleanup();
  }
  
  // Résumé
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║                    RÉSUMÉ DES TESTS                        ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  log('\n📊 Résultats:', 'cyan');
  log(`   RLS Status Check:     ${results.rlsStatus ? '✅ PASS' : '❌ FAIL'}`, results.rlsStatus ? 'green' : 'red');
  log(`   INSERT (Create):      ${results.insert ? '✅ PASS' : '❌ FAIL'}`, results.insert ? 'green' : 'red');
  log(`   SELECT (Read):        ${results.select ? '✅ PASS' : '❌ FAIL'}`, results.select ? 'green' : 'red');
  log(`   UPDATE (Modify):      ${results.update ? '✅ PASS' : '❌ FAIL'}`, results.update ? 'green' : 'red');
  log(`   DELETE (Remove):      ${results.delete ? '✅ PASS' : '❌ FAIL'}`, results.delete ? 'green' : 'red');
  log(`   Orders Table:         ${results.orders ? '✅ PASS' : '❌ FAIL'}`, results.orders ? 'green' : 'red');
  log(`   Delivery Zones Table: ${results.deliveryZones ? '✅ PASS' : '❌ FAIL'}`, results.deliveryZones ? 'green' : 'red');
  
  log('\n' + '═'.repeat(60), 'blue');
  
  if (allPassed) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
    log('✅ Le service role key a un accès complet à toutes les tables', 'green');
    log('✅ Les permissions Supabase sont correctement configurées', 'green');
  } else {
    log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
    log('❌ Vérifiez la configuration Supabase:', 'red');
    log('   1. Le service role key est-il correct?', 'yellow');
    log('   2. Les tables existent-elles?', 'yellow');
    log('   3. Y a-t-il des triggers qui bloquent les opérations?', 'yellow');
    log('   4. Exécutez verify-rls-and-permissions.sql dans Supabase', 'yellow');
  }
  
  log('\n');
  process.exit(allPassed ? 0 : 1);
}

// Exécuter les tests
runTests().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
