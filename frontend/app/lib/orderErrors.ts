/**
 * Order Error Handling Utilities
 * Provides specific error codes and user-friendly French messages
 */

export enum OrderErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELDS = 'MISSING_REQUIRED_FIELDS',
  INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
  INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
  EMPTY_CART = 'EMPTY_CART',
  INVALID_QUANTITY = 'INVALID_QUANTITY',
  
  // Stock Errors (400)
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  PRODUCT_INACTIVE = 'PRODUCT_INACTIVE',
  
  // Database Errors (500)
  DATABASE_ERROR = 'DATABASE_ERROR',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // Backend Errors (503)
  BACKEND_UNAVAILABLE = 'BACKEND_UNAVAILABLE',
  BACKEND_TIMEOUT = 'BACKEND_TIMEOUT',
  
  // Order Errors
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_CREATION_FAILED = 'ORDER_CREATION_FAILED',
  
  // Generic Errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface OrderError {
  code: OrderErrorCode;
  message: string;
  details?: string;
  field?: string;
}

/**
 * User-friendly French error messages mapped to error codes
 */
export const ERROR_MESSAGES: Record<OrderErrorCode, string> = {
  // Validation Errors
  [OrderErrorCode.VALIDATION_ERROR]: 'Les informations fournies sont invalides. Veuillez vérifier vos données.',
  [OrderErrorCode.MISSING_REQUIRED_FIELDS]: 'Certains champs obligatoires sont manquants. Veuillez remplir tous les champs requis.',
  [OrderErrorCode.INVALID_PHONE_FORMAT]: 'Le numéro de téléphone est invalide. Format attendu: +224XXXXXXXXX',
  [OrderErrorCode.INVALID_EMAIL_FORMAT]: 'L\'adresse email est invalide. Veuillez entrer une adresse email valide.',
  [OrderErrorCode.EMPTY_CART]: 'Votre panier est vide. Ajoutez des articles avant de passer commande.',
  [OrderErrorCode.INVALID_QUANTITY]: 'La quantité demandée est invalide. Veuillez vérifier votre panier.',
  
  // Stock Errors
  [OrderErrorCode.INSUFFICIENT_STOCK]: 'Stock insuffisant pour un ou plusieurs articles. Veuillez ajuster les quantités.',
  [OrderErrorCode.PRODUCT_NOT_FOUND]: 'Un ou plusieurs produits ne sont plus disponibles.',
  [OrderErrorCode.PRODUCT_INACTIVE]: 'Un ou plusieurs produits ne sont plus en vente.',
  
  // Database Errors
  [OrderErrorCode.DATABASE_ERROR]: 'Une erreur technique est survenue. Veuillez réessayer dans quelques instants.',
  [OrderErrorCode.DATABASE_CONNECTION_FAILED]: 'Impossible de se connecter à la base de données. Veuillez réessayer.',
  [OrderErrorCode.TRANSACTION_FAILED]: 'La transaction a échoué. Aucune modification n\'a été effectuée. Veuillez réessayer.',
  
  // Backend Errors
  [OrderErrorCode.BACKEND_UNAVAILABLE]: 'Le service est temporairement indisponible. Votre commande sera traitée en mode démo.',
  [OrderErrorCode.BACKEND_TIMEOUT]: 'Le serveur met trop de temps à répondre. Veuillez réessayer.',
  
  // Order Errors
  [OrderErrorCode.ORDER_NOT_FOUND]: 'Commande introuvable. Veuillez vérifier le numéro de commande.',
  [OrderErrorCode.ORDER_CREATION_FAILED]: 'Impossible de créer la commande. Veuillez réessayer ou contacter le support.',
  
  // Generic Errors
  [OrderErrorCode.INTERNAL_ERROR]: 'Une erreur interne est survenue. Veuillez réessayer ou contacter le support.',
  [OrderErrorCode.NETWORK_ERROR]: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
  [OrderErrorCode.UNKNOWN_ERROR]: 'Une erreur inattendue est survenue. Veuillez réessayer.',
};

/**
 * Maps backend error responses to standardized error codes
 */
export function mapBackendError(backendError: any): OrderError {
  // If backend already provides a structured error
  if (backendError?.error?.code && backendError?.error?.message) {
    return {
      code: backendError.error.code as OrderErrorCode,
      message: backendError.error.message,
      details: backendError.error.details,
      field: backendError.error.field,
    };
  }

  // Map common backend error messages to error codes
  const errorMessage = backendError?.message || backendError?.error || String(backendError);
  const lowerMessage = errorMessage.toLowerCase();

  if (lowerMessage.includes('stock') || lowerMessage.includes('insufficient')) {
    return createError(OrderErrorCode.INSUFFICIENT_STOCK);
  }

  if (lowerMessage.includes('product not found') || lowerMessage.includes('produit introuvable')) {
    return createError(OrderErrorCode.PRODUCT_NOT_FOUND);
  }

  if (lowerMessage.includes('validation') || lowerMessage.includes('invalid')) {
    return createError(OrderErrorCode.VALIDATION_ERROR, errorMessage);
  }

  if (lowerMessage.includes('database') || lowerMessage.includes('db')) {
    return createError(OrderErrorCode.DATABASE_ERROR);
  }

  if (lowerMessage.includes('transaction')) {
    return createError(OrderErrorCode.TRANSACTION_FAILED);
  }

  // Default to internal error
  return createError(OrderErrorCode.INTERNAL_ERROR, errorMessage);
}

