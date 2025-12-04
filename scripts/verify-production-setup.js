#!/usr/bin/env node

/**
 * Production Setup Verification Script
 * Verifies all production enhancements are in place
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

console.log(`${COLORS.blue}🔍 Verifying Production Setup...${COLORS.reset}\n`);

let checks = 0;
let passed = 0;
let failed = 0;

function check(name, condition, message = '') {
  checks++;
  if (condition) {
    console.log(`${COLORS.green}✓${COLORS.reset} ${name}`);
    passed++;
  } else {
    console.log(`${COLORS.red}✗${COLORS.reset} ${name}`);
    if (message) console.log(`  ${COLORS.yellow}→ ${message}${COLORS.reset}`);
    failed++;
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath));
}

console.log(`${COLORS.cyan}📦 Checking Components...${COLORS.reset}`);
check('ProductCard.tsx exists', fileExists('frontend/app/components/ProductCard.tsx'));
check('ProductListView.tsx exists', fileExists('frontend/app/components/ProductListView.tsx'));
check('AdvancedFilters.tsx exists', fileExists('frontend/app/components/AdvancedFilters.tsx'));
check('UserPreferencesPanel.tsx exists', fileExists('frontend/app/components/UserPreferencesPanel.tsx'));
check('PerformanceMonitor.tsx exists', fileExists('frontend/app/components/PerformanceMonitor.tsx'));

console.log(`\n${COLORS.cyan}🛠️  Checking Utilities...${COLORS.reset}`);
check('cacheManager.ts exists', fileExists('frontend/app/lib/cacheManager.ts'));
check('userPreferences.ts exists', fileExists('frontend/app/lib/userPreferences.ts'));
check('useProductCache.ts exists', fileExists('frontend/app/hooks/useProductCache.ts'));

console.log(`\n${COLORS.cyan}📄 Checking Documentation...${COLORS.reset}`);
check('PRODUCTION-README.md exists', fileExists('PRODUCTION-README.md'));
check('PRODUCTION-ENHANCEMENTS-SUMMARY.md exists', fileExists('PRODUCTION-ENHANCEMENTS-SUMMARY.md'));
check('DEVELOPER-GUIDE.md exists', fileExists('DEVELOPER-GUIDE.md'));
check('DEPLOYMENT-PRODUCTS-PAGE.md exists', fileExists('DEPLOYMENT-PRODUCTS-PAGE.md'));
check('MIGRATION-GUIDE.md exists', fileExists('MIGRATION-GUIDE.md'));

console.log(`\n${COLORS.cyan}⚙️  Checking Configuration...${COLORS.reset}`);
check('next.config.production.js exists', fileExists('frontend/next.config.production.js'));
check('lighthouserc.json exists', fileExists('lighthouserc.json'));
check('.env.production exists', fileExists('.env.production'));

console.log(`\n${COLORS.cyan}🧪 Checking Scripts...${COLORS.reset}`);
check('test-production.js exists', fileExists('scripts/test-production.js'));
check('analyze-bundle.js exists', fileExists('scripts/analyze-bundle.js'));

console.log(`\n${COLORS.cyan}📊 Checking package.json scripts...${COLORS.reset}`);
const packageJsonPath = path.join(__dirname, '..', 'frontend', 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  check('build:analyze script exists', !!packageJson.scripts['build:analyze']);
  check('test:prod script exists', !!packageJson.scripts['test:prod']);
  check('analyze script exists', !!packageJson.scripts['analyze']);
  check('lighthouse script exists', !!packageJson.scripts['lighthouse']);
} else {
  check('package.json exists', false, 'File not found');
}

console.log('\n' + '='.repeat(50));
console.log(`${COLORS.blue}📊 Results${COLORS.reset}`);
console.log('='.repeat(50));
console.log(`Total checks: ${checks}`);
console.log(`${COLORS.green}Passed: ${passed}${COLORS.reset}`);
console.log(`${COLORS.red}Failed: ${failed}${COLORS.reset}`);
console.log('='.repeat(50) + '\n');

if (failed === 0) {
  console.log(`${COLORS.green}✅ All checks passed! Production setup is complete.${COLORS.reset}\n`);
  process.exit(0);
} else {
  console.log(`${COLORS.red}❌ Some checks failed. Please review and fix.${COLORS.reset}\n`);
  process.exit(1);
}
