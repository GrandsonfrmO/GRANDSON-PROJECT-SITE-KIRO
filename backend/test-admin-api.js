// Test de l'API admin des produits
require('dotenv').config({ path: '.env' });

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function testAdminAPI() {
  console.log('\n🧪 TEST DE L\'API ADMIN\n');
  console.log('='.repeat(60));

  try {
    // 1. Test sans authentification (devrait échouer)
    console.log('\n📡 Test 1: Récupération sans token...');
    const response1 = await fetch(`${FRONTEND_URL}/api/admin/products`);
    const data1 = await response1.json();
    console.log(`Status: ${response1.status}`);
    console.log(`Réponse:`, JSON.stringify(data1, null, 2));

    if (response1.status === 401) {
      console.log('✅ Authentification requise (comportement attendu)');
    } else {
      console.log('⚠️  Pas d\'authentification requise (problème de sécurité!)');
    }

    // 2. Test avec un faux token (devrait échouer)
    console.log('\n📡 Test 2: Récupération avec faux token...');
    const response2 = await fetch(`${FRONTEND_URL}/api/admin/products`, {
      headers: {
        'Authorization': 'Bearer fake-token-123'
      }
    });
    const data2 = await response2.json();
    console.log(`Status: ${response2.status}`);
    console.log(`Réponse:`, JSON.stringify(data2, null, 2));

    // 3. Test de l'API publique (devrait fonctionner)
    console.log('\n📡 Test 3: API publique des produits...');
    const response3 = await fetch(`${FRONTEND_URL}/api/products`);
    const data3 = await response3.json();
    console.log(`Status: ${response3.status}`);
    console.log(`Nombre de produits:`, data3.products?.length || 0);
    
    if (data3.products && data3.products.length > 0) {
      console.log('\n📦 Premier produit:');
      const product = data3.products[0];
      console.log(`  Nom: ${product.name}`);
      console.log(`  Prix: ${product.price} GNF`);
      console.log(`  Images: ${JSON.stringify(product.images)}`);
      console.log(`  Type images: ${typeof product.images}`);
      console.log(`  Est un tableau: ${Array.isArray(product.images)}`);
      console.log(`  Tailles: ${JSON.stringify(product.sizes)}`);
      console.log(`  Couleurs: ${JSON.stringify(product.colors)}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Tests terminés!\n');
}

testAdminAPI();
