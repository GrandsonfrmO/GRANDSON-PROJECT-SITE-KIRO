const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './backend/.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const TEST_ORDERS = [
  { customer_name: "Mamadou Diallo", customer_email: "mamadou.diallo@example.com", customer_phone: "+224 621 00 00 01", delivery_address: "Quartier Hamdallaye, Conakry", delivery_zone: "Conakry Centre", total_amount: 150000, status: "PENDING" },
  { customer_name: "Aissatou Bah", customer_email: "aissatou.bah@example.com", customer_phone: "+224 621 00 00 02", delivery_address: "Quartier Kaloum, Conakry", delivery_zone: "Conakry Centre", total_amount: 80000, status: "PROCESSING" },
  { customer_name: "Ibrahima Sow", customer_email: "ibrahima.sow@example.com", customer_phone: "+224 621 00 00 03", delivery_address: "Quartier Ratoma, Conakry", delivery_zone: "Ratoma", total_amount: 200000, status: "SHIPPED" },
  { customer_name: "Fatoumata Camara", customer_email: "fatoumata.camara@example.com", customer_phone: "+224 621 00 00 04", delivery_address: "Quartier Matam, Conakry", delivery_zone: "Matam", total_amount: 120000, status: "DELIVERED" },
  { customer_name: "Ousmane Diaby", customer_email: "ousmane.diaby@example.com", customer_phone: "+224 621 00 00 05", delivery_address: "Quartier Dixinn, Conakry", delivery_zone: "Dixinn", total_amount: 95000, status: "PENDING" },
  { customer_name: "Mariama Sylla", customer_email: "mariama.sylla@example.com", customer_phone: "+224 621 00 00 06", delivery_address: "Quartier Kipé, Conakry", delivery_zone: "Ratoma", total_amount: 175000, status: "PROCESSING" },
  { customer_name: "Abdoulaye Barry", customer_email: "abdoulaye.barry@example.com", customer_phone: "+224 621 00 00 07", delivery_address: "Quartier Taouyah, Conakry", delivery_zone: "Matoto", total_amount: 65000, status: "PENDING" },
  { customer_name: "Kadiatou Touré", customer_email: "kadiatou.toure@example.com", customer_phone: "+224 621 00 00 08", delivery_address: "Quartier Lambandji, Conakry", delivery_zone: "Matam", total_amount: 140000, status: "SHIPPED" },
  { customer_name: "Mohamed Condé", customer_email: "mohamed.conde@example.com", customer_phone: "+224 621 00 00 09", delivery_address: "Quartier Bonfi, Conakry", delivery_zone: "Ratoma", total_amount: 110000, status: "DELIVERED" },
  { customer_name: "Hawa Keita", customer_email: "hawa.keita@example.com", customer_phone: "+224 621 00 00 10", delivery_address: "Quartier Cosa, Conakry", delivery_zone: "Dixinn", total_amount: 88000, status: "PROCESSING" },
  { customer_name: "Sekou Bangoura", customer_email: "sekou.bangoura@example.com", customer_phone: "+224 621 00 00 11", delivery_address: "Quartier Koloma, Conakry", delivery_zone: "Ratoma", total_amount: 195000, status: "PENDING" },
  { customer_name: "Aminata Diallo", customer_email: "aminata.diallo@example.com", customer_phone: "+224 621 00 00 12", delivery_address: "Quartier Madina, Conakry", delivery_zone: "Dixinn", total_amount: 72000, status: "DELIVERED" },
  { customer_name: "Thierno Diallo", customer_email: "thierno.diallo@example.com", customer_phone: "+224 621 00 00 13", delivery_address: "Quartier Sonfonia, Conakry", delivery_zone: "Matoto", total_amount: 135000, status: "PROCESSING" },
  { customer_name: "Binta Camara", customer_email: "binta.camara@example.com", customer_phone: "+224 621 00 00 14", delivery_address: "Quartier Coronthie, Conakry", delivery_zone: "Matam", total_amount: 98000, status: "SHIPPED" },
  { customer_name: "Alpha Yaya Diallo", customer_email: "alpha.diallo@example.com", customer_phone: "+224 621 00 00 15", delivery_address: "Quartier Cameroun, Conakry", delivery_zone: "Conakry Centre", total_amount: 160000, status: "PENDING" }
];

async function createTestOrders() {
  console.log('🚀 CRÉATION DES COMMANDES DE TEST');
  console.log('='.repeat(60));

  try {
    const { data: testData, error: testError } = await supabase.from('orders').select('count').limit(1);
    if (testError) {
      console.error('❌ Erreur de connexion:', testError.message);
      return;
    }

    console.log('✅ Connexion établie\n');

    const { count: existingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    console.log(`📊 Commandes existantes: ${existingCount || 0}\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const order of TEST_ORDERS) {
      try {
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const { data, error } = await supabase.from('orders').insert([{
          order_number: orderNumber,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          delivery_address: order.delivery_address,
          delivery_zone: order.delivery_zone,
          total_amount: order.total_amount,
          status: order.status,
          delivery_fee: 5000
        }]).select();

        if (error) {
          console.error(`❌ ${order.customer_name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ ${order.customer_name} - ${order.total_amount} GNF (${order.status})`);
          successCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`❌ ${order.customer_name}:`, err.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Succès: ${successCount} | ❌ Erreurs: ${errorCount}`);
    console.log(`📦 Total: ${(existingCount || 0) + successCount}`);

    const { data: allOrders } = await supabase.from('orders').select('*');
    if (allOrders) {
      const stats = {
        pending: allOrders.filter(o => o.status === 'PENDING').length,
        processing: allOrders.filter(o => o.status === 'PROCESSING').length,
        shipped: allOrders.filter(o => o.status === 'SHIPPED').length,
        delivered: allOrders.filter(o => o.status === 'DELIVERED').length,
        totalRevenue: allOrders.reduce((sum, o) => sum + o.total_amount, 0)
      };

      console.log('\n📈 STATISTIQUES');
      console.log(`⏳ En attente: ${stats.pending} | ⚙️ En cours: ${stats.processing}`);
      console.log(`🚚 Expédiées: ${stats.shipped} | ✅ Livrées: ${stats.delivered}`);
      console.log(`💰 Revenus: ${stats.totalRevenue.toLocaleString('fr-GN')} GNF`);
    }

    console.log('\n🎉 TERMINÉ! http://localhost:3000/admin/dashboard');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

createTestOrders();
