import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, productUploadOptions, brandUploadOptions, customizationUploadOptions } from '@/app/lib/cloudinary';
import { validateImageFile } from '@/app/lib/validation';

/**
 * Upload image to Cloudinary
 * POST /api/upload
 * 
 * Accepts multipart/form-data with:
 * - file or image: The image file to upload
 * - folder: Optional folder type (products, brand, customization)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    // Accept 'file' or 'image' as field name
    const file = (formData.get('file') || formData.get('image')) as File;
    const folderType = (formData.get('folder') as string) || 'products';

    // Validate file exists
    if (!file) {
      console.error('[Upload] No file provided');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'NO_FILE',
            message: 'No file provided. Please select an image to upload.' 
          } 
        },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      const errorMessage = Object.values(validation.errors || {}).join(', ');
      console.error('[Upload] File validation failed:', errorMessage);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_FILE',
            message: errorMessage 
          } 
        },
        { status: 400 }
      );
    }

    console.log(`[Upload] Starting upload for file: ${file.name}, size: ${(file.size / 1024).toFixed(2)}KB, type: ${file.type}`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Select upload options based on folder type
    let uploadOptions = productUploadOptions;
    if (folderType === 'brand') {
      uploadOptions = brandUploadOptions;
    } else if (folderType === 'customization') {
      uploadOptions = customizationUploadOptions;
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, uploadOptions);
    
    const uploadTime = Date.now() - startTime;
    console.log(`[Upload] Successfully uploaded to Cloudinary in ${uploadTime}ms:`, {
      url: result.url,
      publicId: result.publicId,
      size: `${(result.bytes / 1024).toFixed(2)}KB`,
      dimensions: `${result.width}x${result.height}`,
      format: result.format
    });

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });

  } catch (error) {
    const uploadTime = Date.now() - startTime;
    console.error(`[Upload] Error after ${uploadTime}ms:`, error);
    
    // Determine error type and message
    let errorCode = 'UPLOAD_FAILED';
    let errorMessage = 'Failed to upload image. Please try again.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Check for specific error types
      if (error.message.includes('Cloudinary')) {
        errorCode = 'CLOUDINARY_ERROR';
      } else if (error.message.includes('configuration')) {
        errorCode = 'CONFIG_ERROR';
        errorMessage = 'Server configuration error. Please contact support.';
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: errorCode,
          message: errorMessage,
          timestamp: new Date().toISOString()
        } 
      },
      { status: 500 }
    );
  }
}