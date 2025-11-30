import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Envoyer une notification à tous les abonnés email
export async function POST(request: NextRequest) {
  try {
    const { title, message, url, audience } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Titre et message requis' },
        { status: 400 }
      );
    }

    // Récupérer les abonnés selon l'audience
    let query = supabase
      .from('email_push_subscribers')
      .select('*')
      .eq('subscribed', true);

    // Filtrer par audience si spécifié
    if (audience === 'recent_customers') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.gte('last_order_at', thirtyDaysAgo.toISOString());
    } else if (audience === 'inactive_customers') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query = query.lt('last_order_at', thirtyDaysAgo.toISOString());
    }

    const { data: subscribers, error } = await query;

    if (error) throw error;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'Aucun abonné trouvé'
      });
    }

    // Créer l'historique de notification
    const { data: notification, error: notifError } = await supabase
      .from('push_notifications_history')
      .insert({
        title,
        message,
        url: url || '/',
        audience: audience || 'all',
        recipients_count: subscribers.length,
        sent_at: new Date().toISOString()
      })
      .select()
      .single();

    if (notifError) {
      console.error('Erreur création historique:', notifError);
    }

    // TODO: Intégrer avec un service d'email/SMS pour envoyer réellement
    // Pour l'instant, on simule l'envoi
    console.log(`Notification envoyée à ${subscribers.length} abonnés:`, {
      title,
      message,
      url,
      emails: subscribers.map(s => s.email)
    });

    return NextResponse.json({
      success: true,
      sent: subscribers.length,
      subscribers: subscribers.map(s => ({
        email: s.email,
        name: s.customer_name
      })),
      notificationId: notification?.id
    });
  } catch (error: any) {
    console.error('Erreur envoi notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'envoi' },
      { status: 500 }
    );
  }
}

// Obtenir les statistiques des abonnés
export async function GET() {
  try {
    const { data: allSubscribers, count: totalCount } = await supabase
      .from('email_push_subscribers')
      .select('*', { count: 'exact' })
      .eq('subscribed', true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentCount } = await supabase
      .from('email_push_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('subscribed', true)
      .gte('last_order_at', thirtyDaysAgo.toISOString());

    const { count: inactiveCount } = await supabase
      .from('email_push_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('subscribed', true)
      .lt('last_order_at', thirtyDaysAgo.toISOString());

    return NextResponse.json({
      total: totalCount || 0,
      recent: recentCount || 0,
      inactive: inactiveCount || 0,
      subscribers: allSubscribers || []
    });
  } catch (error: any) {
    console.error('Erreur récupération stats:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
