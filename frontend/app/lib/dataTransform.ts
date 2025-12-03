// Utility functions to transform Supabase data to frontend format

// Helper to parse JSON strings or return array as-is
function parseJsonArray(value: any, defaultValue: any[] = []): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value ? [value] : defaultValue;
    }
  }
  return defaultValue;
}

export function transformProduct(supabaseProduct: any) {
  if (!supabaseProduct) return null;
  
  return {
    ...supabaseProduct,
    isActive: supabaseProduct.is_active !== undefined ? supabaseProduct.is_active : (supabaseProduct.isActive !== undefined ? supabaseProduct.isActive : true),
    createdAt: supabaseProduct.created_at || supabaseProduct.createdAt,
    updatedAt: supabaseProduct.updated_at || supabaseProduct.updatedAt,
    stock: supabaseProduct.stock !== undefined ? supabaseProduct.stock : 0,
    images: parseJsonArray(supabaseProduct.images, []),
    sizes: parseJsonArray(supabaseProduct.sizes, ['Unique']),
    colors: supabaseProduct.colors ? parseJsonArray(supabaseProduct.colors) : null,
  };
}

export function transformProducts(supabaseProducts: any[]) {
  return supabaseProducts.map(transformProduct);
}

export function transformOrder(supabaseOrder: any) {
  return {
    ...supabaseOrder,
    orderNumber: supabaseOrder.order_number,
    customerName: supabaseOrder.customer_name,
    customerPhone: supabaseOrder.customer_phone,
    customerEmail: supabaseOrder.customer_email,
    deliveryAddress: supabaseOrder.delivery_address,
    deliveryZone: supabaseOrder.delivery_zone,
    deliveryFee: supabaseOrder.delivery_fee,
    totalAmount: supabaseOrder.total_amount,
    createdAt: supabaseOrder.created_at,
    updatedAt: supabaseOrder.updated_at,
  };
}

export function transformOrders(supabaseOrders: any[]) {
  return supabaseOrders.map(transformOrder);
}

export function transformDeliveryZone(supabaseZone: any) {
  return {
    ...supabaseZone,
    isActive: supabaseZone.is_active,
    createdAt: supabaseZone.created_at,
    updatedAt: supabaseZone.updated_at,
  };
}

export function transformDeliveryZones(supabaseZones: any[]) {
  return supabaseZones.map(transformDeliveryZone);
}

export function transformPageContent(supabasePage: any) {
  return {
    ...supabasePage,
    pageKey: supabasePage.page_key,
    isActive: supabasePage.is_active,
    createdAt: supabasePage.created_at,
    updatedAt: supabasePage.updated_at,
  };
}

export function transformPageContents(supabasePages: any[]) {
  return supabasePages.map(transformPageContent);
}