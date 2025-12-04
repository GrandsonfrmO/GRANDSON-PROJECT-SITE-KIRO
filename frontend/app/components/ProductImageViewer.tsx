'use client';

import { useState, useRef, useEffect } from 'react';
import OptimizedImage from './OptimizedImage';
import { useAdjacentImagePreload } from '@/app/hooks/useImagePreload';

interface ProductImageViewerProps {
  images: string[];
  productName: string;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  getImageUrl: (image: string, size: string) => string;
}

export default function ProductImageViewer({
  images,
  productName,
  selectedIndex,
  onIndexChange,
  getImageUrl
}: ProductImageViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Use the preload hook for adjacent images
  useAdjacentImagePreload(images, selectedIndex, 'detail', 2);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isFullscreen) {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        onIndexChange(selectedIndex - 1);
      } else if (e.key === 'ArrowRight' && selectedIndex < images.length - 1) {
        onIndexChange(selectedIndex + 1);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedIndex, images.length]);

  const currentImage = images[selectedIndex];

  return (
    <>
      <div className="space-y-6">
        {/* Main Image */}
        <div className="relative group">
          <div 
            ref={imageRef}
            className="relative aspect-square overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl shadow-2xl transition-all duration-500 cursor-pointer hover:scale-102"
            onClick={() => setIsFullscreen(true)}
            style={{ perspective: '1000px' }}
          >
            <div 
              className="relative w-full h-full transition-transform duration-700 hover:animate-rotate-logo"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <OptimizedImage
                src={currentImage}
                alt={productName}
                size="detail"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={95}
              />
            </div>
            
            {/* Zoom Indicator */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsFullscreen(true);
              }}
              className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedIndex > 0) onIndexChange(selectedIndex - 1);
                  }}
                  disabled={selectedIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 disabled:opacity-30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedIndex < images.length - 1) onIndexChange(selectedIndex + 1);
                  }}
                  disabled={selectedIndex === images.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70 disabled:opacity-30"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onIndexChange(index)}
                className={`group relative aspect-square overflow-hidden bg-neutral-100 rounded-2xl border-3 transition-all duration-300 hover:scale-105 ${
                  selectedIndex === index
                    ? 'border-accent shadow-lg shadow-accent/25'
                    : 'border-transparent hover:border-neutral-300'
                }`}
              >
                <OptimizedImage
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  size="gallery"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  sizes="(max-width: 768px) 25vw, 12vw"
                  loading="lazy"
                  quality={80}
                />
                {selectedIndex === index && (
                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                    <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Image Counter */}
        <div className="text-center">
          <span className="inline-block bg-neutral-100 px-4 py-2 rounded-full text-sm font-semibold text-neutral-600">
            {selectedIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 z-10 bg-white/10 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main Image with 3D Animation */}
          <div 
            className="relative flex items-center justify-center"
            style={{ 
              perspective: '1000px',
              width: '80vmin',
              height: '80vmin'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="relative w-full h-full animate-rotate-logo"
              style={{
                transformStyle: 'preserve-3d',
                filter: 'drop-shadow(0 0 40px rgba(34, 197, 94, 0.6))'
              }}
            >
              <OptimizedImage
                src={currentImage}
                alt={productName}
                size="detail"
                fill
                className="object-contain"
                quality={100}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}