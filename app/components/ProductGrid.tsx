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
    <div className="space-y-8">
      {/* Products Grid with Enhanced Layout */}
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 ${animationClass}`}>
        {visibleProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {!showAll && products.length > INITIAL_LOAD && (
        <div className="text-center pt-8">
          <button
            onClick={handleLoadMore}
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <span className="relative z-10">
              Voir {products.length - INITIAL_LOAD} produits de plus
            </span>
            <svg className="relative z-10 w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          
          <p className="text-neutral-500 text-sm mt-4">
            {INITIAL_LOAD} sur {products.length} produits affichés
          </p>
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
