'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Product } from '../types';
import api from '../lib/api';
import { transformProducts } from '../lib/dataTransform';
import Layout from '../components/Layout';
import ProductGrid from '../components/ProductGrid';
import ProductListView from '../components/ProductListView';
import CategoryFilter from '../components/CategoryFilter';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch products with caching and error handling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get from cache first (production optimization)
        const cacheKey = 'products_cache';
        const cacheTime = 5 * 60 * 1000; // 5 minutes
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_time`);
        
        if (cached && cacheTimestamp) {
          const age = Date.now() - parseInt(cacheTimestamp);
          if (age < cacheTime) {
            const cachedData = JSON.parse(cached);
            setProducts(cachedData.products);
            setFilteredProducts(cachedData.products);
            setCategories(cachedData.categories);
            setLoading(false);
            return;
          }
        }
        
        const response = await fetch('/api/products', {
          cache: 'no-store' // Toujours récupérer les données fraîches
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des produits');
        }
        
        const data = await response.json();
        const productsList = data.products || data.data?.products || [];
        const transformedProducts = transformProducts(productsList);
        const activeProducts = transformedProducts.filter((p: Product) => p.isActive);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(activeProducts.map((p: Product) => p.category))
        ) as string[];
        
        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify({
          products: activeProducts,
          categories: uniqueCategories
        }));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
        
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Impossible de charger les produits. Veuillez réessayer.');
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Memoized filter and sort logic for better performance
  const processedProducts = useMemo(() => {
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.category.toLowerCase().includes(searchLower)
      );
    }

    // Sort products
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        break;
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        // Keep original order (newest first)
        break;
    }
    
    return filtered;
  }, [products, selectedCategory, searchTerm, sortBy]);

  useEffect(() => {
    setFilteredProducts(processedProducts);
  }, [processedProducts]);

  // Debounced search for better performance
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  // Track analytics (production)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Products Page',
        page_location: window.location.href,
        page_path: '/products'
      });
    }
  }, []);

  // Track filter changes
  useEffect(() => {
    if (selectedCategory && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'filter_products', {
        category: selectedCategory
      });
    }
  }, [selectedCategory]);

  // Track search
  useEffect(() => {
    if (searchTerm && typeof window !== 'undefined' && window.gtag) {
      const gtag = window.gtag;
      const timeoutId = setTimeout(() => {
        gtag('event', 'search', {
          search_term: searchTerm
        });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  return (
    <>
      {/* SEO Metadata */}
      <Head>
        <title>Tous nos Produits - Grandson Project | Streetwear Premium</title>
        <meta name="description" content={`Découvrez notre collection complète de ${filteredProducts.length} produits streetwear premium. Style urbain, qualité exceptionnelle.`} />
        <meta name="keywords" content="streetwear, vêtements urbains, mode, Grandson Project, collection" />
        <meta property="og:title" content="Tous nos Produits - Grandson Project" />
        <meta property="og:description" content="Collection complète de streetwear premium" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://grandsonproject.com/products" />
      </Head>
      
      <Layout>
        {/* Hero Section - Modern Streetwear Style */}
        <div className="relative bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white overflow-hidden" role="banner">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-accent/5 to-transparent rounded-full animate-spin-slow"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-20">
          <div className="max-w-4xl">
            <div className="inline-block bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/50 px-6 py-3 rounded-full mb-6 backdrop-blur-sm animate-fade-in-up">
              <span className="text-accent font-bold uppercase text-sm tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
                Collection Complète
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-fade-in-up delay-200">
              <span className="bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                Tous Nos
              </span>
              <span className="block text-accent bg-gradient-to-r from-accent to-green-400 bg-clip-text text-transparent animate-pulse">
                Produits
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-300 mb-8 max-w-2xl leading-relaxed animate-fade-in-up delay-400">
              Découvrez notre collection streetwear complète. Style urbain, qualité premium.
            </p>
            
            <div className="flex items-center gap-4 animate-fade-in-up delay-600">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/20 to-green-500/20 px-6 py-2 rounded-full border border-accent/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-neutral-200 font-semibold">
                  {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} disponible{filteredProducts.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Enhanced Filters Section */}
        <div className="mb-12 space-y-8">
          {/* Search Bar - Modern Design with Accessibility */}
          <div className="relative max-w-2xl mx-auto">
            <label htmlFor="product-search" className="sr-only">Rechercher un produit</label>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
              <svg className="h-6 w-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="product-search"
              type="search"
              placeholder="Rechercher un produit, une catégorie..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-2 border-neutral-200 rounded-2xl text-lg font-medium placeholder-neutral-400 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all duration-300 shadow-lg hover:shadow-xl"
              aria-label="Rechercher des produits"
              autoComplete="off"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-accent transition-colors touch-target"
                aria-label="Effacer la recherche"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Filter - Enhanced */}
          <div className="text-center">
            <h3 className="text-2xl font-black text-neutral-900 mb-6">Filtrer par Catégorie</h3>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Sort Options & View Mode */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-neutral-50 to-white p-6 rounded-2xl border border-neutral-200 shadow-lg">
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="sort-select" className="text-neutral-700 font-bold">Trier par :</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white border-2 border-neutral-200 rounded-xl font-semibold text-neutral-700 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all cursor-pointer"
                aria-label="Trier les produits"
              >
                <option value="newest">Plus récents</option>
                <option value="name">Nom A-Z</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2 ml-4" role="group" aria-label="Mode d'affichage">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-accent text-black' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}
                  aria-label="Vue grille"
                  aria-pressed={viewMode === 'grid'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-accent text-black' : 'bg-white text-neutral-600 hover:bg-neutral-100'}`}
                  aria-label="Vue liste"
                  aria-pressed={viewMode === 'list'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="font-semibold">Affichage :</span>
              <span className="bg-accent text-black px-3 py-1 rounded-full font-bold" role="status" aria-live="polite">
                {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center" role="alert">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-2xl font-black text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Réessayer
            </button>
          </div>
        )}

        {/* Products Grid or Loading */}
        {!error && loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8" role="status" aria-label="Chargement des produits">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl mb-4"></div>
                <div className="h-5 bg-neutral-200 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-neutral-200 rounded-lg w-1/2 mb-2"></div>
                <div className="h-6 bg-neutral-200 rounded-lg w-2/3"></div>
              </div>
            ))}
            <span className="sr-only">Chargement des produits en cours...</span>
          </div>
        ) : !error && filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-200 shadow-lg">
            <div className="text-8xl mb-6 animate-bounce">🔍</div>
            <h3 className="text-3xl font-black text-neutral-900 mb-4">
              Aucun produit trouvé
            </h3>
            <p className="text-neutral-600 text-lg mb-8 max-w-md mx-auto">
              {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Aucun produit ne correspond à votre sélection'}. 
              Essayez une autre recherche ou catégorie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Voir tous les produits
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-3 bg-transparent hover:bg-neutral-100 text-neutral-700 px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 border-2 border-neutral-300 hover:border-accent"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </Link>
            </div>
          </div>
        ) : !error ? (
          <div role="region" aria-label="Liste des produits">
            {viewMode === 'grid' ? (
              <ProductGrid products={filteredProducts} />
            ) : (
              <ProductListView products={filteredProducts} />
            )}
          </div>
        ) : null}

        {/* Back to Top Button */}
        {!error && filteredProducts.length > 12 && (
          <div className="text-center mt-16">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-neutral-900 to-black hover:from-black hover:to-neutral-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              aria-label="Retourner en haut de la page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Retour en haut
            </button>
          </div>
        )}

        {/* Performance Metrics (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-neutral-100 rounded-lg text-xs text-neutral-600">
            <p>Products loaded: {products.length}</p>
            <p>Filtered: {filteredProducts.length}</p>
            <p>Categories: {categories.length}</p>
          </div>
        )}
      </div>
    </Layout>
    </>
  );
}