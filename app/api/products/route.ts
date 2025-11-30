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

// GET /api/products - Public endpoint for product listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
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

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = (products || []).slice(startIndex, endIndex).map(transformProduct);

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: products?.length || 0,
        totalPages: Math.ceil((products?.length || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
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

// POST /api/products - Create new product (Admin only)
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

    if (name.length < 2 || name.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le nom du produit doit contenir entre 2 et 100 caractères'
          }
        },
        { status: 400 }
      );
    }

    if (parseFloat(price) <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le prix doit être positif'
          }
        },
        { status: 400 }
      );
    }

    if (parseInt(stock) < 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Le stock ne peut pas être négatif'
          }
        },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Create product directly in Supabase
    const priceValue = parseFloat(price);
    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name: name.trim(),
        description: description || '',
        price: priceValue,
        base_price: priceValue, // Colonne requise dans Supabase
        category,
        sizes: sizes && sizes.length > 0 ? (Array.isArray(sizes) ? sizes : [sizes]) : ['Unique'],
        images: Array.isArray(images) ? images : (images ? [images] : []),
        colors: colors && colors.length > 0 ? (Array.isArray(colors) ? colors : [colors]) : null,
        stock: parseInt(stock),
        is_active: is_active !== undefined ? is_active : true
      }])
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
