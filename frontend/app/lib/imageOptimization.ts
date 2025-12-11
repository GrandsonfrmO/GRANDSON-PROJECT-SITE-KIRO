/**
 * Utility functions for optimizing Cloudinary image URLs
 */

export type ImageSize = 'thumbnail' | 'card' | 'detail' | 'gallery' | 'cart' | 'logo';

interface ImageTransformation {
  width: number;
  height?: number;
  quality: number;
  format: 'auto';
  crop?: 'fill' | 'fit' | 'scale';
}

const IMAGE_TRANSFORMATIONS: Record<ImageSize, ImageTransformation> = {
  thumbnail: {
    width: 100,
    height: 100,
    quality: 60,
    format: 'auto',
    crop: 'fill',
  },
  card: {
    width: 400,
    height: 400,
    quality: 75,
    format: 'auto',
    crop: 'fill',
  },
  detail: {
    width: 1200,
    height: 1200,
    quality: 85,
    format: 'auto',
    crop: 'fit',
  },
  gallery: {
    width: 150,
    height: 150,
    quality: 70,
    format: 'auto',
    crop: 'fill',
  },
  cart: {
    width: 80,
    height: 80,
    quality: 70,
    format: 'auto',
    crop: 'fill',
  },
  logo: {
    width: 200,
    height: 60,
    quality: 90,
    format: 'auto',
    crop: 'fit',
  },
};

/**
 * Optimize a Cloudinary image URL with transformations
 */
export function optimizeCloudinaryUrl(url: string, size: ImageSize = 'card'): string {
  // If not a Cloudinary URL, return as-is
  if (!url.includes('cloudinary.com')) {
    return url;
  }

  const transformation = IMAGE_TRANSFORMATIONS[size];
  
  // Build transformation string with additional optimizations
  const transforms = [
    `w_${transformation.width}`,
    transformation.height ? `h_${transformation.height}` : null,
    `q_${transformation.quality}`,
    `f_${transformation.format}`,
    transformation.crop ? `c_${transformation.crop}` : null,
    'dpr_auto', // Automatic DPR (Device Pixel Ratio) for retina displays
    'fl_progressive', // Progressive loading for better perceived performance
  ].filter(Boolean).join(',');

  // Insert transformations into Cloudinary URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;

  const beforeUpload = url.substring(0, uploadIndex + 8); // Include '/upload/'
  const afterUpload = url.substring(uploadIndex + 8);

  return `${beforeUpload}${transforms}/${afterUpload}`;
}

/**
 * Get API URL dynamically
 */
function getApiUrl(): string {
  // If explicitly set in environment, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, detect the current host
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // Production detection - use backend URL
    if (hostname.includes('vercel.app') || hostname.includes('grandsonproject')) {
      return 'https://grandson-backend.onrender.com';
    }
    
    // If accessing via network IP, use the same IP for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3001`;
    }
  }
  
  // Default to localhost
  return 'http://localhost:3001';
}

/**
 * Get image URL with proper handling for both Cloudinary and local paths
 */
export function getImageUrl(imagePath: string, size: ImageSize = 'card'): string {
  if (!imagePath) return '/placeholder-product.svg';

  // If it's a placeholder or static asset, return as-is
  if (imagePath.startsWith('/placeholder-') || imagePath.endsWith('.svg')) {
    return imagePath;
  }

  // If it's already a full URL (Cloudinary, Supabase storage, or any https URL)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Optimize Cloudinary URLs
    if (imagePath.includes('cloudinary.com')) {
      return optimizeCloudinaryUrl(imagePath, size);
    }
    // Return Supabase URLs as-is (they're already optimized)
    if (imagePath.includes('supabase.co')) {
      return imagePath;
    }
    // Return other URLs as-is
    return imagePath;
  }

  // If it's a local path starting with /uploads/products/, serve directly from frontend
  if (imagePath.startsWith('/uploads/products/')) {
    return imagePath;
  }

  // If it starts with uploads/products/ (missing slash), add the slash
  if (imagePath.startsWith('uploads/products/')) {
    return `/${imagePath}`;
  }

  // For backend images (old format like /uploads/images-timestamp.png), use backend API
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
    const apiUrl = getApiUrl();
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${apiUrl}${cleanPath}`;
  }

  // For other paths, use the backend API
  const apiUrl = getApiUrl();

  if (imagePath.startsWith('/')) {
    // Other absolute path
    return `${apiUrl}${imagePath}`;
  } else {
    // Assume it's a filename in uploads directory
    return `${apiUrl}/uploads/${imagePath}`;
  }
}

/**
 * Preload images for better performance
 * Useful for preloading adjacent images in galleries
 */
export function preloadImages(imagePaths: string[], size: ImageSize = 'detail'): void {
  if (typeof window === 'undefined') return;

  imagePaths.forEach(imagePath => {
    if (!imagePath) return;
    
    const optimizedUrl = getImageUrl(imagePath, size);
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedUrl;
    document.head.appendChild(link);
  });
}

/**
 * Preload a single image
 */
export function preloadImage(imagePath: string, size: ImageSize = 'detail'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!imagePath) {
      resolve();
      return;
    }

    const img = new Image();
    const optimizedUrl = getImageUrl(imagePath, size);
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${optimizedUrl}`));
    img.src = optimizedUrl;
  });
}

/**
 * Generate responsive srcset for Cloudinary images
 * Useful for serving different image sizes based on viewport
 */
export function generateResponsiveSrcSet(imagePath: string, sizes: ImageSize[]): string {
  if (!imagePath || !imagePath.includes('cloudinary.com')) {
    return '';
  }

  return sizes
    .map(size => {
      const transformation = IMAGE_TRANSFORMATIONS[size];
      const url = getImageUrl(imagePath, size);
      return `${url} ${transformation.width}w`;
    })
    .join(', ');
}

/**
 * Get optimal image size based on viewport width
 */
export function getOptimalImageSize(viewportWidth: number): ImageSize {
  if (viewportWidth < 640) return 'thumbnail'; // Mobile
  if (viewportWidth < 1024) return 'card'; // Tablet
  return 'detail'; // Desktop
}
