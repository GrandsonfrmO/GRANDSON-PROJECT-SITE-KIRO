// Utility functions to transform Supabase data to frontend format

/**
 * Helper to safely parse JSON strings or return array as-is
 * Handles cases where data is already an array, a JSON string, null, or undefined
 * @param value The value to parse
 * @param defaultValue Default value to return if parsing fails or value is null/undefined
 * @returns Parsed array or default value
 */
function parseJsonArray(value: any, defaultValue: any[] = []): any[] {
  // Already an array - return as-is
  if (Array.isArray(value)) {
    return value;
  }
  
  // Null or undefined - return default
  if (value === null || value === undefined) {
    return defaultValue;
  }
  
  // String - try to parse as JSON
  if (typeof value === 'string') {
    // Empty string - return default
    if (!value.trim()) {
      return defaultValue;
    }
    
    try {
      const parsed = JSON.parse(value);
      
      // Successfully parsed as array
      if (Array.isArray(parsed)) {
        return parsed;
      }
      
      // Parsed as non-array value - wrap in array if truthy
      return parsed ? [parsed] : defaultValue;
    } catch (error) {
      // Not valid JSON - treat as single value
      console.warn('Failed to parse JSON array, treating as single value:', value);
      return [value];
    }
  }
  
  // Object or other type - wrap in array if truthy, otherwise return default
  return value ? [value] : defaultValue;
}

/**
 * Transforms a product from Supabase format to frontend format
 * Handles JSON parsing for sizes, colors, and images fields
 * Provides appropriate defaults for null/undefined values
 * @param supabaseProduct Product data from Supabase
 * @returns Transformed product with camelCase fields and parsed arrays
 */
export function transformProduct(supabaseProduct: any) {
  if (!supabaseProduct) {
    return null;
  }
  
  // Parse and ensure images is always an array
  let images = parseJsonArray(supabaseProduct.images, []);
  
  // Final safety check - ensure it's an array
  if (!Array.isArray(images)) {
    console.warn('Images is not an array after parsing, resetting to empty array');
    images = [];
  }
  
  // Filter out any invalid image URLs (null, undefined, empty strings)
  images = images.filter(img => img && typeof img === 'string' && img.trim() !== '');
  
  // Parse and ensure sizes is always an array with at least one value
  let sizes = parseJsonArray(supabaseProduct.sizes, ['Unique']);
  
  // Final safety check - ensure it's an array with at least one value
  if (!Array.isArray(sizes) || sizes.length === 0) {
    console.warn('Sizes is not a valid array, resetting to default ["Unique"]');
    sizes = ['Unique'];
  }
  
  // Filter out any invalid sizes (null, undefined, empty strings)
  sizes = sizes.filter(size => size && typeof size === 'string' && size.trim() !== '');
  
  // If all sizes were filtered out, use default
  if (sizes.length === 0) {
    sizes = ['Unique'];
  }
  
  // Parse colors - can be null/undefined or an array
  let colors: string[] | undefined = undefined;
  
  if (supabaseProduct.colors !== null && supabaseProduct.colors !== undefined) {
    colors = parseJsonArray(supabaseProduct.colors, []);
    
    // Final safety check - ensure it's an array
    if (!Array.isArray(colors)) {
      console.warn('Colors is not an array after parsing, resetting to undefined');
      colors = undefined;
    } else {
      // Filter out any invalid colors (null, undefined, empty strings)
      colors = colors.filter(color => color && typeof color === 'string' && color.trim() !== '');
      
      // If all colors were filtered out or array is empty, set to undefined
      if (colors.length === 0) {
        colors = undefined;
      }
    }
  }
  
  return {
    ...supabaseProduct,
    isActive: supabaseProduct.is_active !== undefined 
      ? supabaseProduct.is_active 
      : (supabaseProduct.isActive !== undefined ? supabaseProduct.isActive : true),
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