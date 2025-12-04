import { NextRequest, NextResponse } from 'next/server';
import {
  OrderErrorCode,
  createError,
  mapBackendError,
  mapJavaScriptError,
  logError,
  validateOrderData,
} from '@/app/lib/orderErrors';
import { demoOrdersStore } from '@/app/lib/demoOrdersStore';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Helper function to get timestamp
const getTimestamp = () => new Date().toISOString();

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${getTimestamp()}] 📦 Frontend API POST /api/orders - START`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    const body = await request.json();
    
    console.log(`[${getTimestamp()}] 📝 Request body received:`);
    console.log(JSON.stringify({
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      deliveryZone: body.deliveryZone,
      itemCount: body.items?.length || 0,
      totalAmount: body.totalAmount
    }, null, 2));
    
    // Validate order data
    const validationError = validateOrderData(body);
    if (validationError) {
      logError('POST /api/orders - Validation', validationError, { body });
      console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      return NextResponse.json(
        {
          success: false,
          error: validationError
        },
        { status: 400 }
      );
    }
    
    console.log(`[${getTimestamp()}] ✅ Order data validation passed`);
    console.log(`[${getTimestamp()}] 🔌 Attempting to connect to backend: ${BACKEND_URL}`);
    
    try {
      const backendStartTime = Date.now();
      console.log(`[${getTimestamp()}] ⏱️  Backend request timeout: 10000ms`);
      
      const response = await fetch(`${BACKEND_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10000)
      });
      
      const backendDuration = Date.now() - backendStartTime;
      console.log(`[${getTimestamp()}] ⏱️  Backend response time: ${backendDuration}ms`);
      console.log(`[${getTimestamp()}] 📡 Backend response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log(`[${getTimestamp()}] 📥 Backend response data:`, JSON.stringify(data, null, 2));
      
      if (response.ok) {
        const orderNumber = data.data?.order?.orderNumber || data.data?.order?.order_number;
        console.log(`[${getTimestamp()}] ✅ Order created successfully via backend`);
        console.log(`[${getTimestamp()}] 🎫 Order number: ${orderNumber}`);
        console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        return NextResponse.json(data);
      }
      
      // Backend returned an error
      console.error(`[${getTimestamp()}] ❌ Backend returned error response`);
      console.error(`[${getTimestamp()}] 📄 Error details:`, JSON.stringify(data, null, 2));
      
      const backendError = mapBackendError(data);
      logError('POST /api/orders - Backend Error', backendError, {
        status: response.status,
        statusText: response.statusText,
        backendResponse: data
      });
      
      // If it's a validation or stock error, return it to the user
      if (
        backendError.code === OrderErrorCode.INSUFFICIENT_STOCK ||
        backendError.code === OrderErrorCode.PRODUCT_NOT_FOUND ||
        backendError.code === OrderErrorCode.VALIDATION_ERROR
      ) {
        console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
        console.log(`${'='.repeat(80)}\n`);
        
        return NextResponse.json(
          {
            success: false,
            error: backendError
          },
          { status: response.status }
        );
      }
      
      // For other backend errors, fall back to demo mode
      console.log(`[${getTimestamp()}] 🔄 Falling back to demo mode due to backend error`);
    } catch (backendError) {
      console.error(`[${getTimestamp()}] ❌ Backend connection failed`);
      
      const error = backendError instanceof Error 
        ? mapJavaScriptError(backendError)
        : createError(OrderErrorCode.BACKEND_UNAVAILABLE);
      
      logError('POST /api/orders - Backend Connection', error, {
        backendUrl: BACKEND_URL,
        originalError: backendError instanceof Error ? {
          name: backendError.name,
          message: backendError.message
        } : String(backendError)
      });
      
      console.log(`[${getTimestamp()}] 🔄 Activating demo mode`);
    }
    
    // Mode démo si backend indisponible
    console.log(`[${getTimestamp()}] 🎭 DEMO MODE ACTIVATED`);
    console.log(`[${getTimestamp()}] 📋 Generating realistic demo order data...`);
    
    // Generate realistic order number (GS + 6-8 digits)
    const orderNumber = `GS${Date.now().toString().slice(-6)}`;
    console.log(`[${getTimestamp()}] 🎫 Demo order number generated: ${orderNumber}`);
    
    // Generate unique ID for the order
    const orderId = `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Transform items to match backend response format with all required fields
    const transformedItems = body.items.map((item: any, index: number) => ({
      id: `demo-item-${Date.now()}-${index}`,
      orderId: orderId,
      productId: item.productId,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color || undefined,
      // Include product details in nested structure
      product: {
        id: item.productId,
        name: item.name || `Produit ${index + 1}`,
        images: item.images || []
      }
    }));
    
    // Create demo order with complete structure matching backend response
    const demoOrder = {
      id: orderId,
      orderNumber: orderNumber,
      order_number: orderNumber, // Include snake_case for compatibility
      
      // Customer information (flat structure)
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail || null,
      
      // Delivery information (flat structure)
      deliveryAddress: body.deliveryAddress,
      deliveryZone: body.deliveryZone,
      deliveryFee: parseFloat(body.deliveryFee) || 0,
      
      // Order details
      totalAmount: parseFloat(body.totalAmount),
      total: parseFloat(body.totalAmount), // Include both formats
      status: 'PENDING',
      
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Items with complete structure
      items: transformedItems
    };
    
    console.log(`[${getTimestamp()}] 💾 Demo order structure created:`);
    console.log(`[${getTimestamp()}]    - Order ID: ${demoOrder.id}`);
    console.log(`[${getTimestamp()}]    - Order Number: ${demoOrder.orderNumber}`);
    console.log(`[${getTimestamp()}]    - Customer: ${demoOrder.customerName}`);
    console.log(`[${getTimestamp()}]    - Phone: ${demoOrder.customerPhone}`);
    console.log(`[${getTimestamp()}]    - Email: ${demoOrder.customerEmail || 'Not provided'}`);
    console.log(`[${getTimestamp()}]    - Delivery Zone: ${demoOrder.deliveryZone}`);
    console.log(`[${getTimestamp()}]    - Delivery Address: ${demoOrder.deliveryAddress}`);
    console.log(`[${getTimestamp()}]    - Delivery Fee: ${demoOrder.deliveryFee}`);
    console.log(`[${getTimestamp()}]    - Total Amount: ${demoOrder.totalAmount}`);
    console.log(`[${getTimestamp()}]    - Items Count: ${demoOrder.items.length}`);
    console.log(`[${getTimestamp()}]    - Status: ${demoOrder.status}`);
    console.log(`[${getTimestamp()}] 📄 Full demo order data:`, JSON.stringify(demoOrder, null, 2));
    
    // Store demo order in memory for retrieval
    demoOrdersStore.set(orderNumber, demoOrder);
    console.log(`[${getTimestamp()}] 💾 Demo order stored in memory for retrieval`);
    console.log(`[${getTimestamp()}] 📍 Demo order will be available via GET /api/orders/${orderNumber}`);
    console.log(`[${getTimestamp()}] 📊 Demo orders store size: ${demoOrdersStore.size}`);
    
    console.log(`[${getTimestamp()}] ✅ Demo order created successfully`);
    console.log(`[${getTimestamp()}] ⚠️  WARNING: This is a DEMO order - backend is unavailable`);
    console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
    return NextResponse.json({
      success: true,
      data: {
        order: demoOrder
      },
      warning: {
        code: OrderErrorCode.BACKEND_UNAVAILABLE,
        message: 'Commande créée en mode démo. Le backend est temporairement indisponible.'
      }
    });
  } catch (error) {
    const orderError = error instanceof Error
      ? mapJavaScriptError(error)
      : createError(OrderErrorCode.INTERNAL_ERROR);
    
    logError('POST /api/orders - Unexpected Error', orderError, {
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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${getTimestamp()}] 📦 Frontend API GET /api/orders - START`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    console.log(`[${getTimestamp()}] 🔌 Connecting to backend: ${BACKEND_URL}/api/orders`);
    
    const backendStartTime = Date.now();
    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });
    
    const backendDuration = Date.now() - backendStartTime;
    console.log(`[${getTimestamp()}] ⏱️  Backend response time: ${backendDuration}ms`);
    console.log(`[${getTimestamp()}] 📡 Backend response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log(`[${getTimestamp()}] 📥 Backend response data: ${data.success ? 'Success' : 'Failed'}`);
    console.log(`[${getTimestamp()}] 📊 Orders count: ${data.orders?.length || 0}`);
    
    if (!response.ok) {
      console.error(`[${getTimestamp()}] ❌ Backend orders fetch failed`);
      
      const backendError = mapBackendError(data);
      logError('GET /api/orders - Backend Error', backendError, {
        status: response.status,
        statusText: response.statusText,
        backendResponse: data
      });
      
      console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
      console.log(`${'='.repeat(80)}\n`);
      
      return NextResponse.json(
        {
          success: false,
          error: backendError
        },
        { status: response.status }
      );
    }
    
    console.log(`[${getTimestamp()}] ✅ Orders fetched successfully from backend`);
    console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
    return NextResponse.json(data);
  } catch (error) {
    const orderError = error instanceof Error
      ? mapJavaScriptError(error)
      : createError(OrderErrorCode.BACKEND_UNAVAILABLE);
    
    logError('GET /api/orders - Connection Error', orderError, {
      backendUrl: BACKEND_URL,
      originalError: error instanceof Error ? {
        name: error.name,
        message: error.message
      } : String(error)
    });
    
    console.log(`[${getTimestamp()}] ⏱️  Total request duration: ${Date.now() - startTime}ms`);
    console.log(`${'='.repeat(80)}\n`);
    
    return NextResponse.json(
      {
        success: false,
        error: orderError
      },
      { status: 503 }
    );
  }
}