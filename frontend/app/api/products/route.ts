import { NextRequest, NextResponse } from 'next/server';

// Données de démonstration
const demoProducts = [
  {
    id: '1',
    name: 'T-Shirt Grandson Classic',
    description: 'T-shirt premium en coton bio avec logo Grandson Project',
    price: 45000,
    category: 'T-Shirts',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: ['/placeholder-product.svg'],
    colors: ['Noir', 'Blanc', 'Gris', 'Rouge', 'Bleu'],
    stock: 15,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Casquette Streetwear',
    description: 'Casquette ajustable avec broderie exclusive',
    price: 25000,
    category: 'Accessoires',
    sizes: ['Unique'],
    images: ['/placeholder-product.svg'],
    colors: ['Noir', 'Rouge', 'Blanc', 'Bleu'],
    stock: 8,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Hoodie Urban Style',
    description: 'Sweat à capuche confortable pour un style urbain',
    price: 75000,
    category: 'Sweats',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['/placeholder-product.svg'],
    colors: ['Noir', 'Gris', 'Marine'],
    stock: 12,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Jean Slim Fit',
    description: 'Jean moderne avec coupe ajustée',
    price: 85000,
    category: 'Pantalons',
    sizes: ['28', '30', '32', '34', '36'],
    images: ['/placeholder-product.svg'],
    colors: ['Bleu', 'Noir'],
    stock: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/products - Public endpoint for product listing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Essayer de se connecter au backend d'abord
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      const queryString = new URLSearchParams({
        ...(category && { category }),
        page: page.toString(),
        limit: limit.toString()
      }).toString();

      const response = await fetch(`${backendUrl}/api/products?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout rapide pour éviter d'attendre trop longtemps
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend response to match expected frontend format
        if (data.success && data.data && data.data.products) {
          return NextResponse.json({
            success: true,
            products: data.data.products,
            pagination: data.data.pagination
          });
        }
        return NextResponse.json(data);
      }
    } catch (backendError: any) {
      console.error('Backend error:', backendError.message || backendError);
      // Retourner l'erreur au lieu des données de démonstration
      return NextResponse.json({
        success: false,
        error: {
          code: 'BACKEND_ERROR',
          message: 'Impossible de se connecter à la base de données. Vérifiez les permissions RLS dans Supabase.'
        },
        products: []
      });
    }

    // Fallback - ne devrait pas arriver si le backend répond
    let filteredProducts = demoProducts;

    // Filtrer par catégorie si spécifiée
    if (category) {
      filteredProducts = demoProducts.filter(p => p.category === category);
    }

    // Pagination simple
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limit)
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
    const response = await fetch(`${backendUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create product API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la création du produit'
        }
      },
      { status: 500 }
    );
  }
}