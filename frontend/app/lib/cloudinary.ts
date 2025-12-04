/**
 * Cloudinary Configuration and Upload Utilities
 * Handles image uploads to Cloudinary cloud storage
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Note: Configuration is done server-side only for security
export function configureCloudinary() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || 
      !process.env.CLOUDINARY_API_KEY || 
      !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });

  return cloudinary;
}

// Upload options for product images
export const productUploadOptions = {
  folder: 'grandson-project/products',
  resource_type: 'image' as const,
  transformation: [
    {
      quality: 'auto',
      fetch_format: 'auto'
    }
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
};

// Upload options for brand images
export const brandUploadOptions = {
  folder: 'grandson-project/brand',
  resource_type: 'image' as const,
  transformation: [
    {
      quality: 'auto',
      fetch_format: 'auto'
    }
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg']
};

// Upload options for customization gallery
export const customizationUploadOptions = {
  folder: 'grandson-project/customization',
  resource_type: 'image' as const,
  transformation: [
    {
      quality: 'auto',
      fetch_format: 'auto'
    }
  ],
  allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
};

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload an image to Cloudinary
 * @param file - File buffer or base64 string
 * @param options - Upload options (folder, transformations, etc.)
 * @returns Upload result with URL and metadata
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: typeof productUploadOptions = productUploadOptions
): Promise<CloudinaryUploadResult> {
  try {
    const cloudinaryInstance = configureCloudinary();
    
    // Convert buffer to base64 if needed
    const fileData = Buffer.isBuffer(file) 
      ? `data:image/jpeg;base64,${file.toString('base64')}`
      : file;

    // Upload to Cloudinary
    const result = await cloudinaryInstance.uploader.upload(fileData, options);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete an image from Cloudinary
 * @param publicId - The public ID of the image to delete
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const cloudinaryInstance = configureCloudinary();
    await cloudinaryInstance.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image from Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get optimized image URL with transformations
 * @param publicId - The public ID of the image
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (auto, best, good, eco, low)
 */
export function getOptimizedImageUrl(
  publicId: string,
  width?: number,
  height?: number,
  quality: 'auto' | 'best' | 'good' | 'eco' | 'low' = 'auto'
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    console.warn('Cloudinary cloud name not configured, returning original URL');
    return publicId;
  }

  const transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  transformations.push(`q_${quality}`);
  transformations.push('f_auto');
  
  const transformString = transformations.join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformString}/${publicId}`;
}
