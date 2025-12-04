import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAdminRequest, logAuthAttempt, getValidatedUser } from '@/app/lib/jwtValidation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt('GET /api/admin/orders', false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt('GET /api/admin/orders', true, undefined, user?.id);

    console.log('🛒 Frontend API: Fetching admin orders directly from Supabase...');
    
    // Fetch orders directly from Supabase with order items
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          size,
          quantity,
          price,
          color,
          products (
            id,
            name,
            images
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('❌ Error fetching admin orders:', ordersError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: ordersError.message
          }
        },
        { status: 500 }
      );
    }

    // Transform orders to match expected format with images
    const transformedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      deliveryAddress: order.delivery_address,
      deliveryZone: order.delivery_zone,
      deliveryFee: order.delivery_fee,
      total: order.total_amount,
      totalAmount: order.total_amount,
      status: order.status.toLowerCase(),
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: (order.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
        color: item.color,
        product: {
          id: item.products?.id,
          name: item.products?.name,
          images: item.products?.images || []
        }
      }))
    }));
    
    console.log(`✅ Found ${transformedOrders.length} orders for admin`);
    
    return NextResponse.json({
      success: true,
      data: {
        orders: transformedOrders
      }
    });
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

export async function POST(request: NextRequest) {
  try {
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt('POST /api/admin/orders', false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt('POST /api/admin/orders', true, undefined, user?.id);

    const body = await request.json();
    const { customerName, customerEmail, customerPhone, deliveryAddress, deliveryZone, deliveryFee, items, totalAmount } = body;

    if (!customerName || !customerPhone || !deliveryAddress || !items || !totalAmount) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Champs requis manquants'
          }
        },
        { status: 400 }
      );
    }

    console.log(`📝 Admin creating order for ${customerName}`);

    // Generate order number
    const orderNumber = `GS${Date.now().toString().slice(-6)}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_zone: deliveryZone || null,
        delivery_fee: deliveryFee || 0,
        total_amount: totalAmount,
        status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creating order:', orderError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: orderError.message
          }
        },
        { status: 500 }
      );
    }

    // Create order items
    const orderItemsData = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
      color: item.color || null
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: itemsError.message
          }
        },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${orderNumber} created by admin`);

    // Send notifications and emails
    try {
      // Send push notification
      await fetch(`http://localhost:3000/api/push/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '📝 Commande créée par admin',
          body: `Commande #${orderNumber} - ${totalAmount}€`,
          icon: '/icon-192x192.png',
          url: '/admin/orders',
          type: 'order',
          audience: 'admin'
        })
      }).catch(err => console.warn('⚠️ Push notification failed:', err));

      // Send customer confirmation email
      if (customerEmail) {
        await fetch(`http://localhost:3000/api/email/send-customer-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderDetails: {
              orderNumber: orderNumber,
              customerName: customerName,
              customerEmail: customerEmail,
              customerPhone: customerPhone,
              deliveryAddress: deliveryAddress,
              deliveryZone: deliveryZone,
              deliveryFee: deliveryFee || 0,
              total: totalAmount,
              items: items.map((item: any) => ({
                name: item.name || 'Produit',
                image: item.image,
                size: item.size,
                quantity: item.quantity,
                price: item.price
              }))
            }
          })
        }).catch(err => console.warn('⚠️ Customer email failed:', err));
      }

      // Send admin notification email
      await fetch(`http://localhost:3000/api/email/send-admin-notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderDetails: {
            orderNumber: orderNumber,
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            deliveryAddress: deliveryAddress,
            deliveryZone: deliveryZone,
            deliveryFee: deliveryFee || 0,
            total: totalAmount,
            items: items.map((item: any) => ({
              name: item.name || 'Produit',
              image: item.image,
              size: item.size,
              quantity: item.quantity,
              price: item.price
            }))
          }
        })
      }).catch(err => console.warn('⚠️ Admin email failed:', err));

      console.log(`✅ Notifications and emails sent`);
    } catch (notifError) {
      console.warn('⚠️ Failed to send notifications:', notifError);
    }

    return NextResponse.json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name,
          customerEmail: order.customer_email,
          customerPhone: order.customer_phone,
          deliveryAddress: order.delivery_address,
          deliveryZone: order.delivery_zone,
          deliveryFee: order.delivery_fee,
          total: order.total_amount,
          totalAmount: order.total_amount,
          status: order.status.toLowerCase(),
          createdAt: order.created_at,
          updatedAt: order.updated_at,
          items: orderItemsData
        }
      }
    });
  } catch (error) {
    console.error('❌ Create order error:', error);
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

export async function PUT(request: NextRequest) {
  try {
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt('PUT /api/admin/orders', false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt('PUT /api/admin/orders', true, undefined, user?.id);

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'ID de commande et statut requis'
          }
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Frontend API: Updating order ${orderId} status to: ${status}`);

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Statut invalide'
          }
        },
        { status: 400 }
      );
    }

    // Map status for database (temporary mapping for enum compatibility)
    let dbStatus = status.toUpperCase();
    if (status.toLowerCase() === 'processing') {
      dbStatus = 'CONFIRMED'; // Temporary mapping
      console.log('⚠️ Mapping PROCESSING to CONFIRMED (temporary)');
    }
    if (status.toLowerCase() === 'shipped') {
      dbStatus = 'CONFIRMED'; // Temporary mapping
      console.log('⚠️ Mapping SHIPPED to CONFIRMED (temporary)');
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order status:', error);
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

    console.log(`✅ Order ${orderId} status updated to ${dbStatus}`);

    // Return the requested status (not the mapped one)
    return NextResponse.json({
      success: true,
      data: {
        order: {
          ...data,
          status: status.toLowerCase() // Return the requested status
        }
      }
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la mise à jour du statut'
        }
      },
      { status: 500 }
    );
  }
}