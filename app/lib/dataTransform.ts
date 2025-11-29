// Utility functions to transform Supabase data to frontend format

export function transformProduct(supabaseProduct: any) {
  return {
    ...supabaseProduct,
    isActive: supabaseProduct.is_active !== undefined ? supabaseProduct.is_active : true,
    createdAt: supabaseProduct.created_at || supabaseProduct.createdAt,
    updatedAt: supabaseProduct.updated_at || supabaseProduct.updatedAt,
    stock: supabaseProduct.stock !== undefined ? supabaseProduct.stock : 0,
    images: Array.isArray(supabaseProduct.images) ? supabaseProduct.images : [],
    sizes: Array.isArray(supabaseProduct.sizes) ? supabaseProduct.sizes : [],
    colors: Array.isArray(supabaseProduct.colors) ? supabaseProduct.colors : null,
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