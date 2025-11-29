import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Abonner automatiquement un email aux notifications
export async function POST(request: NextRequest) {
  try {
    const { email, customerName, phone } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const { data: existing } = await supabase
      .from('email_push_subscribers')
      .select('*')
      .eq('email', email)
      .single();

    if (existing) {
      // Mettre à jour les infos si nécessaire
      await supabase
        .from('email_push_subscribers')
        .update({
          customer_name: customerName,
          phone: phone,
          last_order_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('email', email);

      return NextResponse.json({
        success: true,
        message: 'Abonnement mis à jour',
        alreadySubscribed: true
      });
    }

    // Créer un nouvel abonnement
    const { data, error } = await supabase
      .from('email_push_subscribers')
      .insert({
        email,
        customer_name: customerName,
        phone: phone,
        subscribed: true,
        last_order_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Abonné avec succès aux notifications',
      subscriber: data
    });
  } catch (error: any) {
    console.error('Erreur abonnement email:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'abonnement' },
      { status: 500 }
    );
  }
}

// Désabonner un email
export async function DELETE(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('email_push_subscribers')
      .update({ subscribed: false })
      .eq('email', email);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Désabonné avec succès'
    });
  } catch (error: any) {
    console.error('Erreur désabonnement:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
