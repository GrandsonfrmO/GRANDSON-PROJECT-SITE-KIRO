/**
 * User-friendly error messages for different error scenarios
 * Provides clear, actionable error messages for users
 */

export interface ErrorMessage {
  title: string;
  message: string;
  action?: string;
}

/**
 * Get user-friendly error message based on error code
 */
export function getErrorMessage(errorCode: string, defaultMessage?: string): ErrorMessage {
  const messages: Record<string, ErrorMessage> = {
    // Authentication errors
    'UNAUTHORIZED': {
      title: 'Non autorisé',
      message: 'Vous devez être connecté pour effectuer cette action.',
      action: 'Veuillez vous connecter et réessayer.'
    },
    'NO_TOKEN': {
      title: 'Session expirée',
      message: 'Votre session a expiré.',
      action: 'Veuillez vous reconnecter.'
    },
    'INVALID_TOKEN': {
      title: 'Session invalide',
      message: 'Votre session est invalide.',
      action: 'Veuillez vous reconnecter.'
    },
    'TOKEN_EXPIRED': {
      title: 'Session expirée',
      message: 'Votre session a expiré pour des raisons de sécurité.',
      action: 'Veuillez vous reconnecter.'
    },
    'INVALID_CREDENTIALS': {
      title: 'Identifiants incorrects',
      message: 'Le nom d\'utilisateur ou le mot de passe est incorrect.',
      action: 'Veuillez vérifier vos identifiants et réessayer.'
    },

    // Validation errors
    'VALIDATION_ERROR': {
      title: 'Données invalides',
      message: 'Certaines informations sont manquantes ou incorrectes.',
      action: 'Veuillez vérifier tous les champs et réessayer.'
    },
    'NO_FILE': {
      title: 'Aucun fichier',
      message: 'Aucun fichier n\'a été sélectionné.',
      action: 'Veuillez sélectionner une image et réessayer.'
    },
    'INVALID_FILE': {
      title: 'Fichier invalide',
      message: 'Le fichier sélectionné n\'est pas valide.',
      action: 'Veuillez sélectionner une image au format JPG, PNG ou WebP (max 5MB).'
    },

    // Database errors
    'DATABASE_ERROR': {
      title: 'Erreur de base de données',
      message: 'Une erreur s\'est produite lors de l\'accès à la base de données.',
      action: 'Veuillez réessayer dans quelques instants.'
    },
    'NOT_FOUND': {
      title: 'Non trouvé',
      message: 'L\'élément demandé n\'a pas été trouvé.',
      action: 'Il a peut-être été supprimé. Veuillez actualiser la page.'
    },
    'DUPLICATE_ENTRY': {
      title: 'Doublon détecté',
      message: 'Cet élément existe déjà.',
      action: 'Veuillez utiliser un nom différent.'
    },

    // Upload errors
    'UPLOAD_FAILED': {
      title: 'Échec de l\'upload',
      message: 'L\'image n\'a pas pu être uploadée.',
      action: 'Veuillez vérifier votre connexion et réessayer.'
    },
    'CLOUDINARY_ERROR': {
      title: 'Erreur de stockage',
      message: 'Une erreur s\'est produite lors du stockage de l\'image.',
      action: 'Veuillez réessayer dans quelques instants.'
    },
    'CONFIG_ERROR': {
      title: 'Erreur de configuration',
      message: 'Le serveur n\'est pas correctement configuré.',
      action: 'Veuillez contacter le support technique.'
    },

    // Network errors
    'NETWORK_ERROR': {
      title: 'Erreur de connexion',
      message: 'Impossible de se connecter au serveur.',
      action: 'Veuillez vérifier votre connexion internet et réessayer.'
    },
    'TIMEOUT': {
      title: 'Délai d\'attente dépassé',
      message: 'Le serveur met trop de temps à répondre.',
      action: 'Veuillez réessayer dans quelques instants.'
    },

    // Server errors
    'INTERNAL_ERROR': {
      title: 'Erreur serveur',
      message: 'Une erreur inattendue s\'est produite sur le serveur.',
      action: 'Veuillez réessayer dans quelques instants.'
    },
    'SERVICE_UNAVAILABLE': {
      title: 'Service indisponible',
      message: 'Le service est temporairement indisponible.',
      action: 'Veuillez réessayer dans quelques minutes.'
    },

    // CORS errors
    'CORS_ERROR': {
      title: 'Erreur de sécurité',
      message: 'La requête a été bloquée pour des raisons de sécurité.',
      action: 'Veuillez contacter le support technique.'
    }
  };

  // Return specific message if found
  if (messages[errorCode]) {
    return messages[errorCode];
  }

  // Return default message
  return {
    title: 'Erreur',
    message: defaultMessage || 'Une erreur s\'est produite.',
    action: 'Veuillez réessayer.'
  };
}

/**
 * Get error message from API error response
 */
export function getApiErrorMessage(error: any): ErrorMessage {
  // Check if error has a response (axios-style error)
  if (error.response) {
    const { data, status } = error.response;
    
    // Check for error code in response
    if (data?.error?.code) {
      return getErrorMessage(data.error.code, data.error.message);
    }
    
    // Check for error message in response
    if (data?.error?.message) {
      return {
        title: 'Erreur',
        message: data.error.message,
        action: 'Veuillez réessayer.'
      };
    }
    
    // Handle HTTP status codes
    if (status === 401) {
      return getErrorMessage('UNAUTHORIZED');
    } else if (status === 403) {
      return {
        title: 'Accès refusé',
        message: 'Vous n\'avez pas les permissions nécessaires.',
        action: 'Veuillez contacter un administrateur.'
      };
    } else if (status === 404) {
      return getErrorMessage('NOT_FOUND');
    } else if (status === 500) {
      return getErrorMessage('INTERNAL_ERROR');
    } else if (status === 503) {
      return getErrorMessage('SERVICE_UNAVAILABLE');
    }
  }
  
  // Check if it's a network error
  if (error.message === 'Network Error' || !error.response) {
    return getErrorMessage('NETWORK_ERROR');
  }
  
  // Check if it's a timeout error
  if (error.code === 'ECONNABORTED') {
    return getErrorMessage('TIMEOUT');
  }
  
  // Default error message
  return {
    title: 'Erreur',
    message: error.message || 'Une erreur inattendue s\'est produite.',
    action: 'Veuillez réessayer.'
  };
}

/**
 * Format error message for display
 */
export function formatErrorMessage(errorMessage: ErrorMessage): string {
  let formatted = `${errorMessage.title}: ${errorMessage.message}`;
  if (errorMessage.action) {
    formatted += ` ${errorMessage.action}`;
  }
  return formatted;
}

/**
 * Get validation error messages for form fields
 */
export function getValidationErrors(errors: Record<string, string>): string[] {
  return Object.entries(errors).map(([field, message]) => {
    const fieldNames: Record<string, string> = {
      name: 'Nom',
      price: 'Prix',
      category: 'Catégorie',
      stock: 'Stock',
      description: 'Description',
      sizes: 'Tailles',
      colors: 'Couleurs',
      images: 'Images'
    };
    
    const fieldName = fieldNames[field] || field;
    return `${fieldName}: ${message}`;
  });
}
