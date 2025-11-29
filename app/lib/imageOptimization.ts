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
    quality: 70,
    format: 'auto',
    crop: 'fill',
  },
  card: {
    width: 400,
    height: 400,
    quality: 80,
    format: 'auto',
    crop: 'fill',
  },
  detail: {
    width: 800,
    height: 800,
    quality: 85,
    format: 'auto',
    crop: 'fit',
  },
  gallery: {
    width: 200,
    height: 200,
    quality: 75,
    format: 'auto',
    crop: 'fill',
  },
  cart: {
    width: 120,
    height: 120,
    quality: 75,
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
  
  // Build transformation string
  const transforms = [
    `w_${transformation.width}`,
    transformation.height ? `h_${transformation.height}` : null,
    `q_${transformation.quality}`,
    `f_${transformation.format}`,
    transformation.crop ? `c_${transformation.crop}` : null,
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

  // If it's a full URL (Cloudinary)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return optimizeCloudinaryUrl(imagePath, size);
  }

  // If it's a local path starting with /uploads/products/, serve directly from frontend
  if (imagePath.startsWith('/uploads/products/')) {
    console.log('Serving product image directly from frontend:', imagePath);
    return imagePath;
  }

  // If it starts with uploads/products/ (missing slash), add the slash
  if (imagePath.startsWith('uploads/products/')) {
    console.log('Serving product image directly from frontend (added slash):', `/${imagePath}`);
    return `/${imagePath}`;
  }

  // For backend images (old format like /uploads/images-timestamp.png), use backend API
  if (imagePath.startsWith('/uploads/') || imagePath.startsWith('uploads/')) {
    const apiUrl = getApiUrl();
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const fullImageUrl = `${apiUrl}${cleanPath}`;
    console.log('Serving image via backend API:', { imagePath, fullImageUrl });
    return fullImageUrl;
  }

  // For other paths, use the backend API
  const apiUrl = getApiUrl();
  let fullImageUrl: string;

  if (imagePath.startsWith('/')) {
    // Other absolute path
    fullImageUrl = `${apiUrl}${imagePath}`;
  } else {
    // Assume it's a filename in uploads directory
    fullImageUrl = `${apiUrl}/uploads/${imagePath}`;
  }

  console.log('Image URL generated via backend (fallback):', { imagePath, fullImageUrl });

  return fullImageUrl;
}
