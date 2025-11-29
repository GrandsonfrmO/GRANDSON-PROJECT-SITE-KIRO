const { orderConfirmationEmail } = require('./emailTemplates');

// Test avec des données réelles incluant des URLs Cloudinary
const testOrder = {
  orderNumber: 'GS123456',
  customerName: 'Grandson',
  customerPhone: '+224612666115',
  deliveryAddress: 'Guinea better',
  deliveryZone: 'VENIR CHERCHER',
  deliveryFee: 0,
  totalAmount: 50000,
  items: [
    {
      name: 'dream chaser',
      size: 'L',
      quantity: 1,
      price: 50000,
      // URL Cloudinary réelle
      image: 'https://res.cloudinary.com/dssrjnhoj/image/upload/v1234567890/products/dream-chaser.jpg'
    }
  ]
};

// Générer le HTML de l'email
const emailHtml = orderConfirmationEmail(testOrder);

// Sauvegarder dans un fichier pour test
const fs = require('fs');
fs.writeFileSync('test-email-output.html', emailHtml);

console.log('✅ Email HTML généré avec succès!');
console.log('📧 Ouvrez test-email-output.html dans votre navigateur pour voir le résultat');
console.log('\n🔍 Vérifications:');
console.log('- Les images doivent avoir des URLs complètes (https://...)');
console.log('- Les images Cloudinary doivent s\'afficher correctement');
console.log('- Le layout doit être compatible avec les clients email');
