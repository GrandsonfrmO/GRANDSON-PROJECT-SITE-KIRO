import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: subscribers, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ 
      subscribers: subscribers || [],
      count: subscribers?.length || 0
    });
  } catch (error) {
    console.error('Erreur récupération abonnés:', error);
    return NextResponse.json({ 
      subscribers: [],
      count: 0
    }, { status: 200 });
  }
}
