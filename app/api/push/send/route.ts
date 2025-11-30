import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration VAPID (à configurer avec vos propres clés)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@grandsonproject.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      body, 
      url, 
      icon, 
      image, 
      subscriptions: providedSubs, 
      type = 'custom',
      audience = 'all' // 'newsletter', 'customers', 'all'
    } = await request.json();
    
    // Si pas d'abonnements fournis, récupérer selon l'audience
    let subscriptions = providedSubs;
    if (!subscriptions || subscriptions.length === 0) {
      subscriptions = await getAudienceSubscriptions(audience);
      
      if (!subscriptions || subscriptions.length === 0) {
        return NextResponse.json({
          success: true,
          sent: 0,
          message: 'Aucun abonné pour cette audience'
        });
      }
    }

    const payload = JSON.stringify({
      title: title || 'Grandson Project',
      body: body || 'Nouvelle notification',
      url: url || '/',
      icon: icon || '/icon-192x192.png',
      image: image,
      tag: 'notification-' + Date.now()
    });

    const results = await Promise.allSettled(
      subscriptions.map((subscription: any) =>
        webpush.sendNotification(subscription, payload)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Enregistrer dans l'historique
    try {
      await supabase
        .from('notification_history')
        .insert({
          title,
          body,
          type,
          sent_count: successful,
          failed_count: failed
        });
    } catch (err) {
      console.error('Erreur enregistrement historique:', err);
    }

    console.log(`✅ Notifications envoyées: ${successful} succès, ${failed} échecs`);

    return NextResponse.json({
      success: true,
      sent: successful,
      failed: failed,
      total: subscriptions.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi des notifications'
      },
      { status: 500 }
    );
  }
}

// Récupérer les abonnements selon l'audience
async function getAudienceSubscriptions(audience: string): Promise<any[]> {
  try {
    const emailsToInclude = new Set<string>();

    // Récupérer les emails selon l'audience
    if (audience === 'newsletter' || audience === 'all') {
      const { data: subscribers } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('subscribed', true);
      
      subscribers?.forEach(sub => emailsToInclude.add(sub.email));
    }

    if (audience === 'customers' || audience === 'all') {
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_email')
        .not('customer_email', 'is', null);
      
      orders?.forEach(order => {
        if (order.customer_email) {
          emailsToInclude.add(order.customer_email);
        }
      });
    }

    // Si aucune audience spécifique, récupérer tous les abonnés push
    if (emailsToInclude.size === 0 && audience === 'all') {
      const { data: allSubs } = await supabase
        .from('push_subscriptions')
        .select('*');
      
      return allSubs?.map(sub => ({
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      })) || [];
    }

    // Récupérer les abonnements push pour ces emails
    const { data: pushSubs } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_email', Array.from(emailsToInclude));

    return pushSubs?.map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth
      }
    })) || [];
  } catch (error) {
    console.error('Erreur récupération abonnements:', error);
    return [];
  }
}

// GET: Récupérer les statistiques d'audience pour les notifications push
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'audience-stats') {
      const stats = await getPushAudienceStats();
      return NextResponse.json({ success: true, data: stats });
    }

    return NextResponse.json(
      { success: false, error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erreur GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// Statistiques d'audience pour les notifications push
async function getPushAudienceStats() {
  try {
    // Total des abonnés push
    const { count: totalPushSubs } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    // Abonnés newsletter avec push
    const { data: newsletterEmails } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('subscribed', true);
    
    const newsletterEmailSet = new Set(newsletterEmails?.map(s => s.email) || []);
    
    const { data: newsletterPushSubs } = await supabase
      .from('push_subscriptions')
      .select('user_email')
      .in('user_email', Array.from(newsletterEmailSet));

    // Clients avec push
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_email')
      .not('customer_email', 'is', null);
    
    const customerEmailSet = new Set(orders?.map(o => o.customer_email).filter(Boolean) || []);
    
    const { data: customerPushSubs } = await supabase
      .from('push_subscriptions')
      .select('user_email')
      .in('user_email', Array.from(customerEmailSet));

    return {
      newsletter: newsletterPushSubs?.length || 0,
      customers: customerPushSubs?.length || 0,
      all: totalPushSubs || 0
    };
  } catch (error) {
    console.error('Erreur stats audience push:', error);
    return {
      newsletter: 0,
      customers: 0,
      all: 0
    };
  }
}
