const axios = require('axios');

async function testOrder() {
  try {
    const response = await axios.post('http://localhost:3001/api/orders', {
      customerName: 'Test Client',
      customerPhone: '0612345678',
      customerEmail: 'papicamara22@gmail.com',
      deliveryAddress: 'Test Address',
      deliveryZone: 'Kaloum',
      deliveryFee: 35000,
      totalAmount: 115000,
      items: [{
        productId: 'be9b1808-84c0-4d3d-b3a7-aea04f39d899',
        size: 'L',
        quantity: 1,
        price: 80000
      }]
    });
    
    console.log('✅ Success!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
      console.error('Status:', error.response.status);
    }
  }
}

testOrder();
