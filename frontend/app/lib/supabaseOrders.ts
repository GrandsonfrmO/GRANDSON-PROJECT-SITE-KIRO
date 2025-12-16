/**
 * Direct Supabase Orders Management
 * Bypasses the backend and saves orders directly to Supabase
 * This ensures orders are persisted even if the backend is unavailable
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration');
}

const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export interface OrderItem {
  productId: string;
  size: string;
  quantity: number;
  price: number;
  color?: string;
  name?: string;
  images?: string[];
}

export interface OrderData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  deliveryZone: string;
  deliveryFee: number;
  totalAmount: number;
  items: OrderItem[];
}

/**
 * Generate a realistic order number (GS + 6-8 digits)
 */
export function generateOrderNumber(): string {
  return `GS${Date.now().toString().slice(-6)}`;
}

/**
 * Save order directly to Supabase
 */
export async function saveOrderToSupabase(orderData: OrderData) {
  try {
    const orderNumber = generateOrderNumber();
    
    console.log(`[Supabase] 💾 Saving order ${orderNumber} to Supabase...`);
    
    // Prepare order data
    const order = {
      order_number: orderNumber,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail,
      delivery_address: orderData.deliveryAddress,
      delivery_zone: orderData.deliveryZone,
      delivery_fee: orderData.deliveryFee,
      total_amount: orderData.totalAmount,
      status: 'PENDING',
      items: orderData.items,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert order into Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.error(`[Supabase] ❌ Error saving order:`, error);
      throw error;
    }

    console.log(`[Supabase] ✅ Order saved successfully: ${orderNumber}`);
    
    return {
      success: true,
      data: {
        order: {
          id: data.id,
          orderNumber: data.order_number,
          order_number: data.order_number,
          customerName: data.customer_name,
          customerPhone: data.customer_phone,
          customerEmail: data.customer_email,
          deliveryAddress: data.delivery_address,
          deliveryZone: data.delivery_zone,
          deliveryFee: data.delivery_fee,
          totalAmount: data.total_amount,
          total: data.total_amount,
          status: data.status,
          items: data.items || [],
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      }
    };
  } catch (error) {
    console.error(`[Supabase] ❌ Failed to save order:`, error);
    throw error;
  }
}

/**
 * Fetch order from Supabase
 */
export async function fetchOrderFromSupabase(orderNumber: string) {
  try {
    console.log(`[Supabase] 🔍 Fetching order ${orderNumber} from Supabase...`);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        console.log(`[Supabase] ⚠️  Order not found: ${orderNumber}`);
        return null;
      }
      console.error(`[Supabase] ❌ Error fetching order:`, error);
      throw error;
    }

    console.log(`[Supabase] ✅ Order fetched successfully: ${orderNumber}`);
    
    return {
      id: data.id,
      orderNumber: data.order_number,
      order_number: data.order_number,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      customerEmail: data.customer_email,
      deliveryAddress: data.delivery_address,
      deliveryZone: data.delivery_zone,
      deliveryFee: data.delivery_fee,
      totalAmount: data.total_amount,
      total: data.total_amount,
      status: data.status,
      items: data.items || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error(`[Supabase] ❌ Failed to fetch order:`, error);
    throw error;
  }
}

/**
 * Fetch all orders for a customer
 */
export async function fetchCustomerOrders(customerEmail: string) {
  try {
    console.log(`[Supabase] 🔍 Fetching orders for ${customerEmail}...`);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[Supabase] ❌ Error fetching customer orders:`, error);
      throw error;
    }

    console.log(`[Supabase] ✅ Found ${data?.length || 0} orders for ${customerEmail}`);
    
    return data?.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      order_number: order.order_number,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerEmail: order.customer_email,
      deliveryAddress: order.delivery_address,
      deliveryZone: order.delivery_zone,
      deliveryFee: order.delivery_fee,
      totalAmount: order.total_amount,
      total: order.total_amount,
      status: order.status,
      items: order.items || [],
      createdAt: order.created_at,
      updatedAt: order.updated_at
    })) || [];
  } catch (error) {
    console.error(`[Supabase] ❌ Failed to fetch customer orders:`, error);
    throw error;
  }
}
