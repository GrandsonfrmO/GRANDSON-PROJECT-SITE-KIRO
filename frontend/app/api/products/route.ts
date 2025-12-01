import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseKey);
};

// Transform product data from snake_case to camelCase
const transformProduct = (product: any) => {
  if (!product) return null;
  
  // Parse images if it's a string
  let images = product.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [images];
    }
  }
  if (!Array.isArray(images)) {
    images = images ? [images] : [];
  }
  
  // Parse sizes if it's a string
  let sizes = product.sizes;
  if (typeof sizes === 'string') {
    try {
      sizes = JSON.parse(sizes);
    } catch (e) {
      sizes = [sizes];
    }
  }
  if (!Array.isArray(sizes)) {
    sizes = sizes ? [sizes] : ['Unique'];
  }
  
  // Parse colors if it's a string
  let colors = product.colors;
  if (typeof colors === 'string') {
    try {
      colors = JSON.parse(colors);
    } catch (e) {
      colors = [colors];
    }
  }
  if (colors && !Array.isArray(colors)) {
    colors = [colors];
  }
  
  return {
    ...product,
    images,
    sizes,
    colors,
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

    const supabase = getSupabaseClient();

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

    // Forward to backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
    
    console.log('📡 Envoi vers backend:', backendUrl);
    
    const response = await fetch(`${backendUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000) // 10 secondes timeout
    });

    const data = await response.json();
    
    console.log('📬 Réponse backend:', response.status, JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    console.error('❌ Create product API error:', error);
    
    // Message d'erreur plus détaillé
    let errorMessage = 'Erreur lors de la création du produit';
    const errorObj = error as { name?: string; message?: string; code?: string };
    
    if (errorObj.name === 'AbortError' || errorObj.message?.includes('timeout')) {
      errorMessage = 'Le serveur backend ne répond pas. Vérifiez qu\'il est démarré.';
    } else if (errorObj.code === 'ECONNREFUSED' || errorObj.message?.includes('ECONNREFUSED')) {
      errorMessage = 'Impossible de se connecter au backend. Le serveur n\'est pas démarré.';
    } else if (errorObj.message?.includes('fetch failed')) {
      errorMessage = 'Erreur de connexion au backend. Vérifiez que le serveur est accessible.';
    } else if (errorObj.message) {
      errorMessage = `Erreur: ${errorObj.message}`;
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: errorMessage
        }
      },
      { status: 500 }
    );
  }
}