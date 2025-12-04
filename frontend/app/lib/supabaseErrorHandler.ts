/**
 * Gestionnaire d'erreurs Supabase pour le frontend
 * Détecte et formate les erreurs de permissions et autres erreurs Supabase
 */

export enum ErrorType {
  PERMISSION = 'PERMISSION_ERROR',
  RLS_POLICY = 'RLS_POLICY_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION_ERROR',
  CONNECTION = 'CONNECTION_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

interface FormattedError {
  success: false;
  error: {
    type: ErrorType;
    code: string;
    message: string;
    technical?: {
      code?: string;
      message?: string;
      details?: string;
      hint?: string;
    };
    timestamp: string;
  };
}

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
 */
export function detectErrorType(error: SupabaseError): ErrorType {
  if (!error) return ErrorType.UNKNOWN;
  
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
    return ErrorType.PERMISSION;
  }
  
  // Erreurs RLS
  if (
    message.includes('row-level security') ||
    message.includes('rls policy') ||
    message.includes('policy') ||
    hint.includes('row-level security')
  ) {
    return ErrorType.RLS_POLICY;
  }
  
  // Erreurs de table/colonne non trouvée
  if (
    code === PostgresErrorCodes.UNDEFINED_TABLE ||
    code === PostgresErrorCodes.UNDEFINED_COLUMN ||
    message.includes('does not exist') ||
    message.includes('not found')
  ) {
    return ErrorType.NOT_FOUND;
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
    return ErrorType.VALIDATION;
  }
  
  // Erreurs de connexion
  if (
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('network')
  ) {
    return ErrorType.CONNECTION;
  }
  
  return ErrorType.UNKNOWN;
}

/**
 * Génère un message d'erreur clair pour l'utilisateur
 */
export function formatSupabaseError(
  error: SupabaseError,
  operation: string = 'operation'
): FormattedError {
  const errorType = detectErrorType(error);
  
  let userMessage = '';
  let errorCode = 'SUPABASE_ERROR';
  
  switch (errorType) {
    case ErrorType.PERMISSION:
      errorCode = 'PERMISSION_DENIED';
      userMessage = `Erreur de permissions: Impossible d'effectuer l'opération "${operation}". ` +
                   `Vérifiez que vous avez les droits nécessaires.`;
      break;
      
    case ErrorType.RLS_POLICY:
      errorCode = 'RLS_POLICY_VIOLATION';
      userMessage = `Erreur de sécurité: L'opération "${operation}" est bloquée par une politique de sécurité. ` +
                   `Contactez l'administrateur système.`;
      break;
      
    case ErrorType.NOT_FOUND:
      errorCode = 'RESOURCE_NOT_FOUND';
      userMessage = `Ressource non trouvée: La ressource requise pour "${operation}" n'existe pas.`;
      break;
      
    case ErrorType.VALIDATION:
      errorCode = 'VALIDATION_ERROR';
      userMessage = `Erreur de validation: Les données pour "${operation}" ne respectent pas les contraintes. ` +
                   `${error.message || 'Vérifiez les données envoyées.'}`;
      break;
      
    case ErrorType.CONNECTION:
      errorCode = 'CONNECTION_ERROR';
      userMessage = `Erreur de connexion: Impossible de se connecter à la base de données pour "${operation}". ` +
                   `Vérifiez votre connexion internet.`;
      break;
      
    default:
      errorCode = 'UNKNOWN_ERROR';
      userMessage = `Erreur lors de "${operation}": ${error.message || 'Erreur inconnue'}`;
  }
  
  return {
    success: false,
    error: {
      type: errorType,
      code: errorCode,
      message: userMessage,
      technical: {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      },
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Vérifie si une erreur est une erreur de permissions
 */
export function isPermissionError(error: SupabaseError): boolean {
  const errorType = detectErrorType(error);
  return errorType === ErrorType.PERMISSION || errorType === ErrorType.RLS_POLICY;
}

/**
 * Logger une erreur de permissions (côté serveur uniquement)
 */
export function logPermissionError(
  error: SupabaseError,
  operation: string,
  context: { user?: string; table?: string } = {}
): void {
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
    case ErrorType.PERMISSION:
      console.error('   1. Vérifiez que SUPABASE_SERVICE_ROLE_KEY est défini');
      console.error('   2. Vérifiez que vous utilisez le service role key et non l\'anon key');
      console.error('   3. Vérifiez les permissions de la table dans Supabase');
      break;
      
    case ErrorType.RLS_POLICY:
      console.error('   1. Désactivez RLS: ALTER TABLE xxx DISABLE ROW LEVEL SECURITY;');
      console.error('   2. OU créez une policy permettant l\'opération');
      console.error('   3. Vérifiez que le service role key bypass bien RLS');
      break;
      
    case ErrorType.NOT_FOUND:
      console.error('   1. Vérifiez que la table existe dans Supabase');
      console.error('   2. Vérifiez l\'orthographe du nom de table/colonne');
      console.error('   3. Exécutez les migrations de schéma si nécessaire');
      break;
      
    case ErrorType.VALIDATION:
      console.error('   1. Vérifiez les contraintes de la table (NOT NULL, UNIQUE, etc.)');
      console.error('   2. Vérifiez les types de données envoyés');
      console.error('   3. Vérifiez les foreign keys');
      break;
      
    case ErrorType.CONNECTION:
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
