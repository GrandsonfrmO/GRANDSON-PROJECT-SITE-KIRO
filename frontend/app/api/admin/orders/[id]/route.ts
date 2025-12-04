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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt(`GET /api/admin/orders/${id}`, false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt(`GET /api/admin/orders/${id}`, true, undefined, user?.id);

    console.log(`📖 Frontend API: Fetching order ${id}...`);

    // Fetch order with items and product details
    const { data: order, error } = await supabase
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
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching order:', error);
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

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Commande non trouvée'
          }
        },
        { status: 404 }
      );
    }

    console.log(`✅ Order ${id} fetched successfully`);

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
        }
      }
    });
  } catch (error) {
    console.error('❌ Fetch order error:', error);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt(`PUT /api/admin/orders/${id}`, false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt(`PUT /api/admin/orders/${id}`, true, undefined, user?.id);
    
    const body = await request.json();
    const { status, customerName, customerEmail, customerPhone, deliveryAddress, deliveryZone, deliveryFee, items } = body;

    console.log(`🔄 Frontend API: Updating order ${id}...`);

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
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

      // Map status for database
      let dbStatus = status.toUpperCase();
      if (status.toLowerCase() === 'processing') {
        dbStatus = 'CONFIRMED';
      }
      if (status.toLowerCase() === 'shipped') {
        dbStatus = 'CONFIRMED';
      }
      updateData.status = dbStatus;
    }

    if (customerName) updateData.customer_name = customerName;
    if (customerEmail) updateData.customer_email = customerEmail;
    if (customerPhone) updateData.customer_phone = customerPhone;
    if (deliveryAddress) updateData.delivery_address = deliveryAddress;
    if (deliveryZone) updateData.delivery_zone = deliveryZone;
    if (deliveryFee !== undefined) updateData.delivery_fee = deliveryFee;

    // Update order
    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order:', error);
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

    // Update items if provided
    if (items && Array.isArray(items)) {
      // Delete existing items
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      // Insert new items
      const orderItemsData = items.map((item: any) => ({
        order_id: id,
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
        console.error('❌ Error updating order items:', itemsError);
      }
    }

    console.log(`✅ Order ${id} updated successfully`);

    // If status changed to confirmed, send validation email to customer
    if (status && status.toLowerCase() === 'confirmed' && order.customer_email) {
      try {
        // Fetch full order details with items
        const { data: fullOrder } = await supabase
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
          .eq('id', id)
          .single();

        if (fullOrder) {
          await fetch(`http://localhost:3000/api/email/send-validation-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderDetails: {
                orderNumber: fullOrder.order_number,
                customerName: fullOrder.customer_name,
                customerEmail: fullOrder.customer_email,
                customerPhone: fullOrder.customer_phone,
                deliveryAddress: fullOrder.delivery_address,
                deliveryZone: fullOrder.delivery_zone,
                deliveryFee: fullOrder.delivery_fee || 0,
                total: fullOrder.total_amount,
                items: (fullOrder.order_items || []).map((item: any) => ({
                  name: item.products?.name || 'Produit',
                  image: item.products?.images?.[0],
                  size: item.size,
                  quantity: item.quantity,
                  price: item.price
                }))
              }
            })
          }).catch(err => console.warn('⚠️ Validation email failed:', err));
        }
      } catch (emailError) {
        console.warn('⚠️ Failed to send validation email:', emailError);
      }
    }

    // Return the requested status (not the mapped one)
    return NextResponse.json({
      success: true,
      data: {
        order: {
          ...order,
          status: status ? status.toLowerCase() : order.status.toLowerCase()
        }
      }
    });
  } catch (error) {
    console.error('❌ Update order error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la mise à jour de la commande'
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt(`DELETE /api/admin/orders/${id}`, false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt(`DELETE /api/admin/orders/${id}`, true, undefined, user?.id);

    console.log(`🗑️ Frontend API: Deleting order ${id} from Supabase...`, {
      userId: user?.id
    });
    
    // First delete order items
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      console.error('❌ Error deleting order items:', itemsError);
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

    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting order:', error);
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

    console.log(`✅ Order ${id} deleted successfully`);
    
    return NextResponse.json({
      success: true,
      data: { message: 'Commande supprimée avec succès' }
    });
  } catch (error) {
    console.error('❌ Delete order error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la suppression de la commande'
        }
      },
      { status: 500 }
    );
  }
}