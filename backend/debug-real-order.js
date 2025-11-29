require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugLastOrder() {
  console.log('🔍 Récupération de la dernière commande...\n');
  
  // Récupérer la dernière commande
  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (orderError || !orders || orders.length === 0) {
    console.error('❌ Aucune commande trouvée');
    return;
  }

  const order = orders[0];
  console.log('📦 Commande trouvée:', order.order_number);
  console.log('👤 Client:', order.customer_name);
  console.log('📧 Email:', order.customer_email || 'Non fourni');
  console.log('');

  // Récupérer les items de la commande
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  if (itemsError || !orderItems) {
    console.error('❌ Erreur lors de la récupération des items');
    return;
  }

  console.log('🛍️ Items de la commande:');
  console.log('');

  // Pour chaque item, récupérer les détails du produit
  for (const item of orderItems) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, images, price')
      .eq('id', item.product_id)
      .single();

    if (productError || !product) {
      console.log(`❌ Produit ${item.product_id} non trouvé`);
      continue;
    }

    console.log(`📦 Produit: ${product.name}`);
    console.log(`   ID: ${product.id}`);
    console.log(`   Prix: ${product.price} FG`);
    console.log(`   Quantité: ${item.quantity}`);
    console.log(`   Taille: ${item.size}`);
    console.log(`   Images:`, product.images);
    console.log('');

    // Vérifier si les images sont des URLs complètes
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      console.log(`   🖼️ Première image: ${firstImage}`);
      
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        console.log('   ✅ URL complète détectée');
        
        // Tester si l'URL est accessible
        try {
          const response = await fetch(firstImage, { method: 'HEAD' });
          if (response.ok) {
            console.log('   ✅ Image accessible (HTTP', response.status, ')');
          } else {
            console.log('   ❌ Image non accessible (HTTP', response.status, ')');
          }
        } catch (error) {
          console.log('   ❌ Erreur lors du test de l\'image:', error.message);
        }
      } else {
        console.log('   ⚠️ Chemin relatif détecté');
        console.log('   📝 Sera converti en:', process.env.PUBLIC_URL + firstImage);
      }
    } else {
      console.log('   ⚠️ Aucune image disponible');
    }
    console.log('');
  }

  // Simuler la préparation des données pour l'email
  console.log('📧 Données qui seraient envoyées dans l\'email:');
  console.log('');

  const itemsWithProductDetails = await Promise.all(
    orderItems.map(async (item) => {
      const { data: product } = await supabase
        .from('products')
        .select('id, name, images, price')
        .eq('id', item.product_id)
        .single();

      return {
        name: product?.name || `Produit ID: ${item.product_id}`,
        quantity: item.quantity,
        price: item.price,
        image: product?.images && product.images.length > 0 ? product.images[0] : null,
        size: item.size
      };
    })
  );

  console.log(JSON.stringify(itemsWithProductDetails, null, 2));
  console.log('');

  // Tester la fonction getAbsoluteImageUrl
  console.log('🔧 Test de la fonction getAbsoluteImageUrl:');
  console.log('');

  const getAbsoluteImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150/10b981/ffffff?text=Produit';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  itemsWithProductDetails.forEach((item, index) => {
    console.log(`Item ${index + 1}: ${item.name}`);
    console.log(`  Image brute: ${item.image}`);
    console.log(`  Image transformée: ${getAbsoluteImageUrl(item.image)}`);
    console.log('');
  });
}

debugLastOrder().catch(console.error);
