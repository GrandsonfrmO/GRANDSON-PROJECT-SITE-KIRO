import Link from 'next/link';
import { useState } from 'react';
import { Product } from '../types';
import { useIsMobile } from '../hooks/useIsMobile';
import { getImageUrl } from '../lib/imageOptimization';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const isMobile = useIsMobile();

  // Safely get the first image with proper URL handling
  const images = Array.isArray(product.images) ? product.images : [];
  const rawImage = images.length > 0 ? images[0] : null;
  const firstImage = rawImage ? getImageUrl(rawImage, 'card') : null;

  return (
    <Link href={`/products/${product.id}`} className="touch-target group block">
      <div className={`bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden shadow-mobile hover:shadow-mobile-lg transition-all duration-300 border-2 border-neutral-200 dark:border-neutral-700 hover:border-accent group-hover:shadow-accent/20 relative will-change-transform ${
        isMobile ? 'active:scale-95' : 'hover:-translate-y-2 hover:scale-105'
      }`}>
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200">
          {firstImage && !imageError ? (
            <>
              {/* Loading skeleton */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-200 loading-skeleton"></div>
              )}
              
              <img 
                src={product.images[0]} 
                alt={product.name}
                className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
              <svg 
                className="w-16 h-16 text-neutral-400 group-hover:scale-110 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
            </div>
          )}
          
          {/* Enhanced Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Stock Badge - Enhanced */}
          {product.stock < 5 && product.stock > 0 && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-pulse border border-red-500">
              🔥 Stock limité ({product.stock})
            </div>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
              <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-black px-6 py-3 rounded-xl shadow-2xl border border-red-500">
                Rupture de stock
              </span>
            </div>
          )}

          {/* New Badge for recent products */}
          {product.isNew && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-accent to-green-500 text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg animate-bounce">
              ✨ Nouveau
            </div>
          )}

          {/* Enhanced Quick View Hint */}
          {product.stock > 0 && (
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              <div className="bg-white/95 backdrop-blur-sm text-black text-center py-3 rounded-xl font-bold text-sm shadow-xl border border-white/50 hover:bg-accent hover:text-black transition-colors duration-300">
                <span className="flex items-center justify-center gap-2">
                  Voir les détails
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          )}

          {/* Wishlist Button */}
          <button 
            className="absolute top-3 right-3 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Add to wishlist logic here
            }}
          >
            <svg className="w-5 h-5 text-neutral-600 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Enhanced Product Info - Mobile Optimized */}
        <div className="p-1.5">
          <h3 className="font-bold text-neutral-900 dark:text-white mb-1 line-clamp-1 text-xs leading-tight">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <p className="text-accent font-black text-sm">
                {product.price.toLocaleString()}
              </p>
              <p className="text-neutral-400 text-xs">GNF</p>
            </div>
            
            {product.stock > 0 && (
              <div className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
