// Script de diagnostic pour vérifier les produits dans Supabase
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  console.log('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('SUPABASE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugProducts() {
  console.log('\n🔍 DIAGNOSTIC DES PRODUITS\n');
  console.log('='.repeat(60));

  try {
    // 1. Récupérer TOUS les produits
    console.log('\n📦 Récupération de tous les produits...\n');
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Erreur:', allError);
      return;
    }

    console.log(`✅ Total de produits: ${allProducts.length}\n`);

    // 2. Afficher chaque produit
    allProducts.forEach((product, index) => {
      console.log(`\n--- Produit ${index + 1} ---`);
      console.log(`ID: ${product.id}`);
      console.log(`Nom: ${product.name}`);
      console.log(`Prix: ${product.price} GNF`);
      console.log(`Catégorie: ${product.category}`);
      console.log(`Stock: ${product.stock}`);
      console.log(`Actif: ${product.is_active ? '✅ Oui' : '❌ Non'}`);
      console.log(`Images: ${JSON.stringify(product.images)}`);
      console.log(`Type images: ${typeof product.images}`);
      console.log(`Nombre d'images: ${Array.isArray(product.images) ? product.images.length : 'N/A'}`);
      console.log(`Tailles: ${JSON.stringify(product.sizes)}`);
      console.log(`Couleurs: ${JSON.stringify(product.colors)}`);
      console.log(`Créé le: ${new Date(product.created_at).toLocaleString('fr-FR')}`);
    });

    // 3. Produits actifs
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 STATISTIQUES\n');
    const activeProducts = allProducts.filter(p => p.is_active);
    const inactiveProducts = allProducts.filter(p => !p.is_active);
    const productsWithImages = allProducts.filter(p => 
      Array.isArray(p.images) && p.images.length > 0
    );
    const productsWithoutImages = allProducts.filter(p => 
      !Array.isArray(p.images) || p.images.length === 0
    );

    console.log(`Produits actifs: ${activeProducts.length}`);
    console.log(`Produits inactifs: ${inactiveProducts.length}`);
    console.log(`Produits avec images: ${productsWithImages.length}`);
    console.log(`Produits sans images: ${productsWithoutImages.length}`);

    // 4. Produits sans images
    if (productsWithoutImages.length > 0) {
      console.log('\n⚠️  PRODUITS SANS IMAGES:');
      productsWithoutImages.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
        console.log(`    Images brutes: ${JSON.stringify(p.images)}`);
      });
    }

    // 5. Dernier produit créé
    if (allProducts.length > 0) {
      const lastProduct = allProducts[0];
      console.log('\n🆕 DERNIER PRODUIT CRÉÉ:');
      console.log(JSON.stringify(lastProduct, null, 2));
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Diagnostic terminé!\n');
}

debugProducts();
