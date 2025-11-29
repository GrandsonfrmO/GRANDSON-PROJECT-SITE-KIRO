const express = require('express');
const router = express.Router();

// Middleware d'authentification admin
const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'Non autorisé' });
  }
  next();
};

// ============ NEWSLETTER ============

// Obtenir tous les abonnés
router.get('/newsletter/subscribers', authenticateAdmin, async (req, res) => {
  try {
    const { supabase } = req.app.locals;
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { subscribers: data || [], total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Ajouter un abonné
router.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    const { supabase } = req.app.locals;

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, name, phone, is_active: true }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà abonné' 
        });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Désabonner
router.post('/newsletter/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    const { supabase } = req.app.locals;

    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CAMPAGNES EMAIL ============

// Obtenir toutes les campagnes
router.get('/campaigns', authenticateAdmin, async (req, res) => {
  try {
    const { supabase } = req.app.locals;
    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { campaigns: data || [] } });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Créer une campagne
router.post('/campaigns', authenticateAdmin, async (req, res) => {
  try {
    const { title, subject, content, scheduled_at, audience } = req.body;
    const { supabase } = req.app.locals;

    const { data, error } = await supabase
      .from('email_campaigns')
      .insert([{ 
        title, 
        subject, 
        content, 
        status: scheduled_at ? 'scheduled' : 'draft',
        scheduled_at,
        audience: audience || 'all' // 'all', 'subscribers', 'customers'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Supprimer une campagne
router.delete('/campaigns/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabase } = req.app.locals;

    const { error } = await supabase
      .from('email_campaigns')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Campagne supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Envoyer une campagne
router.post('/campaigns/:id/send', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { audience } = req.body; // 'all', 'subscribers', 'customers'
    const { supabase } = req.app.locals;

    // Récupérer la campagne
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (campaignError) throw campaignError;

    let recipients = [];
    const audienceType = audience || campaign.audience || 'all';

    // Récupérer les destinataires selon le public choisi
    if (audienceType === 'subscribers' || audienceType === 'all') {
      // Abonnés newsletter
      const { data: subscribers, error: subscribersError } = await supabase
        .from('newsletter_subscribers')
        .select('email, name')
        .eq('is_active', true);

      if (!subscribersError && subscribers) {
        recipients = [...recipients, ...subscribers];
      }
    }

    if (audienceType === 'customers' || audienceType === 'all') {
      // Clients ayant commandé (emails uniques)
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('customer_email, customer_name')
        .not('customer_email', 'is', null);

      if (!ordersError && orders) {
        // Filtrer les emails uniques et qui ne sont pas déjà dans les abonnés
        const existingEmails = new Set(recipients.map(r => r.email));
        const uniqueCustomers = orders
          .filter(order => order.customer_email && !existingEmails.has(order.customer_email))
          .map(order => ({
            email: order.customer_email,
            name: order.customer_name
          }));
        
        // Dédupliquer les clients
        const customerMap = new Map();
        uniqueCustomers.forEach(customer => {
          if (!customerMap.has(customer.email)) {
            customerMap.set(customer.email, customer);
          }
        });
        
        recipients = [...recipients, ...Array.from(customerMap.values())];
      }
    }

    // Simuler l'envoi d'emails (à remplacer par un vrai service d'email)
    console.log(`📧 Envoi de la campagne "${campaign.title}" à ${recipients.length} destinataires`);
    console.log(`   Public: ${audienceType === 'all' ? 'Tous' : audienceType === 'subscribers' ? 'Abonnés newsletter' : 'Clients'}`);
    
    // Mettre à jour la campagne
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sent', 
        sent_at: new Date().toISOString(),
        sent_count: recipients.length,
        audience: audienceType
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.json({ 
      success: true, 
      data: updatedCampaign,
      message: `Campagne envoyée à ${recipients.length} destinataires (${audienceType === 'all' ? 'Tous' : audienceType === 'subscribers' ? 'Abonnés newsletter' : 'Clients'})` 
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ CODES PROMO ============

// Obtenir tous les codes promo
router.get('/promo-codes', authenticateAdmin, async (req, res) => {
  try {
    const { supabase } = req.app.locals;
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { promoCodes: data || [] } });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Créer un code promo
router.post('/promo-codes', authenticateAdmin, async (req, res) => {
  try {
    const { 
      code, 
      description, 
      discount_type, 
      discount_value, 
      min_purchase,
      max_discount,
      usage_limit, 
      valid_from, 
      valid_until 
    } = req.body;
    
    const { supabase } = req.app.locals;

    const { data, error } = await supabase
      .from('promo_codes')
      .insert([{ 
        code: code.toUpperCase(), 
        description, 
        discount_type, 
        discount_value,
        min_purchase: min_purchase || 0,
        max_discount,
        usage_limit, 
        valid_from: valid_from || new Date().toISOString(), 
        valid_until,
        is_active: true 
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Ce code promo existe déjà' 
        });
      }
      throw error;
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Valider un code promo
router.post('/promo-codes/validate', async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const { supabase } = req.app.locals;

    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promoCode) {
      return res.status(404).json({ 
        success: false, 
        message: 'Code promo invalide' 
      });
    }

    // Vérifier la validité
    const now = new Date();
    const validFrom = new Date(promoCode.valid_from);
    const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null;

    if (now < validFrom) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce code promo n\'est pas encore actif' 
      });
    }

    if (validUntil && now > validUntil) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce code promo a expiré' 
      });
    }

    // Vérifier le montant minimum
    if (orderAmount < promoCode.min_purchase) {
      return res.status(400).json({ 
        success: false, 
        message: `Montant minimum requis: ${promoCode.min_purchase} GNF` 
      });
    }

    // Vérifier la limite d'utilisation
    if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce code promo a atteint sa limite d\'utilisation' 
      });
    }

    // Calculer la réduction
    let discountAmount = 0;
    if (promoCode.discount_type === 'percentage') {
      discountAmount = (orderAmount * promoCode.discount_value) / 100;
      if (promoCode.max_discount) {
        discountAmount = Math.min(discountAmount, promoCode.max_discount);
      }
    } else {
      discountAmount = promoCode.discount_value;
    }

    res.json({ 
      success: true, 
      data: {
        promoCode,
        discountAmount,
        finalAmount: orderAmount - discountAmount
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Appliquer un code promo (lors de la commande)
router.post('/promo-codes/apply', async (req, res) => {
  try {
    const { code, orderId, customerEmail, discountAmount } = req.body;
    const { supabase } = req.app.locals;

    // Récupérer le code promo
    const { data: promoCode, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (promoError) throw promoError;

    // Enregistrer l'utilisation
    const { error: usageError } = await supabase
      .from('promo_code_usage')
      .insert([{ 
        promo_code_id: promoCode.id, 
        order_id: orderId,
        customer_email: customerEmail,
        discount_amount: discountAmount 
      }]);

    if (usageError) throw usageError;

    // Incrémenter le compteur d'utilisation
    const { error: updateError } = await supabase
      .from('promo_codes')
      .update({ usage_count: promoCode.usage_count + 1 })
      .eq('id', promoCode.id);

    if (updateError) throw updateError;

    res.json({ success: true, message: 'Code promo appliqué avec succès' });
  } catch (error) {
    console.error('Error applying promo code:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Désactiver un code promo
router.put('/promo-codes/:id/deactivate', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { supabase } = req.app.locals;

    const { data, error } = await supabase
      .from('promo_codes')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error deactivating promo code:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============ RÉSEAUX SOCIAUX ============

// Enregistrer un partage
router.post('/social/share', async (req, res) => {
  try {
    const { platform, contentType, contentId, shareUrl } = req.body;
    const { supabase } = req.app.locals;

    const { data, error } = await supabase
      .from('social_shares')
      .insert([{ platform, content_type: contentType, content_id: contentId, share_url: shareUrl }])
      .select()
      .single();

    if (error) throw error;

    // Incrémenter le compteur
    await supabase.rpc('increment_share_count', { share_id: data.id });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error recording share:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Obtenir les statistiques de partage
router.get('/social/stats', authenticateAdmin, async (req, res) => {
  try {
    const { supabase } = req.app.locals;
    const { data, error } = await supabase
      .from('social_shares')
      .select('platform, share_count')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Agréger par plateforme
    const stats = data.reduce((acc, share) => {
      if (!acc[share.platform]) {
        acc[share.platform] = 0;
      }
      acc[share.platform] += share.share_count;
      return acc;
    }, {});

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching social stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
