'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import api from '../lib/api';
import { transformProducts } from '../lib/dataTransform';
import Layout from '../components/Layout';
import ProductGrid from '../components/ProductGrid';
import CategoryFilter from '../components/CategoryFilter';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        const data = await response.json();
        const productsList = data.data?.products || data.products || [];
        const transformedProducts = transformProducts(productsList);
        const activeProducts = transformedProducts.filter((p: Product) => p.isActive);
        
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(activeProducts.map((p: Product) => p.category))
        ) as string[];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter and sort products
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
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
    
    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products, sortBy]);

  return (
    <Layout>
      {/* Hero Section - Enhanced Modern Design */}
      <div className="relative bg-gradient-to-br from-black via-neutral-900 to-neutral-800 text-white overflow-hidden">
        {/* Enhanced Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-accent/10 to-transparent rounded-full animate-spin-slow"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-5xl mx-auto text-center">
            {/* Enhanced Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent/30 to-green-500/20 border-2 border-accent/50 px-8 py-3 rounded-full mb-8 backdrop-blur-md animate-fade-in-up shadow-lg shadow-accent/20">
              <span className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-lg shadow-accent/50"></span>
              <span className="text-accent font-black uppercase text-sm tracking-widest">
                Collection Complète 2024
              </span>
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
            </div>
            
            {/* Enhanced Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight animate-fade-in-up delay-200">
              <span className="block bg-gradient-to-r from-white via-neutral-100 to-neutral-300 bg-clip-text text-transparent drop-shadow-2xl">
                Découvrez
              </span>
              <span className="block mt-2 bg-gradient-to-r from-accent via-green-400 to-accent bg-clip-text text-transparent animate-pulse drop-shadow-2xl">
                Nos Produits
              </span>
            </h1>
            
            {/* Enhanced Description */}
            <p className="text-xl md:text-2xl lg:text-3xl text-neutral-300 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up delay-400 font-light">
              Style urbain authentique, qualité premium garantie. 
              <span className="block mt-2 text-accent font-semibold">Livraison rapide partout en Guinée 🇬🇳</span>
            </p>
            
            {/* Enhanced Stats */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 animate-fade-in-up delay-600">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-accent/30 to-green-500/30 px-8 py-4 rounded-2xl border-2 border-accent/30 backdrop-blur-md shadow-xl">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                <span className="text-white font-black text-lg">
                  {filteredProducts.length} Produit{filteredProducts.length > 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="inline-flex items-center gap-3 bg-white/10 px-8 py-4 rounded-2xl border-2 border-white/20 backdrop-blur-md shadow-xl">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-white font-black text-lg">
                  Livraison Gratuite
                </span>
              </div>
              
              <div className="inline-flex items-center gap-3 bg-white/10 px-8 py-4 rounded-2xl border-2 border-white/20 backdrop-blur-md shadow-xl">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-black text-lg">
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-12 md:h-16 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Enhanced Filters Section with Better Visual Hierarchy */}
        <div className="mb-16 space-y-10">
          {/* Search Bar - Premium Design */}
          <div className="relative max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg className="h-7 w-7 text-neutral-400 group-focus-within:text-accent transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Rechercher un produit, une catégorie, une marque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-16 py-5 bg-white border-3 border-neutral-200 rounded-3xl text-lg font-semibold placeholder-neutral-400 focus:border-accent focus:ring-6 focus:ring-accent/20 transition-all duration-300 shadow-xl hover:shadow-2xl focus:shadow-2xl"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-6 flex items-center text-neutral-400 hover:text-red-500 transition-all duration-300 hover:scale-110"
                >
                  <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              {/* Search suggestions count */}
              {searchTerm && (
                <div className="absolute -bottom-8 left-6 text-sm text-neutral-500 font-medium">
                  {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* Category Filter - Premium Enhanced */}
          <div className="text-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 p-8 md:p-10 rounded-3xl border-2 border-neutral-200 shadow-xl">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full"></div>
              <h3 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
                Catégories
              </h3>
              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full"></div>
            </div>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Sort & Filter Options - Enhanced Layout */}
          <div className="bg-gradient-to-r from-white via-neutral-50 to-white p-6 md:p-8 rounded-3xl border-2 border-neutral-200 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex items-center gap-2 text-neutral-700">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                  <span className="font-black text-lg">Trier par :</span>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="flex-1 lg:flex-none px-6 py-3 bg-white border-2 border-neutral-300 rounded-2xl font-bold text-neutral-700 focus:border-accent focus:ring-4 focus:ring-accent/20 transition-all shadow-md hover:shadow-lg cursor-pointer"
                >
                  <option value="newest">⭐ Plus récents</option>
                  <option value="name">🔤 Nom A-Z</option>
                  <option value="price-asc">💰 Prix croissant</option>
                  <option value="price-desc">💎 Prix décroissant</option>
                </select>
              </div>
              
              {/* Results Counter */}
              <div className="flex items-center gap-4 bg-gradient-to-r from-accent/20 to-green-500/20 px-6 py-3 rounded-2xl border-2 border-accent/30">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div className="text-center">
                  <div className="text-2xl font-black text-neutral-900">
                    {filteredProducts.length}
                  </div>
                  <div className="text-xs font-bold text-neutral-600 uppercase tracking-wide">
                    Produit{filteredProducts.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid or Loading */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-2xl mb-4"></div>
                <div className="h-5 bg-neutral-200 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-neutral-200 rounded-lg w-1/2 mb-2"></div>
                <div className="h-6 bg-neutral-200 rounded-lg w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-gradient-to-br from-neutral-50 via-white to-neutral-50 rounded-3xl border-3 border-neutral-200 shadow-2xl">
            <div className="text-9xl mb-8 animate-bounce">🔍</div>
            <h3 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6 bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text text-transparent">
              Aucun produit trouvé
            </h3>
            <p className="text-neutral-600 text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
              {searchTerm ? (
                <>
                  Aucun résultat pour <span className="font-black text-accent">"{searchTerm}"</span>
                </>
              ) : (
                'Aucun produit ne correspond à votre sélection'
              )}
            </p>
            <p className="text-neutral-500 text-base mb-10 max-w-xl mx-auto">
              Essayez une autre recherche, changez de catégorie ou explorez toute notre collection.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-accent via-green-500 to-accent hover:from-green-500 hover:via-accent hover:to-green-500 text-black px-10 py-5 rounded-2xl font-black uppercase tracking-wider transition-all duration-500 shadow-2xl hover:shadow-accent/50 hover:scale-110 active:scale-95 border-2 border-accent/30"
              >
                <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-lg">Réinitialiser les filtres</span>
              </button>
              
              <Link
                href="/"
                className="group inline-flex items-center gap-3 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-accent px-10 py-5 rounded-2xl font-black uppercase tracking-wider transition-all duration-300 border-3 border-neutral-300 hover:border-accent shadow-xl hover:shadow-2xl hover:scale-105"
              >
                <svg className="w-6 h-6 group-hover:-translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-lg">Retour à l'accueil</span>
              </Link>
            </div>
            
            {/* Suggestions */}
            <div className="mt-12 pt-8 border-t-2 border-neutral-200">
              <p className="text-neutral-600 font-bold mb-4">💡 Suggestions :</p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-full text-sm font-semibold">Vérifiez l'orthographe</span>
                <span className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-full text-sm font-semibold">Utilisez des mots-clés plus généraux</span>
                <span className="bg-neutral-100 text-neutral-700 px-4 py-2 rounded-full text-sm font-semibold">Essayez une autre catégorie</span>
              </div>
            </div>
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}

        {/* Enhanced Back to Top Button */}
        {filteredProducts.length > 12 && (
          <div className="text-center mt-20">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent rounded-full"></div>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group inline-flex items-center gap-4 bg-gradient-to-r from-neutral-900 via-black to-neutral-900 hover:from-accent hover:via-green-500 hover:to-accent text-white hover:text-black px-12 py-5 rounded-3xl font-black uppercase tracking-wider transition-all duration-500 shadow-2xl hover:shadow-accent/50 hover:scale-110 active:scale-95 border-2 border-neutral-700 hover:border-accent"
              >
                <svg className="w-6 h-6 group-hover:-translate-y-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span className="text-lg">Retour en haut</span>
                <svg className="w-6 h-6 group-hover:-translate-y-2 transition-transform duration-500 delay-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              <div className="w-20 h-1 bg-gradient-to-r from-transparent via-neutral-300 to-transparent rounded-full"></div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}