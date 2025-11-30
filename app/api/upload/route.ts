import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import sharp from 'sharp';

// Configuration de compression
const COMPRESSION_CONFIG = {
  maxWidth: 1200,      // Largeur max en pixels
  maxHeight: 1200,     // Hauteur max en pixels
  quality: 80,         // Qualité JPEG (0-100)
  webpQuality: 85,     // Qualité WebP (0-100)
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    // Accepter 'file' ou 'image' comme nom de champ
    const file = (formData.get('file') || formData.get('image')) as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { message: 'Aucun fichier fourni' } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: { message: 'Le fichier doit être une image' } },
        { status: 400 }
      );
    }

    // Validate file size (15MB max avant compression)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: { message: 'Le fichier est trop volumineux (max 15MB)' } },
        { status: 400 }
      );
    }

    const originalSize = file.size;
    console.log(`📸 Upload reçu: ${file.name} (${(originalSize / 1024).toFixed(0)}KB)`);

    // Create unique filename (toujours en .jpg après compression)
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `product_${timestamp}_${randomString}.jpg`;

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const inputBuffer = Buffer.from(bytes);

    // Compress image with sharp
    const compressedBuffer = await sharp(inputBuffer)
      .resize(COMPRESSION_CONFIG.maxWidth, COMPRESSION_CONFIG.maxHeight, {
        fit: 'inside',           // Garde les proportions
        withoutEnlargement: true // N'agrandit pas les petites images
      })
      .jpeg({
        quality: COMPRESSION_CONFIG.quality,
        progressive: true,       // JPEG progressif pour chargement plus rapide
        mozjpeg: true           // Meilleure compression
      })
      .toBuffer();

    const compressedSize = compressedBuffer.length;
    const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ Image compressée: ${(originalSize / 1024).toFixed(0)}KB → ${(compressedSize / 1024).toFixed(0)}KB (-${compressionRatio}%)`);

    // Save compressed image
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, compressedBuffer);

    // Return the public URL
    const publicUrl = `/uploads/products/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      originalSize: originalSize,
      compressedSize: compressedSize,
      compressionRatio: `${compressionRatio}%`
    });

  } catch (error) {
    console.error('❌ Erreur upload:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Erreur lors de l\'upload du fichier' } },
      { status: 500 }
    );
  }
}
