import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { productName, stock, productId } = await request.json();

    // Vérifier si les notifications de stock faible sont activées
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('settings')
      .eq('id', 'auto_notifications')
      .single();

    if (!settings?.settings?.lowStock) {
      return NextResponse.json({ 
        message: 'Notifications de stock désactivées',
        skipped: true 
      });
    }

    // Envoyer la notification
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/push/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '⚠️ Stock faible',
        body: `${productName} - Plus que ${stock} en stock`,
        icon: '/icon-192x192.png',
        url: `/admin/products`,
        type: 'stock'
      })
    });

    const result = await response.json();

    return NextResponse.json({ 
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erreur notification stock:', error);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'envoi de la notification' 
    }, { status: 500 });
  }
}
