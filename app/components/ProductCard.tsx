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
      <div className={`bg-white dark:bg-neutral-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-neutral-200 dark:border-neutral-700 hover:border-accent group-hover:shadow-accent/30 relative will-change-transform ${
        isMobile ? 'active:scale-95' : 'hover:-translate-y-3 hover:scale-[1.02]'
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

        {/* Enhanced Product Info - Premium Design */}
        <div className="p-5 bg-gradient-to-br from-white to-neutral-50">
          <h3 className="font-black text-neutral-900 dark:text-white mb-3 line-clamp-2 text-base leading-tight group-hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>
          
          {/* Category Badge */}
          <div className="mb-3">
            <span className="inline-block bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              {product.category}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <p className="text-accent font-black text-xl">
                  {product.price.toLocaleString()}
                </p>
                <p className="text-neutral-500 text-sm font-bold">GNF</p>
              </div>
              {product.stock > 0 && product.stock < 5 && (
                <p className="text-xs text-red-600 font-bold mt-1">
                  Plus que {product.stock} en stock!
                </p>
              )}
            </div>
            
            {product.stock > 0 && (
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-2 rounded-xl text-xs font-black shadow-lg flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Dispo
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
