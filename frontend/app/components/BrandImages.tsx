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
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setBrandImages(images);
    }
  }, [images]);

  const handleImageError = (imageId: number) => {
    console.error(`Failed to load brand image: ${imageId}`);
    setImageErrors(prev => new Set(prev).add(imageId));
  };

  const handleImageClick = (imageId: number) => {
    setSelectedImageId(imageId);
  };

  const closeModal = () => {
    setSelectedImageId(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Ne rien faire - le modal ne se ferme que via le bouton X
  };

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const animationClass = prefersReducedMotion ? '' : 'animate-rotate-logo';

  // Don't render anything if no images are available
  if (brandImages.length === 0) {
    console.warn('BrandImages: No images provided');
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
            onClick={() => handleImageClick(image.id)}
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

      {/* Modal Gallery */}
      {selectedImageId !== null && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-[100001]"
              aria-label="Fermer la galerie"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image container */}
            <div className="relative w-full h-[60vh] flex items-center justify-center bg-gradient-to-b from-white/5 to-transparent rounded-2xl border border-white/10 overflow-hidden">
              {brandImages.length === 0 ? (
                <div className="text-center text-white/50">
                  <p>Aucune image disponible</p>
                </div>
              ) : (
                brandImages.map((img) => {
                  const isSelected = img.id === selectedImageId;
                  const hasError = imageErrors.has(img.id);
                  
                  return (
                    <div
                      key={img.id}
                      className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                        isSelected ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      {hasError ? (
                        <div className="text-center text-white/50">
                          <p>Erreur de chargement</p>
                          <p className="text-xs mt-2">{img.src}</p>
                        </div>
                      ) : (
                        <div className={`relative w-full h-full flex items-center justify-center p-8 ${animationClass}`}>
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            className="object-contain"
                            priority={isSelected}
                            onError={() => {
                              console.error(`Failed to load image: ${img.src}`);
                              handleImageError(img.id);
                            }}
                            sizes="(max-width: 768px) 100vw, 90vw"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Image info */}
            <div className="mt-4 text-center">
              <p className="text-white/70 text-sm">
                {brandImages.find(img => img.id === selectedImageId)?.alt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
