// Script pour corriger les images des produits
require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement manquantes!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixProductImages() {
  console.log('\n🔧 CORRECTION DES IMAGES DES PRODUITS\n');
  console.log('='.repeat(60));

  try {
    // 1. Récupérer tous les produits
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*');

    if (fetchError) {
      console.error('❌ Erreur lors de la récupération:', fetchError);
      return;
    }

    console.log(`\n📦 ${products.length} produit(s) trouvé(s)\n`);

    // 2. Corriger chaque produit
    for (const product of products) {
      console.log(`\n--- Traitement: ${product.name} ---`);
      console.log(`ID: ${product.id}`);
      
      let needsUpdate = false;
      const updates = {};

      // Corriger images
      if (typeof product.images === 'string') {
        try {
          updates.images = JSON.parse(product.images);
          console.log(`  ✅ Images corrigées: ${product.images} → ${JSON.stringify(updates.images)}`);
          needsUpdate = true;
        } catch (e) {
          console.log(`  ⚠️  Impossible de parser images: ${product.images}`);
          updates.images = [];
          needsUpdate = true;
        }
      } else if (!Array.isArray(product.images)) {
        updates.images = [];
        console.log(`  ✅ Images initialisées comme tableau vide`);
        needsUpdate = true;
      }

      // Corriger sizes
      if (typeof product.sizes === 'string') {
        try {
          updates.sizes = JSON.parse(product.sizes);
          console.log(`  ✅ Tailles corrigées`);
          needsUpdate = true;
        } catch (e) {
          updates.sizes = ['Unique'];
          needsUpdate = true;
        }
      }

      // Corriger colors
      if (typeof product.colors === 'string') {
        try {
          updates.colors = JSON.parse(product.colors);
          console.log(`  ✅ Couleurs corrigées`);
          needsUpdate = true;
        } catch (e) {
          updates.colors = null;
          needsUpdate = true;
        }
      }

      // Mettre à jour si nécessaire
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('products')
          .update(updates)
          .eq('id', product.id);

        if (updateError) {
          console.error(`  ❌ Erreur lors de la mise à jour:`, updateError);
        } else {
          console.log(`  ✅ Produit mis à jour avec succès!`);
        }
      } else {
        console.log(`  ℹ️  Aucune correction nécessaire`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Correction terminée!\n');

    // 3. Vérifier les résultats
    console.log('📊 VÉRIFICATION POST-CORRECTION\n');
    const { data: updatedProducts } = await supabase
      .from('products')
      .select('*');

    updatedProducts.forEach(p => {
      console.log(`\n${p.name}:`);
      console.log(`  Images: ${JSON.stringify(p.images)} (type: ${typeof p.images})`);
      console.log(`  Tailles: ${JSON.stringify(p.sizes)} (type: ${typeof p.sizes})`);
      console.log(`  Couleurs: ${JSON.stringify(p.colors)} (type: ${typeof p.colors})`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

fixProductImages();
