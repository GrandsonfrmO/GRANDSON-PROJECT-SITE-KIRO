/**
 * Script de test pour vérifier l'envoi d'emails lors de la création de commande
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3001';

async function testOrderWithEmail() {
  console.log('\n🧪 Test: Création de commande avec email\n');
  
  try {
    const testOrder = {
      customerName: 'Test Client Email',
      customerPhone: '0612345678',
      customerEmail: 'papicamara22@gmail.com', // Email de test
      deliveryAddress: 'Rue Test, Immeuble Test, Appartement 123',
      deliveryZone: 'Kaloum',
      deliveryFee: 35000,
      totalAmount: 195000,
      items: [
        {
          productId: 'be9b1808-84c0-4d3d-b3a7-aea04f39d899',
          size: 'L',
          quantity: 2,
          price: 80000
        }
      ]
    };

    console.log('📦 Envoi de la commande de test...');
    console.log('📧 Email client:', testOrder.customerEmail);
    
    const response = await axios.post(`${BACKEND_URL}/api/orders`, testOrder);
    
    if (response.data.success) {
      console.log('\n✅ Commande créée avec succès !');
      console.log('🎫 Numéro de commande:', response.data.data.order.orderNumber);
      console.log('\n📧 Vérifiez maintenant :');
      console.log('   1. Les logs du backend pour voir si les emails ont été envoyés');
      console.log('   2. Votre boîte email:', testOrder.customerEmail);
      console.log('   3. L\'email admin:', process.env.ADMIN_EMAIL || 'papicamara22@gmail.com');
      console.log('\n✅ Test réussi !');
    } else {
      console.error('❌ Échec de création de commande:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('📄 Réponse serveur:', error.response.data);
    }
  }
}

async function testOrderWithoutEmail() {
  console.log('\n🧪 Test: Création de commande SANS email\n');
  
  try {
    const testOrder = {
      customerName: 'Test Client Sans Email',
      customerPhone: '0612345678',
      customerEmail: '', // Pas d'email
      deliveryAddress: 'Rue Test, Immeuble Test, Appartement 456',
      deliveryZone: 'Matam',
      deliveryFee: 25000,
      totalAmount: 105000,
      items: [
        {
          productId: 'be9b1808-84c0-4d3d-b3a7-aea04f39d899',
          size: 'M',
          quantity: 1,
          price: 80000
        }
      ]
    };

    console.log('📦 Envoi de la commande de test...');
    console.log('⚠️  Pas d\'email client fourni');
    
    const response = await axios.post(`${BACKEND_URL}/api/orders`, testOrder);
    
    if (response.data.success) {
      console.log('\n✅ Commande créée avec succès !');
      console.log('🎫 Numéro de commande:', response.data.data.order.orderNumber);
      console.log('\n📧 Vérifiez les logs du backend :');
      console.log('   - Doit logger "No customer email provided"');
      console.log('   - Doit quand même envoyer l\'email admin');
      console.log('\n✅ Test réussi !');
    } else {
      console.error('❌ Échec de création de commande:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
    if (error.response) {
      console.error('📄 Réponse serveur:', error.response.data);
    }
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests d\'envoi d\'emails\n');
  console.log('⚠️  Assurez-vous que le backend est démarré (node hybrid-server.js)\n');
  
  // Test 1: Avec email
  await testOrderWithEmail();
  
  // Attendre 2 secondes entre les tests
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 2: Sans email
  await testOrderWithoutEmail();
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Tous les tests terminés !');
  console.log('='.repeat(80) + '\n');
}

// Exécuter les tests
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
