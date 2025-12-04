/**
 * Gestionnaire d'erreurs Supabase
 * Détecte et formate les erreurs de permissions et autres erreurs Supabase
 */

/**
 * Types d'erreurs Supabase
 */
const ErrorTypes = {
  PERMISSION: 'PERMISSION_ERROR',
  RLS_POLICY: 'RLS_POLICY_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION: 'VALIDATION_ERROR',
  CONNECTION: 'CONNECTION_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

/**
 * Codes d'erreur PostgreSQL courants
 */
const PostgresErrorCodes = {
  INSUFFICIENT_PRIVILEGE: '42501',
  UNDEFINED_TABLE: '42P01',
  UNDEFINED_COLUMN: '42703',
  FOREIGN_KEY_VIOLATION: '23503',
  UNIQUE_VIOLATION: '23505',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514'
};

/**
 * Détecte le type d'erreur Supabase
 * @param {Object} error - L'erreur Supabase
 * @returns {string} Le type d'erreur
 */
function detectErrorType(error) {
  if (!error) return ErrorTypes.UNKNOWN;
  
  const message = error.message?.toLowerCase() || '';
  const code = error.code;
  const details = error.details?.toLowerCase() || '';
  const hint = error.hint?.toLowerCase() || '';
  
  // Erreurs de permissions
  if (
    code === PostgresErrorCodes.INSUFFICIENT_PRIVILEGE ||
    message.includes('permission denied') ||
    message.includes('insufficient privilege') ||
    details.includes('permission denied')
  ) {
    return ErrorTypes.PERMISSION;
  }
  
  // Erreurs RLS
  if (
    message.includes('row-level security') ||
    message.includes('rls policy') ||
    message.includes('policy') ||
    hint.includes('row-level security')
  ) {
    return ErrorTypes.RLS_POLICY;
  }
  
  // Erreurs de table/colonne non trouvée
  if (
    code === PostgresErrorCodes.UNDEFINED_TABLE ||
    code === PostgresErrorCodes.UNDEFINED_COLUMN ||
    message.includes('does not exist') ||
    message.includes('not found')
  ) {
    return ErrorTypes.NOT_FOUND;
  }
  
  // Erreurs de validation
  if (
    code === PostgresErrorCodes.FOREIGN_KEY_VIOLATION ||
    code === PostgresErrorCodes.UNIQUE_VIOLATION ||
    code === PostgresErrorCodes.NOT_NULL_VIOLATION ||
    code === PostgresErrorCodes.CHECK_VIOLATION ||
    message.includes('violates') ||
    message.includes('constraint')
  ) {
    return ErrorTypes.VALIDATION;
  }
  
  // Erreurs de connexion
  if (
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('network')
  ) {
    return ErrorTypes.CONNECTION;
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * Génère un message d'erreur clair pour l'utilisateur
 * @param {Object} error - L'erreur Supabase
 * @param {string} operation - L'opération qui a échoué (ex: 'create product')
 * @returns {Object} Message d'erreur formaté
 */
function formatErrorMessage(error, operation = 'operation') {
  const errorType = detectErrorType(error);
  
  let userMessage = '';
  let technicalDetails = {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint
  };
  
  switch (errorType) {
    case ErrorTypes.PERMISSION:
      userMessage = `Erreur de permissions: Impossible d'effectuer l'opération "${operation}". ` +
                   `Vérifiez que le service role key est correctement configuré.`;
      break;
      
    case ErrorTypes.RLS_POLICY:
      userMessage = `Erreur de sécurité (RLS): L'opération "${operation}" est bloquée par une politique de sécurité. ` +
                   `Vérifiez que RLS est désactivé ou que les policies sont correctement configurées.`;
      break;
      
    case ErrorTypes.NOT_FOUND:
      userMessage = `Ressource non trouvée: La table ou la colonne requise pour "${operation}" n'existe pas. ` +
                   `Vérifiez la structure de la base de données.`;
      break;
      
    case ErrorTypes.VALIDATION:
      userMessage = `Erreur de validation: Les données pour "${operation}" ne respectent pas les contraintes. ` +
                   `${error.message || 'Vérifiez les données envoyées.'}`;
      break;
      
    case ErrorTypes.CONNECTION:
      userMessage = `Erreur de connexion: Impossible de se connecter à Supabase pour "${operation}". ` +
                   `Vérifiez votre connexion internet et la configuration Supabase.`;
      break;
      
    default:
      userMessage = `Erreur lors de "${operation}": ${error.message || 'Erreur inconnue'}`;
  }
  
  return {
    success: false,
    error: {
      type: errorType,
      message: userMessage,
      technical: technicalDetails,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Logger une erreur de permissions
 * @param {Object} error - L'erreur Supabase
 * @param {string} operation - L'opération qui a échoué
 * @param {Object} context - Contexte additionnel (user, table, etc.)
 */
function logPermissionError(error, operation, context = {}) {
  const errorType = detectErrorType(error);
  
  console.error('═══════════════════════════════════════════════════════');
  console.error('❌ ERREUR SUPABASE DÉTECTÉE');
  console.error('═══════════════════════════════════════════════════════');
  console.error(`Type: ${errorType}`);
  console.error(`Operation: ${operation}`);
  console.error(`Timestamp: ${new Date().toISOString()}`);
  
  if (context.user) {
    console.error(`User: ${context.user}`);
  }
  
  if (context.table) {
    console.error(`Table: ${context.table}`);
  }
  
  console.error('\n📋 Détails de l\'erreur:');
  console.error(`Code: ${error.code || 'N/A'}`);
  console.error(`Message: ${error.message || 'N/A'}`);
  
  if (error.details) {
    console.error(`Details: ${error.details}`);
  }
  
  if (error.hint) {
    console.error(`Hint: ${error.hint}`);
  }
  
  // Suggestions de résolution
  console.error('\n💡 Suggestions de résolution:');
  
  switch (errorType) {
    case ErrorTypes.PERMISSION:
      console.error('   1. Vérifiez que SUPABASE_SERVICE_ROLE_KEY est défini');
      console.error('   2. Vérifiez que vous utilisez le service role key et non l\'anon key');
      console.error('   3. Vérifiez les permissions de la table dans Supabase');
      break;
      
    case ErrorTypes.RLS_POLICY:
      console.error('   1. Désactivez RLS: ALTER TABLE xxx DISABLE ROW LEVEL SECURITY;');
      console.error('   2. OU créez une policy permettant l\'opération');
      console.error('   3. Vérifiez que le service role key bypass bien RLS');
      break;
      
    case ErrorTypes.NOT_FOUND:
      console.error('   1. Vérifiez que la table existe dans Supabase');
      console.error('   2. Vérifiez l\'orthographe du nom de table/colonne');
      console.error('   3. Exécutez les migrations de schéma si nécessaire');
      break;
      
    case ErrorTypes.VALIDATION:
      console.error('   1. Vérifiez les contraintes de la table (NOT NULL, UNIQUE, etc.)');
      console.error('   2. Vérifiez les types de données envoyés');
      console.error('   3. Vérifiez les foreign keys');
      break;
      
    case ErrorTypes.CONNECTION:
      console.error('   1. Vérifiez SUPABASE_URL dans les variables d\'environnement');
      console.error('   2. Vérifiez votre connexion internet');
      console.error('   3. Vérifiez que Supabase est accessible');
      break;
      
    default:
      console.error('   1. Consultez les logs Supabase pour plus de détails');
      console.error('   2. Vérifiez la documentation Supabase');
  }
  
  console.error('═══════════════════════════════════════════════════════\n');
}

/**
 * Middleware Express pour gérer les erreurs Supabase
 * @param {Function} handler - Le handler de route async
 * @returns {Function} Middleware Express
 */
function withSupabaseErrorHandling(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      // Si c'est une erreur Supabase
      if (error.code || error.details || error.hint) {
        const operation = `${req.method} ${req.path}`;
        const context = {
          user: req.user?.username,
          table: extractTableName(req.path)
        };
        
        logPermissionError(error, operation, context);
        
        const formattedError = formatErrorMessage(error, operation);
        
        // Déterminer le code HTTP approprié
        const errorType = detectErrorType(error);
        let statusCode = 500;
        
        switch (errorType) {
          case ErrorTypes.PERMISSION:
          case ErrorTypes.RLS_POLICY:
            statusCode = 403;
            break;
          case ErrorTypes.NOT_FOUND:
            statusCode = 404;
            break;
          case ErrorTypes.VALIDATION:
            statusCode = 400;
            break;
          case ErrorTypes.CONNECTION:
            statusCode = 503;
            break;
        }
        
        return res.status(statusCode).json(formattedError);
      }
      
      // Erreur non-Supabase, passer au middleware d'erreur suivant
      next(error);
    }
  };
}

/**
 * Extrait le nom de la table depuis le path de la requête
 * @param {string} path - Le path de la requête
 * @returns {string|null} Le nom de la table ou null
 */
function extractTableName(path) {
  const match = path.match(/\/(products|orders|delivery-zones|admins)/);
  return match ? match[1] : null;
}

/**
 * Vérifie si une erreur est une erreur de permissions
 * @param {Object} error - L'erreur à vérifier
 * @returns {boolean} True si c'est une erreur de permissions
 */
function isPermissionError(error) {
  const errorType = detectErrorType(error);
  return errorType === ErrorTypes.PERMISSION || errorType === ErrorTypes.RLS_POLICY;
}

module.exports = {
  ErrorTypes,
  PostgresErrorCodes,
  detectErrorType,
  formatErrorMessage,
  logPermissionError,
  withSupabaseErrorHandling,
  isPermissionError
};
