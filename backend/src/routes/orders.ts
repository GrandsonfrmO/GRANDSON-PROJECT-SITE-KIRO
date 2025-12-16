import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
import { Order, ApiResponse } from '../types';

const router = Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Create order
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    customer_name,
    customer_phone,
    customer_email,
    delivery_address,
    delivery_zone,
    delivery_fee,
    total_amount,
    items
  } = req.body;

  // Validation
  if (!customer_name || !customer_phone || !customer_email || !delivery_address) {
    throw new AppError(400, 'Missing required fields', 'VALIDATION_ERROR');
  }

  console.log('📝 Creating order...');

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      delivery_zone,
      delivery_fee: delivery_fee || 0,
      total_amount,
      status: 'PENDING'
    })
    .select()
    .single();

  if (orderError) {
    console.error('❌ Error creating order:', orderError);
    throw new AppError(500, 'Failed to create order', 'DB_ERROR');
  }

  // Create order items
  if (items && items.length > 0) {
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      size: item.size,
      quantity: item.quantity,
      price: item.price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('❌ Error creating order items:', itemsError);
      // Delete order if items creation failed
      await supabase.from('orders').delete().eq('id', order.id);
      throw new AppError(500, 'Failed to create order items', 'DB_ERROR');
    }
  }

  // Auto-subscribe to newsletter
  if (customer_email) {
    try {
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('id, is_active')
        .eq('email', customer_email)
        .single();

      if (existingSubscriber) {
        if (!existingSubscriber.is_active) {
          await supabase
            .from('newsletter_subscribers')
            .update({
              is_active: true,
              name: customer_name,
              phone: customer_phone,
              unsubscribed_at: null
            })
            .eq('id', existingSubscriber.id);
        }
      } else {
        await supabase
          .from('newsletter_subscribers')
          .insert({
            email: customer_email,
            name: customer_name,
            phone: customer_phone,
            is_active: true
          });
      }
    } catch (error) {
      console.warn('⚠️ Failed to auto-subscribe to newsletter');
    }
  }

  console.log('✅ Order created:', orderNumber);

  const response: ApiResponse<any> = {
    success: true,
    data: { order }
  };

  res.json(response);
}));

// Get order by number
router.get('/:orderNumber', asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  console.log(`📋 Fetching order ${orderNumber}...`);

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        products (name, price, images)
      )
    `)
    .eq('order_number', orderNumber)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Order not found', 'NOT_FOUND');
  }

  const response: ApiResponse<Order> = {
    success: true,
    data
  };

  res.json(response);
}));

export default router;
