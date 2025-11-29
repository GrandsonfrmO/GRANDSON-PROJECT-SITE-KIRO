import { NextRequest, NextResponse } from 'next/server';

// Stocker les abonnements (en production, utilisez une base de données)
const subscriptions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();
    
    // Extraire l'endpoint comme clé unique
    const endpoint = subscription.endpoint;
    
    // Stocker l'abonnement
    subscriptions.set(endpoint, {
      subscription,
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Nouvel abonnement push enregistré:', endpoint);
    console.log('📊 Total abonnements:', subscriptions.size);
    
    return NextResponse.json({
      success: true,
      message: 'Abonnement enregistré avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur lors de l\'enregistrement de l\'abonnement:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'enregistrement'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    count: subscriptions.size,
    subscriptions: Array.from(subscriptions.values()).map(s => ({
      endpoint: s.subscription.endpoint.substring(0, 50) + '...',
      createdAt: s.createdAt
    }))
  });
}
