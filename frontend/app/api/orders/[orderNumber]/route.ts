import { NextRequest, NextResponse } from 'next/server';
import {
  OrderErrorCode,
  createError,
  mapBackendError,
  mapJavaScriptError,
  logError,
} from '@/app/lib/orderErrors';
import { demoOrdersStore } from '@/app/lib/demoOrdersStore';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Helper function to get timestamp
const getTimestamp = () => new Date().toISOString();

// Generate realistic fallback demo order data
const generateFallbackDemoOrder = (orderNumber: string) => {
  const demoId = `demo-fallback-${Date.now()}`;
  
  return {
    id: demoId,
    orderNumber: orderNumber,
    order_number: orderNumber,
    
    // Customer information
    customerName: 'Client Démo',
    customerPhone: '+224 123 456 789',
    customerEmail: 'demo@grandson-project.com',
    
    // Delivery information
    deliveryAddress: 'Conakry, Guinée',
    deliveryZone: 'Ratoma',
    deliveryFee: 20000,
    
    // Order details
    totalAmount: 95000,
    total: 95000,
    status: 'PENDING',
    
    // Timestamps
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    
    // Sample items
    items: [
      {
        id: `${demoId}-item-1`,
        orderId: demoId,
        productId: 'demo-product-1',
        size: 'M',
        quantity: 2,
        price: 37500,
        color: 'Noir',
        product: {
          id: 'demo-product-1',
          name: 'T-Shirt Grandson Classic',
          images: []
        }
      }
    ]
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${getTimestamp()}] 📦 Frontend API GET /api/orders/[orderNumber] - START`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    const { orderNumber } = await params;
    
    // Validate order number format
    if (!orderNumber || orderNumber.trim().length === 0) {
      const error = createError(
        OrderErrorCode.VALIDATION_ERROR,
        'Numéro de commande invalide',
        undefined,
        'orderNumber'
      );
      logError('GET /api/orders/[orderNumber] - Validation', error, { orderNumber });
      console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      return NextResponse.json(
        {
          success: false,
          error
        },
        { status: 400 }
      );
    }
    
    console.log(`[${getTimestamp()}] 🎫 Fetching order: ${orderNumber}`);
    console.log(`[${getTimestamp()}] 🔌 Backend URL: ${BACKEND_URL}`);
    
    // Essayer de se connecter au backend d'abord
    try {
      const backendStartTime = Date.now();
      console.log(`[${getTimestamp()}] ⏱️  Backend request timeout: 2000ms`);
      console.log(`[${getTimestamp()}] 🔌 Attempting backend connection...`);
      
      const response = await fetch(`${BACKEND_URL}/api/orders/${orderNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Timeout rapide pour éviter d'attendre trop longtemps
        signal: AbortSignal.timeout(2000)
      });
      
      const backendDuration = Date.now() - backendStartTime;
      console.log(`[${getTimestamp()}] ⏱️  Backend response time: ${backendDuration}ms`);
      console.log(`[${getTimestamp()}] 📡 Backend response status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`[${getTimestamp()}] 📥 Backend response data received`);
        console.log(`[${getTimestamp()}] ✅ Order fetched successfully from backend: ${orderNumber}`);
        console.log(`[${getTimestamp()}] 📊 Order details:`, JSON.stringify({
          orderNumber: data.data?.order?.orderNumber,
          status: data.data?.order?.status,
          itemCount: data.data?.order?.items?.length || 0
        }, null, 2));
        console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return NextResponse.json(data);
      }
      
      // Backend returned an error
      const data = await response.json();
      console.log(`[${getTimestamp()}] ⚠️  Backend returned non-OK status: ${response.status}`);
      
      const backendError = mapBackendError(data);
      
      // If it's a 404, return ORDER_NOT_FOUND error
      if (response.status === 404) {
        const notFoundError = createError(
          OrderErrorCode.ORDER_NOT_FOUND,
          undefined,
          `Commande ${orderNumber} introuvable`
        );
        logError('GET /api/orders/[orderNumber] - Not Found', notFoundError, {
          orderNumber,
          backendResponse: data
        });
        console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        
        return NextResponse.json(
          {
            success: false,
            error: notFoundError
          },
          { status: 404 }
        );
      }
      
      logError('GET /api/orders/[orderNumber] - Backend Error', backendError, {
        orderNumber,
        status: response.status,
        backendResponse: data
      });
      
      console.log(`[${getTimestamp()}] 🔄 Falling back to demo mode`);
    } catch (backendError) {
      const error = backendError instanceof Error
        ? mapJavaScriptError(backendError)
        : createError(OrderErrorCode.BACKEND_UNAVAILABLE);
      
      logError('GET /api/orders/[orderNumber] - Backend Connection', error, {
        orderNumber,
        backendUrl: BACKEND_URL,
        originalError: backendError instanceof Error ? {
          name: backendError.name,
          message: backendError.message
        } : String(backendError)
      });
      
      console.log(`[${getTimestamp()}] 🔄 Activating demo mode`);
    }
    
    // Utiliser les données de démonstration si le backend n'est pas disponible
    console.log(`[${getTimestamp()}] 🎭 DEMO MODE ACTIVATED`);
    console.log(`[${getTimestamp()}] 🔍 Checking demo orders store for: ${orderNumber}`);
    console.log(`[${getTimestamp()}] 📊 Demo orders store size: ${demoOrdersStore.size}`);
    
    // Check if we have this order in the demo store (from POST request)
    let demoOrderData = demoOrdersStore.get(orderNumber);
    
    if (demoOrderData) {
      console.log(`[${getTimestamp()}] ✅ Found demo order in store: ${orderNumber}`);
      console.log(`[${getTimestamp()}] 📄 Demo order details:`, JSON.stringify({
        orderNumber: demoOrderData.orderNumber,
        customerName: demoOrderData.customerName,
        itemCount: demoOrderData.items?.length || 0,
        totalAmount: demoOrderData.totalAmount
      }, null, 2));
    } else {
      console.log(`[${getTimestamp()}] ⚠️  Demo order not found in store, generating fallback data`);
      demoOrderData = generateFallbackDemoOrder(orderNumber);
      console.log(`[${getTimestamp()}] 📄 Fallback demo order generated`);
    }
    
    console.log(`[${getTimestamp()}] 💾 Using demo order data for: ${orderNumber}`);
    console.log(`[${getTimestamp()}] ✅ Demo order data prepared`);
    console.log(`[${getTimestamp()}] ⚠️  WARNING: This is DEMO data - backend is unavailable`);
    console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
    return NextResponse.json({
      success: true,
      data: {
        order: demoOrderData
      },
      warning: {
        code: OrderErrorCode.BACKEND_UNAVAILABLE,
        message: 'Données de démonstration. Le backend est temporairement indisponible.'
      }
    });
  } catch (error) {
    const orderError = error instanceof Error
      ? mapJavaScriptError(error)
      : createError(OrderErrorCode.INTERNAL_ERROR);
    
    logError('GET /api/orders/[orderNumber] - Unexpected Error', orderError, {
      originalError: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : String(error)
    });
    
    console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
    return NextResponse.json(
      {
        success: false,
        error: orderError
      },
      { status: 500 }
    );
  }
}