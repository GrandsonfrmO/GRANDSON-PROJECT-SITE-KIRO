#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the production build and provides insights
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Analyzing Production Bundle...\n');

const buildDir = path.join(__dirname, '../frontend/.next');

if (!fs.existsSync(buildDir)) {
  console.error('❌ Build directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Analyze build manifest
const manifestPath = path.join(buildDir, 'build-manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  console.log('📦 Pages:');
  Object.keys(manifest.pages).forEach(page => {
    const files = manifest.pages[page];
    const jsFiles = files.filter(f => f.endsWith('.js'));
    console.log(`  - ${page}: ${jsFiles.length} JS files`);
  });
  console.log('');
}

// Analyze static files
const staticDir = path.join(buildDir, 'static');
if (fs.existsSync(staticDir)) {
  let totalSize = 0;
  let fileCount = 0;

  function getDirectorySize(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
        fileCount++;
      }
    });
  }

  getDirectorySize(staticDir);

  console.log('📊 Static Assets:');
  console.log(`  - Total files: ${fileCount}`);
  console.log(`  - Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log('');
}

// Performance recommendations
console.log('💡 Performance Recommendations:\n');

const recommendations = [
  {
    title: 'Image Optimization',
    description: 'Use WebP/AVIF formats for images',
    priority: 'High',
  },
  {
    title: 'Code Splitting',
    description: 'Ensure dynamic imports for large components',
    priority: 'Medium',
  },
  {
    title: 'Caching Strategy',
    description: 'Implement service worker for offline support',
    priority: 'Medium',
  },
  {
    title: 'Bundle Size',
    description: 'Keep main bundle under 200KB gzipped',
    priority: 'High',
  },
  {
    title: 'Tree Shaking',
    description: 'Remove unused code and dependencies',
    priority: 'Medium',
  },
];

recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec.title} [${rec.priority}]`);
  console.log(`   ${rec.description}\n`);
});

console.log('✅ Analysis complete!\n');
console.log('📝 Next steps:');
console.log('  1. Run "npm run build" to generate production build');
console.log('  2. Use Lighthouse to test performance');
console.log('  3. Monitor Core Web Vitals in production');
console.log('  4. Set up performance budgets\n');
