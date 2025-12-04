/**
 * Tests for Order Error Handling Utilities
 */

import {
  OrderErrorCode,
  createError,
  mapBackendError,
  mapJavaScriptError,
  validateOrderData,
  ERROR_MESSAGES,
} from '../orderErrors';

describe('Order Error Handling', () => {
  describe('createError', () => {
    it('should create error with default message', () => {
      const error = createError(OrderErrorCode.VALIDATION_ERROR);
      
      expect(error.code).toBe(OrderErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe(ERROR_MESSAGES[OrderErrorCode.VALIDATION_ERROR]);
      expect(error.details).toBeUndefined();
      expect(error.field).toBeUndefined();
    });

    it('should create error with custom message', () => {
      const customMessage = 'Custom error message';
      const error = createError(OrderErrorCode.VALIDATION_ERROR, customMessage);
      
      expect(error.code).toBe(OrderErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe(customMessage);
    });

    it('should create error with details and field', () => {
      const error = createError(
        OrderErrorCode.INVALID_PHONE_FORMAT,
        undefined,
        'Phone must start with +224',
        'customerPhone'
      );
      
      expect(error.code).toBe(OrderErrorCode.INVALID_PHONE_FORMAT);
      expect(error.details).toBe('Phone must start with +224');
      expect(error.field).toBe('customerPhone');
    });
  });

  describe('mapBackendError', () => {
    it('should map structured backend error', () => {
      const backendError = {
        error: {
          code: OrderErrorCode.INSUFFICIENT_STOCK,
          message: 'Stock insuffisant',
          details: 'Product XYZ has only 2 items left'
        }
      };
      
      const error = mapBackendError(backendError);
      
      expect(error.code).toBe(OrderErrorCode.INSUFFICIENT_STOCK);
      expect(error.message).toBe('Stock insuffisant');
      expect(error.details).toBe('Product XYZ has only 2 items left');
    });

    it('should map stock error from message', () => {
      const backendError = {
        message: 'Insufficient stock for product'
      };
      
      const error = mapBackendError(backendError);
      
      expect(error.code).toBe(OrderErrorCode.INSUFFICIENT_STOCK);
    });

    it('should map product not found error', () => {
      const backendError = {
        error: 'Product not found'
      };
      
      const error = mapBackendError(backendError);
      
      expect(error.code).toBe(OrderErrorCode.PRODUCT_NOT_FOUND);
    });

    it('should map validation error', () => {
      const backendError = {
        message: 'Validation failed: invalid email'
      };
      
      const error = mapBackendError(backendError);
      
      expect(error.code).toBe(OrderErrorCode.VALIDATION_ERROR);
    });

    it('should default to internal error for unknown errors', () => {
      const backendError = {
        message: 'Something went wrong'
      };
      
      const error = mapBackendError(backendError);
      
      expect(error.code).toBe(OrderErrorCode.INTERNAL_ERROR);
    });
  });

  describe('mapJavaScriptError', () => {
    it('should map network error', () => {
      const jsError = new TypeError('Failed to fetch');
      
      const error = mapJavaScriptError(jsError);
      
      expect(error.code).toBe(OrderErrorCode.NETWORK_ERROR);
    });

    it('should map timeout error', () => {
      const jsError = new Error('Request timeout');
      jsError.name = 'AbortError';
      
      const error = mapJavaScriptError(jsError);
      
      expect(error.code).toBe(OrderErrorCode.BACKEND_TIMEOUT);
    });

    it('should map JSON parsing error', () => {
      const jsError = new SyntaxError('Unexpected token in JSON');
      
      const error = mapJavaScriptError(jsError);
      
      expect(error.code).toBe(OrderErrorCode.INTERNAL_ERROR);
      expect(error.message).toContain('Réponse du serveur invalide');
    });

    it('should default to unknown error', () => {
      const jsError = new Error('Random error');
      
      const error = mapJavaScriptError(jsError);
      
      expect(error.code).toBe(OrderErrorCode.UNKNOWN_ERROR);
    });
  });

  describe('validateOrderData', () => {
    const validOrderData = {
      customerName: 'John Doe',
      customerPhone: '+224123456789',
      customerEmail: 'john@example.com',
      deliveryAddress: '123 Main Street, Conakry',
      deliveryZone: 'Ratoma',
      items: [
        {
          productId: '1',
          size: 'M',
          quantity: 2,
          price: 50000
        }
      ],
      deliveryFee: 20000,
      totalAmount: 120000
    };

    it('should return null for valid order data', () => {
      const error = validateOrderData(validOrderData);
      
      expect(error).toBeNull();
    });

    it('should validate customer name is required', () => {
      const invalidData = { ...validOrderData, customerName: '' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.MISSING_REQUIRED_FIELDS);
      expect(error?.field).toBe('customerName');
    });

    it('should validate customer name minimum length', () => {
      const invalidData = { ...validOrderData, customerName: 'A' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.MISSING_REQUIRED_FIELDS);
      expect(error?.field).toBe('customerName');
    });

    it('should validate phone is required', () => {
      const invalidData = { ...validOrderData, customerPhone: '' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.MISSING_REQUIRED_FIELDS);
      expect(error?.field).toBe('customerPhone');
    });

    it('should validate phone format', () => {
      const invalidData = { ...validOrderData, customerPhone: '123456789' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.INVALID_PHONE_FORMAT);
      expect(error?.field).toBe('customerPhone');
    });

    it('should validate email format if provided', () => {
      const invalidData = { ...validOrderData, customerEmail: 'invalid-email' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.INVALID_EMAIL_FORMAT);
      expect(error?.field).toBe('customerEmail');
    });

    it('should validate delivery address is required', () => {
      const invalidData = { ...validOrderData, deliveryAddress: '' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.MISSING_REQUIRED_FIELDS);
      expect(error?.field).toBe('deliveryAddress');
    });

    it('should validate delivery address minimum length', () => {
      const invalidData = { ...validOrderData, deliveryAddress: 'Short' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.MISSING_REQUIRED_FIELDS);
      expect(error?.field).toBe('deliveryAddress');
    });

    it('should validate delivery zone is required', () => {
      const invalidData = { ...validOrderData, deliveryZone: '' };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.MISSING_REQUIRED_FIELDS);
      expect(error?.field).toBe('deliveryZone');
    });

    it('should validate cart is not empty', () => {
      const invalidData = { ...validOrderData, items: [] };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.EMPTY_CART);
    });

    it('should validate item quantity is positive', () => {
      const invalidData = {
        ...validOrderData,
        items: [{ ...validOrderData.items[0], quantity: 0 }]
      };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.INVALID_QUANTITY);
    });

    it('should validate item has required fields', () => {
      const invalidData = {
        ...validOrderData,
        items: [{ productId: '1', size: 'M' }] // missing quantity and price
      };
      
      const error = validateOrderData(invalidData);
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe(OrderErrorCode.VALIDATION_ERROR);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have French messages for all error codes', () => {
      const errorCodes = Object.values(OrderErrorCode);
      
      errorCodes.forEach(code => {
        expect(ERROR_MESSAGES[code]).toBeDefined();
        expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
      });
    });

    it('should have user-friendly messages', () => {
      // Check that messages are in French and user-friendly
      expect(ERROR_MESSAGES[OrderErrorCode.VALIDATION_ERROR]).toContain('invalides');
      expect(ERROR_MESSAGES[OrderErrorCode.INSUFFICIENT_STOCK]).toContain('Stock insuffisant');
      expect(ERROR_MESSAGES[OrderErrorCode.BACKEND_UNAVAILABLE]).toContain('indisponible');
    });
  });
});
