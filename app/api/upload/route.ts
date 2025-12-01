import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Créer un client Supabase
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
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

    // Validate file size (15MB max)
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: { message: 'Le fichier est trop volumineux (max 15MB)' } },
        { status: 400 }
      );
    }

    console.log(`📸 Upload reçu: ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);

    // Create unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `product_${timestamp}_${randomString}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase.storage
      .from('products')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('❌ Supabase storage error:', error);
      
      // Si le bucket n'existe pas, retourner une URL placeholder
      if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
        console.log('⚠️ Bucket "products" non trouvé, utilisation URL placeholder');
        return NextResponse.json({
          success: true,
          url: `/placeholder-product.svg`,
          filename: filename,
          note: 'Bucket Supabase non configuré, image placeholder utilisée'
        });
      }
      
      return NextResponse.json(
        { success: false, error: { message: `Erreur upload: ${error.message}` } },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filename);

    console.log(`✅ Image uploadée: ${urlData.publicUrl}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      filename: filename
    });

  } catch (error) {
    console.error('❌ Erreur upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      { success: false, error: { message: `Erreur lors de l'upload: ${errorMessage}` } },
      { status: 500 }
    );
  }
}
