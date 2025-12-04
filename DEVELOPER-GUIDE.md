# Guide Développeur - Page Produits Améliorée

## 🎯 Vue d'ensemble

Ce guide explique l'architecture et les patterns utilisés pour les améliorations de la page produits.

---

## 🏗️ Architecture

### Structure des Fichiers

```
frontend/
├── app/
│   ├── products/
│   │   └── page.tsx              # Page principale (améliorée)
│   ├── components/
│   │   ├── ProductCard.tsx       # Carte produit (optimisée)
│   │   ├── ProductGrid.tsx       # Grille de produits
│   │   ├── ProductListView.tsx   # Vue liste (nouveau)
│   │   └── PerformanceMonitor.tsx # Moniteur perf (dev only)
│   ├── hooks/
│   │   ├── useProductCache.ts    # Hook de cache (nouveau)
│   │   └── useIsMobile.ts        # Détection mobile
│   ├── lib/
│   │   ├── cacheManager.ts       # Gestionnaire cache (nouveau)
│   │   └── imageOptimization.ts  # Optimisation images
│   └── types/
│       └── global.d.ts           # Types globaux (nouveau)
└── next.config.production.js     # Config production (nouveau)
```

---

## 🔧 Patterns Utilisés

### 1. Cache Pattern

```typescript
// Utilisation du cache manager
import { cacheManager } from '@/lib/cacheManager';

// Sauvegarder dans le cache
cacheManager.set('products', data, 5 * 60 * 1000); // 5 min TTL

// Récupérer du cache
const cached = cacheManager.get<Product[]>('products');

// Invalider le cache
cacheManager.remove('products');
```

### 2. Memoization Pattern

```typescript
// Mémoriser les calculs coûteux
const filteredProducts = useMemo(() => {
  return products.filter(/* ... */);
}, [products, filters]);

// Mémoriser les callbacks
const handleClick = useCallback(() => {
  // ...
}, [dependencies]);

// Mémoriser les composants
const ProductCard = memo(function ProductCard({ product }) {
  // ...
});
```

### 3. Performance Pattern

```typescript
// Images lazy loading
<img 
  src={imageUrl} 
  loading="lazy" 
  decoding="async"
/>

// Code splitting
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false
});

// Prefetching
<Link href="/products/123" prefetch={true}>
```

### 4. Analytics Pattern

```typescript
// Track events
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('event', 'select_item', {
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price
    }]
  });
}
```

---

## 📊 Hooks Personnalisés

### useProductCache

```typescript
import { useProductCache } from '@/hooks/useProductCache';

function ProductsPage() {
  const { products, loading, error, refetch } = useProductCache({
    cacheKey: 'products',
    ttl: 5 * 60 * 1000,
    fetchFn: async () => {
      const res = await fetch('/api/products');
      return res.json();
    }
  });

  return (
    <div>
      {loading && <Skeleton />}
      {error && <Error message={error} />}
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

### useIsMobile

```typescript
import { useIsMobile } from '@/hooks/useIsMobile';

function Component() {
  const isMobile = useIsMobile();
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {/* ... */}
    </div>
  );
}
```

---

## 🎨 Composants

### ProductCard

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  priority?: boolean;        // Pour eager loading
  onWishlistToggle?: (id: number) => void;
}
```

**Utilisation:**
```tsx
<ProductCard 
  product={product}
  priority={index < 4}  // Eager load first 4
  onWishlistToggle={handleWishlist}
/>
```

### ProductListView

**Props:**
```typescript
interface ProductListViewProps {
  products: Product[];
}
```

**Utilisation:**
```tsx
{viewMode === 'list' ? (
  <ProductListView products={filteredProducts} />
) : (
  <ProductGrid products={filteredProducts} />
)}
```

---

## 🔍 Debugging

### Cache Debugging

```javascript
// Dans la console du navigateur
// Voir le cache
console.log(sessionStorage);

// Voir les stats du cache
import { cacheManager } from '@/lib/cacheManager';
console.log(cacheManager.getStats());

// Vider le cache
cacheManager.clear();
```

### Performance Debugging

```javascript
// Activer le Performance Monitor (dev only)
// Il apparaît automatiquement en bas à droite

// Mesurer manuellement
const start = performance.now();
// ... code ...
const end = performance.now();
console.log(`Took ${end - start}ms`);

// Voir les métriques
performance.getEntriesByType('navigation');
performance.getEntriesByType('resource');
```

### React DevTools

