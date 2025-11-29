import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('id', 'auto_notifications')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return NextResponse.json({ 
      settings: data?.settings || {
        newOrders: true,
        lowStock: true,
        promotions: false
      }
    });
  } catch (error) {
    console.error('Erreur récupération paramètres:', error);
    return NextResponse.json({ 
      settings: {
        newOrders: true,
        lowStock: true,
        promotions: false
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    const { error } = await supabase
      .from('notification_settings')
      .upsert({
        id: 'auto_notifications',
        settings,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur sauvegarde paramètres:', error);
    return NextResponse.json({ 
      error: 'Erreur de sauvegarde' 
    }, { status: 500 });
  }
}
