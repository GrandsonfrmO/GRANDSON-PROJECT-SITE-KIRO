/**
 * Validation utilities for file uploads and product data
 */

// File validation constants
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILE_SIZE_MB = 5;

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file format and size
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file provided'
    };
  }

  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    };
  }

  return { valid: true };
}

/**
 * Validate multiple image files
 * @param files - Files to validate
 * @returns Validation result with details for each file
 */
export function validateImageFiles(files: File[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!files || files.length === 0) {
    return {
      valid: false,
      errors: ['No files provided']
    };
  }

  files.forEach((file, index) => {
    const result = validateImageFile(file);
    if (!result.valid) {
      errors.push(`File ${index + 1}: ${result.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export interface ProductValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate product data
 * @param product - Product data to validate
 * @returns Validation result with field-specific errors
 */
export function validateProduct(product: any): ProductValidationResult {
  const errors: Record<string, string> = {};

  // Required fields
  if (!product.name || product.name.trim() === '') {
    errors.name = 'Product name is required';
  }

  if (product.price === undefined || product.price === null) {
    errors.price = 'Product price is required';
  } else if (typeof product.price !== 'number' || product.price <= 0) {
    errors.price = 'Product price must be a positive number';
  }

  if (!product.category || product.category.trim() === '') {
    errors.category = 'Product category is required';
  }

  if (product.stock === undefined || product.stock === null) {
    errors.stock = 'Product stock is required';
  } else if (typeof product.stock !== 'number' || product.stock < 0) {
    errors.stock = 'Product stock must be a non-negative number';
  }

  // Optional but validated if present
  if (product.description && typeof product.description !== 'string') {
    errors.description = 'Product description must be a string';
  }

  if (product.sizes) {
    if (!Array.isArray(product.sizes)) {
      errors.sizes = 'Product sizes must be an array';
    } else if (product.sizes.length === 0) {
      errors.sizes = 'At least one size is required';
    }
  }

  if (product.colors && !Array.isArray(product.colors)) {
    errors.colors = 'Product colors must be an array';
  }

  if (product.images && !Array.isArray(product.images)) {
    errors.images = 'Product images must be an array';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize product data for database insertion
 * @param product - Raw product data
 * @returns Sanitized product data
 */
export function sanitizeProductData(product: any) {
  return {
    name: product.name?.trim() || '',
    description: product.description?.trim() || '',
    price: parseFloat(product.price) || 0,
    base_price: parseFloat(product.base_price || product.price) || 0,
    category: product.category?.trim() || '',
    stock: parseInt(product.stock) || 0,
    total_stock: parseInt(product.total_stock || product.stock) || 0,
    sizes: Array.isArray(product.sizes) ? product.sizes : ['Unique'],
    colors: Array.isArray(product.colors) ? product.colors : null,
    images: Array.isArray(product.images) ? product.images : [],
    attributes: product.attributes || {},
    is_active: product.is_active !== undefined ? Boolean(product.is_active) : true,
    seller_id: product.seller_id || null
  };
}