```bash
# Installer l'extension React DevTools
# Puis dans l'onglet Profiler:
# 1. Cliquer sur "Record"
# 2. Interagir avec la page
# 3. Cliquer sur "Stop"
# 4. Analyser les re-renders
```

---

## 🧪 Tests

### Tests Unitaires

```typescript
// ProductCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

describe('ProductCard', () => {
  it('renders product name', () => {
    const product = { id: 1, name: 'Test Product', price: 1000 };
    render(<ProductCard product={product} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });
});
```

### Tests d'Intégration

```typescript
// products.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import ProductsPage from './page';

describe('ProductsPage', () => {
  it('loads and displays products', async () => {
    render(<ProductsPage />);
    await waitFor(() => {
      expect(screen.getByText(/produits disponibles/i)).toBeInTheDocument();
    });
  });
});
```

### Tests de Performance

```bash
# Lighthouse
npm run lighthouse

# Bundle analysis
npm run analyze

# Production tests
npm run test:prod
```

---

## 🚀 Optimisations

### Images

```typescript
// Utiliser getImageUrl pour l'optimisation Cloudinary
import { getImageUrl } from '@/lib/imageOptimization';

const optimizedUrl = getImageUrl(rawUrl, 'thumbnail'); // 400x400
const largeUrl = getImageUrl(rawUrl, 'large');        // 1200x1200
```

### Bundle Size

```bash
# Analyser le bundle
npm run build:analyze

# Vérifier les imports
# ❌ Mauvais
import _ from 'lodash';

# ✅ Bon
import debounce from 'lodash/debounce';
```

### Code Splitting

```typescript
// Dynamic imports
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false // Ne pas render côté serveur
});

// Route-based splitting (automatique avec Next.js)
// Chaque page dans app/ est automatiquement split
```

---

## 📝 Conventions de Code

### Naming

```typescript
// Composants: PascalCase
function ProductCard() {}

// Hooks: camelCase avec préfixe 'use'
function useProductCache() {}

// Constantes: UPPER_SNAKE_CASE
const MAX_PRODUCTS = 100;

// Variables: camelCase
const productList = [];
```

### File Structure

```typescript
// 1. Imports
import React from 'react';
import { Product } from '@/types';

// 2. Types/Interfaces
interface Props {
  product: Product;
}

// 3. Constants
const DEFAULT_IMAGE = '/placeholder.jpg';

// 4. Component
export default function ProductCard({ product }: Props) {
  // 4.1 Hooks
  const [loading, setLoading] = useState(false);
  
  // 4.2 Handlers
  const handleClick = () => {};
  
  // 4.3 Effects
  useEffect(() => {}, []);
  
  // 4.4 Render
  return <div>...</div>;
}
```

### Comments

```typescript
/**
 * Fetches products from the API with caching
 * @param cacheKey - Key for cache storage
 * @param ttl - Time to live in milliseconds
 * @returns Promise with products array
 */
async function fetchProducts(cacheKey: string, ttl: number): Promise<Product[]> {
  // Try cache first
  const cached = cacheManager.get<Product[]>(cacheKey);
  if (cached) return cached;
  
  // Fetch fresh data
  const data = await api.getProducts();
  
  // Cache the results
  cacheManager.set(cacheKey, data, ttl);
  
  return data;
}
```

---

## 🔐 Sécurité

### XSS Prevention

```typescript
// ❌ Dangereux
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Sûr
<div>{userInput}</div>
```

### API Keys

```typescript
// ❌ Ne jamais exposer les secrets
const API_SECRET = 'secret123';

// ✅ Utiliser les variables d'environnement
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
```

### CORS

```typescript
// next.config.js
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
      ],
    },
  ];
}
```

---

## 📚 Ressources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### Outils
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)

### Communauté
- [Next.js Discord](https://discord.gg/nextjs)
- [React Discord](https://discord.gg/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 🤝 Contribution

### Workflow

1. Créer une branche
```bash
git checkout -b feature/my-feature
```

2. Faire les modifications

3. Tester
```bash
npm run test
npm run lint
npm run build
```

4. Commit
```bash
git add .
git commit -m "feat: add new feature"
```

5. Push et PR
```bash
git push origin feature/my-feature
```

### Commit Messages

Format: `type(scope): message`

Types:
- `feat`: Nouvelle fonctionnalité
- `fix`: Correction de bug
- `perf`: Amélioration de performance
- `refactor`: Refactoring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

Exemples:
```
feat(products): add list view mode
fix(cache): resolve memory leak
perf(images): optimize loading
docs(readme): update installation steps
```

---

**Dernière mise à jour**: 4 Décembre 2024
**Auteur**: Kiro AI Assistant
