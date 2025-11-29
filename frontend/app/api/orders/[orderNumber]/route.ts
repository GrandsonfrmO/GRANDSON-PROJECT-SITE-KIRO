import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Données de démonstration pour les commandes
const demoOrder = {
  id: '1',
  orderNumber: 'GP-2024-001',
  status: 'confirmed',
  customerInfo: {
    name: 'Client Démo',
    email: 'demo@example.com',
    phone: '+224 123 456 789'
  },
  items: [
    {
      id: '1',
      name: 'T-Shirt Grandson Classic',
      price: 45000,
      quantity: 2,
      size: 'M',
      color: 'Noir'
    }
  ],
  deliveryInfo: {
    address: 'Conakry, Guinée',
    zone: 'Conakry Centre',
    fee: 5000
  },
  total: 95000,
  createdAt: new Date().toISOString()
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    
    console.log('📦 Frontend API: Fetching order:', orderNumber);
    
    // Essayer de se connecter au backend d'abord
    try {
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout rapide pour éviter d'attendre trop longtemps
        signal: AbortSignal.timeout(2000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Order fetched from backend:', orderNumber);
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('Backend not available, using demo data');
    }
    
    // Utiliser les données de démonstration si le backend n'est pas disponible
    console.log('✅ Using demo order data for:', orderNumber);
    
    return NextResponse.json({
      success: true,
      data: {
        order: {
          ...demoOrder,
          orderNumber: orderNumber
        }
      }
    });
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération de la commande'
        }
      },
      { status: 500 }
    );
  }
}