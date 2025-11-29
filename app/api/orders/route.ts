import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 Frontend API: Creating order...');
    console.log('Order data:', JSON.stringify(body, null, 2));
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Order created via backend:', data.data?.order?.orderNumber);
        return NextResponse.json(data);
      }
      
      console.error('❌ Backend failed, using demo mode');
    } catch (backendError) {
      console.log('Backend not available, using demo mode');
    }
    
    // Mode démo si backend indisponible
    const orderNumber = `GS${Date.now().toString().slice(-8)}`;
    const demoOrder = {
      orderNumber,
      ...body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    console.log('✅ Demo order created:', orderNumber);
    
    return NextResponse.json({
      success: true,
      data: {
        order: demoOrder
      }
    });
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la création de la commande'
        }
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Frontend API: Fetching orders from backend...');
    
    // Transférer la requête au backend
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Backend orders fetch failed:', data);
      return NextResponse.json(data, { status: response.status });
    }
    
    console.log('✅ Orders fetched successfully from backend');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des commandes'
        }
      },
      { status: 500 }
    );
  }
}