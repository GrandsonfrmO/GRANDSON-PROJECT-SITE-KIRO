/**
 * Script de test de la gestion des erreurs de permissions
 * Simule différents types d'erreurs Supabase pour vérifier le formatage
 * 
 * Usage: node test-permission-error-handling.js
 */

const {
  ErrorTypes,
  detectErrorType,
  formatErrorMessage,
  logPermissionError,
  isPermissionError
} = require('./supabaseErrorHandler');

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Exemples d'erreurs Supabase
const testErrors = [
  {
    name: 'Permission Denied Error',
    error: {
      code: '42501',
      message: 'permission denied for table products',
      details: 'User does not have permission to insert into table products',
      hint: 'Check your database permissions'
    },
    expectedType: ErrorTypes.PERMISSION
  },
  {
    name: 'RLS Policy Error',
    error: {
      message: 'new row violates row-level security policy for table "products"',
      details: 'Policy "products_policy" is preventing this operation',
      hint: 'Check your RLS policies or use service role key'
    },
    expectedType: ErrorTypes.RLS_POLICY
  },
  {
    name: 'Table Not Found Error',
    error: {
      code: '42P01',
      message: 'relation "products" does not exist',
      details: 'The table you are trying to access does not exist'
    },
    expectedType: ErrorTypes.NOT_FOUND
  },
  {
    name: 'Unique Violation Error',
    error: {
      code: '23505',
      message: 'duplicate key value violates unique constraint "products_name_key"',
      details: 'Key (name)=(Test Product) already exists'
    },
    expectedType: ErrorTypes.VALIDATION
  },
  {
    name: 'Not Null Violation Error',
    error: {
      code: '23502',
      message: 'null value in column "name" violates not-null constraint',
      details: 'Failing row contains (id, null, ...)'
    },
    expectedType: ErrorTypes.VALIDATION
  },
  {
    name: 'Connection Error',
    error: {
      message: 'connection timeout',
      details: 'Could not connect to database'
    },
    expectedType: ErrorTypes.CONNECTION
  },
  {
    name: 'Unknown Error',
    error: {
      message: 'Something went wrong',
      details: 'Unknown error occurred'
    },
    expectedType: ErrorTypes.UNKNOWN
  }
];

function runTests() {
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║   TEST DE LA GESTION DES ERREURS DE PERMISSIONS          ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  let passedTests = 0;
  let failedTests = 0;
  
  testErrors.forEach((test, index) => {
    log(`\n📋 Test ${index + 1}: ${test.name}`, 'cyan');
    log('─'.repeat(60), 'cyan');
    
    // Test 1: Détection du type d'erreur
    const detectedType = detectErrorType(test.error);
    const typeCorrect = detectedType === test.expectedType;
    
    if (typeCorrect) {
      log(`✅ Type détecté correctement: ${detectedType}`, 'green');
      passedTests++;
    } else {
      log(`❌ Type incorrect: attendu ${test.expectedType}, obtenu ${detectedType}`, 'red');
      failedTests++;
    }
    
    // Test 2: Vérification isPermissionError
    const isPermError = isPermissionError(test.error);
    const shouldBePermError = test.expectedType === ErrorTypes.PERMISSION || 
                              test.expectedType === ErrorTypes.RLS_POLICY;
    
    if (isPermError === shouldBePermError) {
      log(`✅ isPermissionError correct: ${isPermError}`, 'green');
      passedTests++;
    } else {
      log(`❌ isPermissionError incorrect: attendu ${shouldBePermError}, obtenu ${isPermError}`, 'red');
      failedTests++;
    }
    
    // Test 3: Formatage du message
    const formatted = formatErrorMessage(test.error, 'test operation');
    
    if (formatted.success === false && formatted.error && formatted.error.message) {
      log(`✅ Message formaté correctement`, 'green');
      log(`   Message: ${formatted.error.message.substring(0, 80)}...`, 'yellow');
      passedTests++;
    } else {
      log(`❌ Formatage du message incorrect`, 'red');
      failedTests++;
    }
    
    // Test 4: Logging (visuel seulement)
    if (isPermError) {
      log(`\n📝 Exemple de log pour cette erreur:`, 'cyan');
      logPermissionError(test.error, 'test operation', {
        user: 'test-user',
        table: 'products'
      });
    }
  });
  
  // Résumé
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║                    RÉSUMÉ DES TESTS                        ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  const totalTests = passedTests + failedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  log(`\n📊 Résultats:`, 'cyan');
  log(`   Tests réussis: ${passedTests}/${totalTests} (${successRate}%)`, passedTests === totalTests ? 'green' : 'yellow');
  log(`   Tests échoués: ${failedTests}/${totalTests}`, failedTests === 0 ? 'green' : 'red');
  
  log('\n' + '═'.repeat(60), 'blue');
  
  if (failedTests === 0) {
    log('\n🎉 TOUS LES TESTS SONT PASSÉS!', 'green');
    log('✅ La gestion des erreurs de permissions fonctionne correctement', 'green');
  } else {
    log('\n⚠️ CERTAINS TESTS ONT ÉCHOUÉ', 'yellow');
    log('❌ Vérifiez la logique de détection des erreurs', 'red');
  }
  
  log('\n');
  process.exit(failedTests === 0 ? 0 : 1);
}

// Exécuter les tests
runTests();
