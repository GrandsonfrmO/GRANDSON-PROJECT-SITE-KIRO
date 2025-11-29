'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getImageUrl, ImageSize } from '@/app/lib/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: ImageSize;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  size = 'card',
  fill = false,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  loading = 'lazy',
  quality = 85,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    console.error('Image failed to load:', src);
    console.error('Optimized URL was:', getImageUrl(src, size));
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  // If there's an error, show placeholder
  if (imageError || !src) {
    return (
      <div className={`bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center ${className}`}>
        <svg 
          className="w-8 h-8 text-neutral-400" 
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
    );
  }

  const optimizedSrc = getImageUrl(src, size);

  // Common props for both fill and fixed size images
  const commonProps = {
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    onError: handleImageError,
    onLoad: handleImageLoad,
    quality,
    priority,
    // Only include loading prop when priority is false
    ...(priority ? {} : { loading }),
  };

  if (fill) {
    return (
      <>
        {isLoading && (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse" />
        )}
        <Image
          {...commonProps}
          src={optimizedSrc}
          fill
          sizes={sizes}
        />
      </>
    );
  }

  return (
    <>
      {isLoading && width && height && (
        <div 
          className="bg-gradient-to-br from-neutral-200 to-neutral-300 animate-pulse"
          style={{ width, height }}
        />
      )}
      <Image
        {...commonProps}
        src={optimizedSrc}
        width={width || 400}
        height={height || 400}
        sizes={sizes}
      />
    </>
  );
}