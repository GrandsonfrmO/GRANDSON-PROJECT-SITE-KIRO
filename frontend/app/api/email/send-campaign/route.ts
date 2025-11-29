import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuration email (Resend, SendGrid, etc.)
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'contact@grandsonproject.com';

export async function POST(request: NextRequest) {
  try {
    const { 
      subject, 
      htmlContent, 
      textContent,
      audience, // 'newsletter', 'customers', 'all'
      campaignName 
    } = await request.json();

    if (!subject || !htmlContent) {
      return NextResponse.json(
        { success: false, error: 'Sujet et contenu requis' },
        { status: 400 }
      );
    }

    // Récupérer les emails selon l'audience
    const recipients = await getAudienceEmails(audience);

    if (recipients.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'Aucun destinataire trouvé pour cette audience'
      });
    }

    // Envoyer les emails (batch par 100 pour éviter les limites)
    const batchSize = 100;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      try {
        await sendEmailBatch(batch, subject, htmlContent, textContent);
        sent += batch.length;
      } catch (error) {
        console.error('Erreur envoi batch:', error);
        failed += batch.length;
      }
    }

    // Enregistrer la campagne dans l'historique
    try {
      await supabase
        .from('email_campaigns')
        .insert({
          name: campaignName || subject,
          subject,
          audience,
          sent_count: sent,
          failed_count: failed,
          status: 'sent'
        });
    } catch (err) {
      console.error('Erreur enregistrement campagne:', err);
    }

    console.log(`✅ Emails envoyés: ${sent} succès, ${failed} échecs`);

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: recipients.length
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi des emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi des emails'
      },
      { status: 500 }
    );
  }
}

// Récupérer les emails selon l'audience
async function getAudienceEmails(audience: string): Promise<string[]> {
  const emails = new Set<string>();

  try {
    // Abonnés newsletter
    if (audience === 'newsletter' || audience === 'all') {
      const { data: subscribers } = await supabase
        .from('newsletter_subscribers')
        .select('email')
        .eq('subscribed', true);
      
      subscribers?.forEach(sub => emails.add(sub.email));
    }

    // Clients ayant commandé
    if (audience === 'customers' || audience === 'all') {
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_email')
        .not('customer_email', 'is', null);
      
      orders?.forEach(order => {
        if (order.customer_email) {
          emails.add(order.customer_email);
        }
      });
    }

    return Array.from(emails);
  } catch (error) {
    console.error('Erreur récupération emails:', error);
    return [];
  }
}

// Envoyer un batch d'emails
async function sendEmailBatch(
  recipients: string[], 
  subject: string, 
  htmlContent: string,
  textContent?: string
): Promise<void> {
  // Exemple avec Resend (adapter selon votre service)
  if (!EMAIL_API_KEY) {
    console.warn('⚠️ EMAIL_API_KEY non configuré, simulation d\'envoi');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(
        recipients.map(email => ({
          from: FROM_EMAIL,
          to: email,
          subject,
          html: htmlContent,
          text: textContent || subject
        }))
      )
    });

    if (!response.ok) {
      throw new Error(`Erreur API email: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Erreur envoi batch:', error);
    throw error;
  }
}

// GET: Récupérer les statistiques d'audience
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'audience-stats') {
      const stats = await getAudienceStats();
      return NextResponse.json({ success: true, data: stats });
    }

    if (action === 'campaigns') {
      const { data: campaigns } = await supabase
        .from('email_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      return NextResponse.json({ success: true, data: campaigns || [] });
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

// Statistiques d'audience
async function getAudienceStats() {
  try {
    // Abonnés newsletter
    const { count: newsletterCount } = await supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('subscribed', true);

    // Clients uniques
    const { data: orders } = await supabase
      .from('orders')
      .select('customer_email')
      .not('customer_email', 'is', null);
    
    const uniqueCustomers = new Set(orders?.map(o => o.customer_email) || []).size;

    // Total unique (union des deux)
    const allEmails = await getAudienceEmails('all');

    return {
      newsletter: newsletterCount || 0,
      customers: uniqueCustomers,
      all: allEmails.length
    };
  } catch (error) {
    console.error('Erreur stats audience:', error);
    return {
      newsletter: 0,
      customers: 0,
      all: 0
    };
  }
}
