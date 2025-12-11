import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};

// GET /api/debug/products - Debug endpoint to check all products
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Get ALL products (including inactive ones)
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      return NextResponse.json({
        success: false,
        error: allError.message,
        allProducts: []
      }, { status: 500 });
    }

    // Get only active products
    const { data: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (activeError) {
      return NextResponse.json({
        success: false,
        error: activeError.message,
        activeProducts: []
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      totalProducts: allProducts?.length || 0,
      activeProducts: activeProducts?.length || 0,
      allProducts: allProducts?.map(p => ({
        id: p.id,
        name: p.name,
        is_active: p.is_active,
        created_at: p.created_at,
        price: p.price,
        stock: p.stock
      })) || [],
      activeProductsList: activeProducts?.map(p => ({
        id: p.id,
        name: p.name,
        is_active: p.is_active,
        created_at: p.created_at,
        price: p.price,
        stock: p.stock
      })) || []
    });
  } catch (error) {
    console.error('Debug products error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