/**
 * Maps JavaScript errors to standardized error codes
 */
export function mapJavaScriptError(error: Error): OrderError {
  const errorName = error.name;
  const errorMessage = error.message;

  // Network errors
  if (errorName === 'TypeError' && errorMessage.includes('fetch')) {
    return createError(OrderErrorCode.NETWORK_ERROR);
  }

  // Timeout errors
  if (errorName === 'AbortError' || errorMessage.includes('timeout')) {
    return createError(OrderErrorCode.BACKEND_TIMEOUT);
  }

  // JSON parsing errors
  if (errorName === 'SyntaxError' && errorMessage.includes('JSON')) {
    return createError(OrderErrorCode.INTERNAL_ERROR, 'Réponse du serveur invalide');
  }

  // Default to unknown error
  return createError(OrderErrorCode.UNKNOWN_ERROR, errorMessage);
}

/**
 * Creates a standardized error object
 */
export function createError(
  code: OrderErrorCode,
  customMessage?: string,
  details?: string,
  field?: string
): OrderError {
  return {
    code,
    message: customMessage || ERROR_MESSAGES[code],
    details,
    field,
  };
}

/**
 * Logs error with context for debugging
 */
export function logError(
  context: string,
  error: OrderError | Error,
  additionalContext?: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  const isOrderError = 'code' in error;

  console.error(`\n${'='.repeat(80)}`);
  console.error(`[${timestamp}] ❌ ERROR in ${context}`);
  console.error(`${'='.repeat(80)}`);

  if (isOrderError) {
    console.error(`📄 Error Code: ${error.code}`);
    console.error(`📄 Error Message: ${error.message}`);
    if (error.details) {
      console.error(`📄 Error Details: ${error.details}`);
    }
    if (error.field) {
      console.error(`📄 Error Field: ${error.field}`);
    }
  } else {
    console.error(`📄 Error Type: ${error.name}`);
    console.error(`📄 Error Message: ${error.message}`);
    console.error(`📄 Error Stack:`, error.stack);
  }

  if (additionalContext) {
    console.error(`📄 Additional Context:`, JSON.stringify(additionalContext, null, 2));
  }

  console.error(`${'='.repeat(80)}\n`);
}

/**
 * Validates order data and returns validation errors
 */
export function validateOrderData(orderData: any): OrderError | null {
  // Check required fields
  if (!orderData.customerName || orderData.customerName.trim().length < 2) {
    return createError(
      OrderErrorCode.MISSING_REQUIRED_FIELDS,
      'Le nom du client est requis (minimum 2 caractères)',
      undefined,
      'customerName'
    );
  }

  if (!orderData.customerPhone) {
    return createError(
      OrderErrorCode.MISSING_REQUIRED_FIELDS,
      'Le numéro de téléphone est requis',
      undefined,
      'customerPhone'
    );
  }

  // Validate phone format
  const phoneRegex = /^\+224[0-9]{9}$/;
  if (!phoneRegex.test(orderData.customerPhone)) {
    return createError(
      OrderErrorCode.INVALID_PHONE_FORMAT,
      undefined,
      undefined,
      'customerPhone'
    );
  }

  // Validate email if provided
  if (orderData.customerEmail) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customerEmail)) {
      return createError(
        OrderErrorCode.INVALID_EMAIL_FORMAT,
        undefined,
        undefined,
        'customerEmail'
      );
    }
  }

  if (!orderData.deliveryAddress || orderData.deliveryAddress.trim().length < 10) {
    return createError(
      OrderErrorCode.MISSING_REQUIRED_FIELDS,
      'L\'adresse de livraison est requise (minimum 10 caractères)',
      undefined,
      'deliveryAddress'
    );
  }

  if (!orderData.deliveryZone) {
    return createError(
      OrderErrorCode.MISSING_REQUIRED_FIELDS,
      'La zone de livraison est requise',
      undefined,
      'deliveryZone'
    );
  }

  // Check cart
  if (!orderData.items || orderData.items.length === 0) {
    return createError(OrderErrorCode.EMPTY_CART);
  }

  // Validate items
  for (const item of orderData.items) {
    if (item.quantity !== undefined && item.quantity <= 0) {
      return createError(OrderErrorCode.INVALID_QUANTITY);
    }
    
    if (!item.productId || !item.size || !item.quantity || !item.price) {
      return createError(
        OrderErrorCode.VALIDATION_ERROR,
        'Données d\'article invalides dans le panier'
      );
    }
  }

  return null;
}
