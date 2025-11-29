// Hook pour envoyer des notifications lors de nouvelles commandes
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Envoie une notification push pour une nouvelle commande
 * @param {Object} order - Données de la commande
 */
async function notifyNewOrder(order) {
  try {
    // Vérifier si les notifications sont activées
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('settings')
      .eq('id', 'auto_notifications')
      .single();

    if (!settings?.settings?.newOrders) {
      console.log('📵 Notifications de commandes désactivées');
      return { skipped: true };
    }

    // Envoyer la notification
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '🎉 Nouvelle commande',
        body: `Commande #${order.orderNumber} - ${order.total}€`,
        icon: '/icon-192x192.png',
        url: '/admin/dashboard',
        type: 'order'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Notification envoyée: ${result.sent} abonné(s)`);
      return result;
    } else {
      console.error('❌ Erreur envoi notification:', await response.text());
      return { error: 'Erreur envoi' };
    }
  } catch (error) {
    console.error('❌ Erreur notification nouvelle commande:', error);
    return { error: error.message };
  }
}

/**
 * Envoie une notification pour un stock faible
 * @param {string} productName - Nom du produit
 * @param {number} stock - Stock restant
 */
async function notifyLowStock(productName, stock) {
  try {
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('settings')
      .eq('id', 'auto_notifications')
      .single();

    if (!settings?.settings?.lowStock) {
      return { skipped: true };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${appUrl}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '⚠️ Stock faible',
        body: `${productName} - Plus que ${stock} en stock`,
        icon: '/icon-192x192.png',
        url: '/admin/products',
        type: 'stock'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Notification stock envoyée: ${result.sent} abonné(s)`);
      return result;
    }
  } catch (error) {
    console.error('❌ Erreur notification stock:', error);
    return { error: error.message };
  }
}

module.exports = {
  notifyNewOrder,
  notifyLowStock
};
