import { useState, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

  const INITIAL_LOAD = 8;

  useEffect(() => {
    // Reset animation and show initial products
    setAnimationClass('animate-fade-in-up');
    if (products.length <= INITIAL_LOAD || showAll) {
      setVisibleProducts(products);
    } else {
      setVisibleProducts(products.slice(0, INITIAL_LOAD));
    }
    
    // Remove animation class after animation completes
    const timer = setTimeout(() => setAnimationClass(''), 600);
    return () => clearTimeout(timer);
  }, [products, showAll]);

  const handleLoadMore = () => {
    setShowAll(true);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-neutral-50 to-white rounded-3xl border border-neutral-200">
        <div className="text-6xl mb-4 animate-bounce">📦</div>
        <p className="text-neutral-500 text-xl font-semibold">
          Aucun produit disponible pour le moment.
        </p>
        <p className="text-neutral-400 text-sm mt-2">
          Revenez bientôt pour découvrir nos nouveautés !
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Products Grid with Premium Layout */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 lg:gap-10 ${animationClass}`}>
        {visibleProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in-up transform transition-all duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Enhanced Load More Button */}
      {!showAll && products.length > INITIAL_LOAD && (
        <div className="text-center pt-12">
          <button
            onClick={handleLoadMore}
            className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-accent via-green-500 to-accent hover:from-green-500 hover:via-accent hover:to-green-500 text-black px-12 py-5 rounded-3xl font-black uppercase tracking-wider transition-all duration-500 shadow-2xl hover:shadow-accent/50 hover:scale-110 active:scale-95 overflow-hidden border-2 border-accent/30"
          >
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
            
            <svg className="relative z-10 w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            
            <span className="relative z-10 text-lg">
              Charger {products.length - INITIAL_LOAD} produits de plus
            </span>
            
            <svg className="relative z-10 w-6 h-6 group-hover:translate-y-2 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          
          <div className="mt-6 inline-flex items-center gap-2 bg-neutral-100 px-6 py-3 rounded-full">
            <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-neutral-600 font-bold text-sm">
              {INITIAL_LOAD} sur {products.length} produits affichés
            </span>
          </div>
        </div>
      )}

      {/* Grid Statistics */}
      {showAll && products.length > INITIAL_LOAD && (
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-semibold text-sm">
              Tous les {products.length} produits affichés
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
