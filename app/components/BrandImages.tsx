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
  const [selectedImage, setSelectedImage] = useState<BrandImageData | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setBrandImages(images);
    }
  }, [images]);

  const handleImageError = (imageId: number) => {
    console.error(`Failed to load brand image: ${imageId}`);
    setImageErrors(prev => new Set(prev).add(imageId));
  };

  // Check for reduced motion preference - use state to avoid hydration mismatch
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  const animationClass = prefersReducedMotion ? '' : 'animate-rotate-logo';

  // Don't render anything if no images are available
  if (brandImages.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`flex justify-center items-center gap-6 md:gap-8 ${className}`}>
        {brandImages.map((image) => {
          const hasError = imageErrors.has(image.id);
          
          if (hasError) {
            return null; // Hide images that failed to load
          }

          return (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
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
                cursor-pointer
                ${isMobile ? 'active:scale-95 hover:border-accent/50' : 'hover:border-accent/50 hover:scale-105'}
              `}
              style={{ perspective: '1000px' }}
              aria-label={`Voir ${image.alt} en grand`}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Zoom indicator */}
              <div className="absolute top-2 right-2 z-20 bg-black/50 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
              
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
            </button>
          );
        })}
      </div>

      {/* Modal plein écran avec image qui tourne */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black animate-fade-in"
          onClick={() => setSelectedImage(null)}
          style={{ margin: 0, padding: 0 }}
        >
          {/* Bouton fermer - discret */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 z-[10000] bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
            aria-label="Fermer"
          >
            <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image qui tourne en 3D comme le logo */}
          <div
            className="relative w-[80vmin] h-[80vmin]"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            <div
              className="relative w-full h-full animate-rotate-logo"
              style={{ 
                transformStyle: 'preserve-3d',
                willChange: 'transform'
              }}
            >
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-contain drop-shadow-[0_0_80px_rgba(0,255,136,0.6)]"
                sizes="80vmin"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
