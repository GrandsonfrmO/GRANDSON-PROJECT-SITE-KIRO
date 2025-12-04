import { useEffect } from 'react';
import { preloadImage, ImageSize } from '@/app/lib/imageOptimization';

/**
 * Hook to preload images for better performance
 * @param images - Array of image URLs to preload
 * @param size - Size variant to preload
 * @param enabled - Whether preloading is enabled
 */
export function useImagePreload(
  images: string[],
  size: ImageSize = 'detail',
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled || !images || images.length === 0) return;

    // Preload images in the background
    const preloadPromises = images.map(image => 
      preloadImage(image, size).catch(err => {
        // Silently fail - preloading is an optimization, not critical
        console.warn('Failed to preload image:', err);
      })
    );

    // Optional: Wait for all preloads to complete
    Promise.all(preloadPromises).then(() => {
      console.log(`Preloaded ${images.length} images`);
    });
  }, [images, size, enabled]);
}

/**
 * Hook to preload adjacent images in a gallery
 * @param images - All images in the gallery
 * @param currentIndex - Current selected image index
 * @param size - Size variant to preload
 * @param preloadCount - Number of adjacent images to preload (default: 2)
 */
export function useAdjacentImagePreload(
  images: string[],
  currentIndex: number,
  size: ImageSize = 'detail',
  preloadCount: number = 2
) {
  useEffect(() => {
    if (!images || images.length === 0) return;

    const imagesToPreload: string[] = [];

    // Preload previous images
    for (let i = 1; i <= preloadCount; i++) {
      const prevIndex = currentIndex - i;
      if (prevIndex >= 0) {
        imagesToPreload.push(images[prevIndex]);
      }
    }

    // Preload next images
    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < images.length) {
        imagesToPreload.push(images[nextIndex]);
      }
    }

    // Preload in the background
    imagesToPreload.forEach(image => {
      preloadImage(image, size).catch(err => {
        console.warn('Failed to preload adjacent image:', err);
      });
    });
  }, [images, currentIndex, size, preloadCount]);
}
