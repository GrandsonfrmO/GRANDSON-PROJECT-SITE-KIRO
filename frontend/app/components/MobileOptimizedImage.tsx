'use client';

import { useState, useRef, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'auto';
  lazy?: boolean;
  placeholder?: 'blur' | 'skeleton' | 'none';
  onLoad?: () => void;
  onError?: () => void;
}

export default function MobileOptimizedImage({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
  lazy = true,
  placeholder = 'skeleton',
  onLoad,
  onError
}: MobileOptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const isMobile = useIsMobile();

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    auto: ''
  };

  const getOptimizedSrc = (originalSrc: string) => {
    if (!isMobile) return originalSrc;
    
    // Add mobile-specific optimizations
    // This could be enhanced with a service like Cloudinary or similar
    return originalSrc;
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}
    >
      {/* Placeholder */}
      {!isLoaded && !hasError && placeholder !== 'none' && (
        <div className="absolute inset-0 flex items-center justify-center">
          {placeholder === 'skeleton' ? (
            <div className="w-full h-full bg-gradient-to-br from-neutral-200 via-neutral-300 to-neutral-200 loading-skeleton animate-pulse" />
          ) : (
            <div className="w-full h-full bg-neutral-200 blur-sm" />
          )}
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
          <div className="text-center text-neutral-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Image non disponible</p>
          </div>
        </div>
      )}

      {/* Actual image */}
      {isInView && (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}

      {/* Loading indicator */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}