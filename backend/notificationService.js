const webpush = require('web-push');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Configuration VAPID
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@votre-site.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

class NotificationService {
  // Envoyer une notification à tous les abonnés
  async sendToAll(notification) {
    try {
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*');

      if (!subscriptions || subscriptions.length === 0) {
        return { sent: 0, failed: 0 };
      }

      const results = await Promise.allSettled(
        subscriptions.map(sub => this.sendNotification(sub, notification))
      );

      const sent = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { sent, failed, total: subscriptions.length };
    } catch (error) {
      console.error('Erreur envoi notifications:', error);
      return { sent: 0, failed: 0, error: error.message };
    }
  }

  // Envoyer une notification à un abonné spécifique
  async sendNotification(subscription, notification) {
    try {
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/icon-192x192.png',
        data: {
          url: notification.url || '/',
          timestamp: Date.now()
        }
      });

      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth
          }
        },
        payload
      );

      return true;
    } catch (error) {
      // Si l'abonnement est invalide, le supprimer
      if (error.statusCode === 410) {
        await this.removeSubscription(subscription.id);
      }
      throw error;
    }
  }

  // Notification pour nouvelle commande
  async notifyNewOrder(orderNumber, total) {
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('settings')
      .eq('id', 'auto_notifications')
      .single();

    if (!settings?.settings?.newOrders) {
      return { skipped: true };
    }

    return this.sendToAll({
      title: '🎉 Nouvelle commande',
      body: `Commande #${orderNumber} - ${total}€`,
      icon: '/icon-192x192.png',
      url: `/admin/dashboard`
    });
  }

  // Notification pour stock faible
  async notifyLowStock(productName, stock) {
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('settings')
      .eq('id', 'auto_notifications')
      .single();

    if (!settings?.settings?.lowStock) {
      return { skipped: true };
    }

    return this.sendToAll({
      title: '⚠️ Stock faible',
      body: `${productName} - Plus que ${stock} en stock`,
      icon: '/icon-192x192.png',
      url: '/admin/products'
    });
  }

  // Notification pour promotion
  async notifyPromotion(title, description, promoCode) {
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('settings')
      .eq('id', 'auto_notifications')
      .single();

    if (!settings?.settings?.promotions) {
      return { skipped: true };
    }

    return this.sendToAll({
      title: `🔥 ${title}`,
      body: description,
      icon: '/icon-192x192.png',
      url: `/products?promo=${promoCode}`
    });
  }

  // Notification pour nouveau produit
  async notifyNewProduct(productName, productId) {
    return this.sendToAll({
      title: '✨ Nouveau produit',
      body: `Découvrez ${productName}`,
      icon: '/icon-192x192.png',
      url: `/products/${productId}`
    });
  }

  // Supprimer un abonnement invalide
  async removeSubscription(subscriptionId) {
    try {
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', subscriptionId);
    } catch (error) {
      console.error('Erreur suppression abonnement:', error);
    }
  }

  // Obtenir les statistiques
  async getStats() {
    try {
      const { data: subscriptions, count } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact' });

      const { data: settings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('id', 'auto_notifications')
        .single();

      return {
        totalSubscribers: count || 0,
        autoNotifications: settings?.settings || {},
        lastUpdate: settings?.updated_at
      };
    } catch (error) {
      console.error('Erreur récupération stats:', error);
      return {
        totalSubscribers: 0,
        autoNotifications: {},
        lastUpdate: null
      };
    }
  }
}

module.exports = new NotificationService();
