// Product validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ProductData {
  name?: string;
  price?: number | string;
  category?: string;
  stock?: number | string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  images?: string[];
  is_active?: boolean;
}

/**
 * Validates product data for creation or update
 * @param data Product data to validate
 * @param isUpdate Whether this is an update operation (makes all fields optional)
 * @returns ValidationResult with isValid flag and errors object
 */
export function validateProduct(data: ProductData, isUpdate: boolean = false): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
      errors.name = 'Product name is required and must be a non-empty string';
    } else if (data.name.trim().length < 2) {
      errors.name = 'Product name must be at least 2 characters long';
    } else if (data.name.trim().length > 200) {
      errors.name = 'Product name must not exceed 200 characters';
    }
  }

  // Price validation
  if (!isUpdate || data.price !== undefined) {
    const priceValue = typeof data.price === 'string' ? parseFloat(data.price) : data.price;
    
    if (priceValue === undefined || priceValue === null) {
      errors.price = 'Product price is required';
    } else if (isNaN(priceValue)) {
      errors.price = 'Product price must be a valid number';
    } else if (priceValue <= 0) {
      errors.price = 'Product price must be greater than 0';
    } else if (priceValue > 1000000) {
      errors.price = 'Product price must not exceed 1,000,000';
    }
  }

  // Category validation
  if (!isUpdate || data.category !== undefined) {
    if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
      errors.category = 'Product category is required and must be a non-empty string';
    } else if (data.category.trim().length < 2) {
      errors.category = 'Product category must be at least 2 characters long';
    } else if (data.category.trim().length > 100) {
      errors.category = 'Product category must not exceed 100 characters';
    }
  }

  // Stock validation
  if (!isUpdate || data.stock !== undefined) {
    const stockValue = typeof data.stock === 'string' ? parseInt(data.stock) : data.stock;
    
    if (stockValue === undefined || stockValue === null) {
      errors.stock = 'Product stock is required';
    } else if (isNaN(stockValue)) {
      errors.stock = 'Product stock must be a valid integer';
    } else if (stockValue < 0) {
      errors.stock = 'Product stock must be a non-negative number (0 or greater)';
    } else if (stockValue > 1000000) {
      errors.stock = 'Product stock must not exceed 1,000,000';
    } else if (!Number.isInteger(stockValue)) {
      errors.stock = 'Product stock must be a whole number';
    }
  }

  // Description validation (optional field)
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.description = 'Product description must be a string';
    } else if (data.description.length > 5000) {
      errors.description = 'Product description must not exceed 5000 characters';
    }
  }

  // Sizes validation (optional field)
  if (data.sizes !== undefined && data.sizes !== null) {
    if (!Array.isArray(data.sizes)) {
      errors.sizes = 'Product sizes must be an array';
    } else if (data.sizes.length === 0) {
      errors.sizes = 'Product sizes array must not be empty';
    } else if (!data.sizes.every(size => typeof size === 'string')) {
      errors.sizes = 'All product sizes must be strings';
    }
  }

  // Colors validation (optional field)
  if (data.colors !== undefined && data.colors !== null) {
    if (!Array.isArray(data.colors)) {
      errors.colors = 'Product colors must be an array';
    } else if (!data.colors.every(color => typeof color === 'string')) {
      errors.colors = 'All product colors must be strings';
    }
  }

  // Images validation (optional field)
  if (data.images !== undefined && data.images !== null) {
    if (!Array.isArray(data.images)) {
      errors.images = 'Product images must be an array';
    } else if (!data.images.every(image => typeof image === 'string')) {
      errors.images = 'All product images must be strings (URLs)';
    } else {
      // Validate URL format for each image
      const urlPattern = /^https?:\/\/.+/;
      const invalidImages = data.images.filter(img => !urlPattern.test(img));
      if (invalidImages.length > 0) {
        errors.images = 'All product images must be valid URLs starting with http:// or https://';
      }
    }
  }

  // is_active validation (optional field)
  if (data.is_active !== undefined && data.is_active !== null) {
    if (typeof data.is_active !== 'boolean') {
      errors.is_active = 'Product is_active must be a boolean value';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validates file upload for product images
 * @param file File to validate
 * @returns ValidationResult with isValid flag and errors object
 */
export function validateImageFile(file: File): ValidationResult {
  const errors: Record<string, string> = {};

  // Check file exists
  if (!file) {
    errors.file = 'No file provided';
    return { isValid: false, errors };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.type = `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    errors.size = `File size exceeds maximum allowed size of 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }

  // Check file name
  if (file.name.length > 255) {
    errors.name = 'File name is too long (max 255 characters)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
