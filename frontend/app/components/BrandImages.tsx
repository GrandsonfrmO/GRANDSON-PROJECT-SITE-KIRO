'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useIsMobile } from '../hooks/useIsMobile';

interface BrandImageData {
  id: number;
  src: string;
  alt: string;
  priority?: boolean;
}

interface BrandImagesProps {
  className?: string;
  images?: BrandImageData[];
}

// Default brand images - empty by default, add images to /public/images/brand/
const defaultBrandImages: BrandImageData[] = [];

export default function BrandImages({ className = '', images }: BrandImagesProps) {
  const isMobile = useIsMobile();
  const [brandImages, setBrandImages] = useState<BrandImageData[]>(defaultBrandImages);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (images && images.length > 0) {
      setBrandImages(images);
    }
  }, [images]);

  const handleImageError = (imageId: number) => {
    console.error(`Failed to load brand image: ${imageId}`);
    setImageErrors(prev => new Set(prev).add(imageId));
  };

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const animationClass = prefersReducedMotion ? '' : 'animate-rotate-logo';

  // Don't render anything if no images are available
  if (brandImages.length === 0) {
    return null;
  }

  return (
    <div 
      className={`flex justify-center items-center gap-6 md:gap-8 relative ${className}`}
      style={{ zIndex: 99999, position: 'relative' }}
    >
      {brandImages.map((image) => {
        const hasError = imageErrors.has(image.id);
        
        if (hasError) {
          return null; // Hide images that failed to load
        }

        return (
          <div
            key={image.id}
            className={`
              relative
              aspect-square
              ${isMobile ? 'w-24 p-3' : 'w-40 p-6'}
              bg-white/5
              backdrop-blur-xl
              rounded-3xl
              border-2 border-white/10
              shadow-2xl
              transition-all duration-300
              group
              overflow-hidden
              ${isMobile ? 'active:scale-95 hover:border-accent/50' : 'hover:border-accent/50 hover:scale-105'}
            `}
            style={{ 
              perspective: '1000px',
              zIndex: 99999,
              position: 'relative'
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Image container with 3D rotation */}
            <div 
              className={`relative w-full h-full z-10 ${animationClass}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className={`object-contain drop-shadow-2xl transition-all duration-300 ${
                  isMobile ? '' : 'group-hover:drop-shadow-[0_0_40px_rgba(34,197,94,0.6)]'
                }`}
                priority={image.priority}
                onError={() => handleImageError(image.id)}
                sizes={isMobile ? '96px' : '160px'}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
