import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/products - Admin endpoint for all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';

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
    const queryString = new URLSearchParams({
      ...(category && { category }),
      page,
      limit
    }).toString();

    const response = await fetch(`${backendUrl}/api/admin/products?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
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

    console.log('📦 Frontend API: Creating product via backend...');

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

    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin products creation API error:', error);
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