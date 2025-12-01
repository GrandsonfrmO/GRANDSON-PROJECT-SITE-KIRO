import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase avec la clé service pour les opérations admin
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Transform product data from snake_case to camelCase
const transformProduct = (product: any) => {
  if (!product) return null;
  return {
    ...product,
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
};

// GET /api/admin/products - Admin endpoint for all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Get admin token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token d\'authentification requis'
          }
        },
        { status: 401 }
      );
    }

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: error.message
        },
        products: []
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      products: (products || []).map(transformProduct)
    });
  } catch (error) {
    console.error('Admin products API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des produits'
        }
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 Création produit - données reçues:', JSON.stringify(body, null, 2));
    
    // Get admin token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token d\'authentification requis'
          }
        },
        { status: 401 }
      );
    }

    // Validation
    const { name, price, category, stock, description, sizes, images, colors, is_active } = body;

    if (!name || !price || !category || stock === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Nom, prix, catégorie et stock sont requis'
          }
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Récupérer un seller_id existant depuis la table users ou products
    let sellerId: string | null = null;
    
    // D'abord essayer de récupérer depuis un produit existant
    const { data: existingProduct } = await supabase
      .from('products')
      .select('seller_id')
      .not('seller_id', 'is', null)
      .limit(1)
      .single();
    
    sellerId = existingProduct?.seller_id;
    
    if (!sellerId) {
      // Essayer de récupérer depuis la table users
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();
      sellerId = userData?.id;
    }
    
    // Si toujours pas de seller_id, on laisse NULL (la table doit l'accepter)
    console.log('📝 seller_id utilisé:', sellerId || 'NULL');

    // Create product directly in Supabase
    const priceValue = parseFloat(price);
    const stockValue = parseInt(stock);
    
    const productData = {
      name: name.trim(),
      description: description || '',
      base_price: priceValue,
      price: priceValue,
      images: Array.isArray(images) ? images : (images ? [images] : []),
      category: category,
      attributes: JSON.stringify({ name: name.trim(), description: description || '' }),
      total_stock: stockValue,
      sizes: Array.isArray(sizes) ? sizes : (sizes ? [sizes] : ['Unique']),
      colors: colors && colors.length > 0 ? (Array.isArray(colors) ? colors : [colors]) : null,
      stock: stockValue,
      is_active: is_active !== undefined ? is_active : true,
      seller_id: sellerId
    };
    
    console.log('📦 Données à insérer:', JSON.stringify(productData, null, 2));

    const { data: product, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase create error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message
          }
        },
        { status: 500 }
      );
    }

    console.log('✅ Produit créé:', product.id);

    return NextResponse.json({
      success: true,
      data: { product: transformProduct(product) }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Create product API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Erreur lors de la création du produit: ${errorMessage}`
        }
      },
      { status: 500 }
    );
  }
}