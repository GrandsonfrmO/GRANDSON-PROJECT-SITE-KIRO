// Utility functions to transform Supabase data to frontend format

// Helper to parse JSON strings or return array as-is
function parseJsonArray(value: any, defaultValue: any[] = []): any[] {
  // Already an array - return as-is
  if (Array.isArray(value)) return value;
  
  // Null or undefined - return default
  if (value === null || value === undefined) return defaultValue;
  
  // String - try to parse as JSON
  if (typeof value === 'string') {
    // Empty string
    if (!value.trim()) return defaultValue;
    
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
      // If parsed is a non-null value, wrap in array
      return parsed ? [parsed] : defaultValue;
    } catch {
      // Not valid JSON, treat as single value
      return [value];
    }
  }
  
  // Object or other type - wrap in array if truthy
  return value ? [value] : defaultValue;
}

export function transformProduct(supabaseProduct: any) {
  if (!supabaseProduct) return null;
  
  // Ensure images is always an array
  let images = parseJsonArray(supabaseProduct.images, []);
  // Final safety check
  if (!Array.isArray(images)) images = [];
  
  // Ensure sizes is always an array
  let sizes = parseJsonArray(supabaseProduct.sizes, ['Unique']);
  // Final safety check
  if (!Array.isArray(sizes) || sizes.length === 0) sizes = ['Unique'];
  
  // Ensure colors is an array or undefined
  let colors = supabaseProduct.colors ? parseJsonArray(supabaseProduct.colors, []) : undefined;
  // Final safety check
  if (colors && !Array.isArray(colors)) colors = undefined;
  if (colors && colors.length === 0) colors = undefined;
  
  return {
    ...supabaseProduct,
    isActive: supabaseProduct.is_active !== undefined ? supabaseProduct.is_active : (supabaseProduct.isActive !== undefined ? supabaseProduct.isActive : true),
    createdAt: supabaseProduct.created_at || supabaseProduct.createdAt,
    updatedAt: supabaseProduct.updated_at || supabaseProduct.updatedAt,
    stock: supabaseProduct.stock !== undefined ? supabaseProduct.stock : 0,
    images,
    sizes,
    colors,
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