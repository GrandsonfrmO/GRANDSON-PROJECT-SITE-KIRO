import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/products - Récupérer les produits depuis Supabase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Construire la requête Supabase
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    // Filtrer par catégorie si spécifiée
    if (category && category !== 'Tous') {
      query = query.eq('category', category);
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data: products, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erreur lors de la récupération des produits'
        },
        products: []
      }, { status: 500 });
    }

    // Transformer les données pour le frontend
    const transformedProducts = (products || []).map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      sizes: product.sizes || [],
      images: product.images || [],
      colors: product.colors || [],
      stock: product.stock,
      isActive: product.is_active,
      isNew: product.is_new,
      isFeatured: product.is_featured,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur interne du serveur'
      },
      products: []
    }, { status: 500 });
  }
}

// POST /api/products - Créer un produit (Admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        name: body.name,
        description: body.description,
        price: body.price,
        original_price: body.originalPrice,
        category: body.category,
        sizes: body.sizes,
        images: body.images,
        colors: body.colors,
        stock: body.stock,
        is_active: body.isActive ?? true,
        is_new: body.isNew ?? false,
        is_featured: body.isFeatured ?? false
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erreur lors de la création du produit'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product
    }, { status: 201 });
  } catch (error) {
    console.error('Create product API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur lors de la création du produit'
      }
    }, { status: 500 });
  }
}
