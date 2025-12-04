import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateProduct } from '@/app/lib/validation';
import { validateAdminRequest, logAuthAttempt, getValidatedUser } from '@/app/lib/jwtValidation';

// Créer un client Supabase avec la clé service pour les opérations admin
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

// Transform product data from snake_case to camelCase
const transformProduct = (product: any) => {
  if (!product) return null;
  
  // Parse images if it's a string
  let images = product.images;
  if (typeof images === 'string') {
    try {
      images = JSON.parse(images);
    } catch (e) {
      images = [images];
    }
  }
  if (!Array.isArray(images)) {
    images = images ? [images] : [];
  }
  
  // Parse sizes if it's a string
  let sizes = product.sizes;
  if (typeof sizes === 'string') {
    try {
      sizes = JSON.parse(sizes);
    } catch (e) {
      sizes = [sizes];
    }
  }
  if (!Array.isArray(sizes)) {
    sizes = sizes ? [sizes] : ['Unique'];
  }
  
  // Parse colors if it's a string
  let colors = product.colors;
  if (typeof colors === 'string') {
    try {
      colors = JSON.parse(colors);
    } catch (e) {
      colors = [colors];
    }
  }
  if (colors && !Array.isArray(colors)) {
    colors = [colors];
  }
  
  return {
    ...product,
    images,
    sizes,
    colors,
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
  };
};

// GET /api/admin/products/[id] - Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt(`GET /api/admin/products/${id}`, false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt(`GET /api/admin/products/${id}`, true, undefined, user?.id);

    const supabase = getSupabaseAdmin();

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Produit non trouvé'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { product: transformProduct(product) }
    });
  } catch (error) {
    console.error('Get product API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération du produit'
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  
  try {
    const { id } = await params;
    
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      console.error(`[${requestId}] ❌ Unauthorized: Authentication failed`);
      logAuthAttempt(`PUT /api/admin/products/${id}`, false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt(`PUT /api/admin/products/${id}`, true, undefined, user?.id);
    
    const body = await request.json();
    
    console.log(`[${requestId}] 📝 Product update started for ID: ${id}`, {
      userId: user?.id
    });
    
    const supabase = getSupabaseAdmin();

    // Load existing product from Supabase
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      console.error(`[${requestId}] ❌ Product not found:`, id);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found. It may have been deleted.',
            timestamp: new Date().toISOString()
          }
        },
        { status: 404 }
      );
    }

    console.log(`[${requestId}] 📦 Existing product loaded:`, {
      name: existingProduct.name,
      price: existingProduct.price,
      stock: existingProduct.stock,
      category: existingProduct.category
    });

    // Validate modifications using validation utility
    const validationResult = validateProduct(body, true); // true = update mode
    
    if (!validationResult.isValid) {
      console.error(`[${requestId}] ❌ Validation failed:`, validationResult.errors);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed. Please check all fields.',
            details: validationResult.errors,
            timestamp: new Date().toISOString()
          }
        },
        { status: 400 }
      );
    }

    // Build update data with proper handling
    const { name, description, price, category, sizes, images, colors, stock, is_active, isActive } = body;
    
    const updateData: any = {};
    const changes: string[] = [];
    const oldValues: Record<string, any> = {};
    
    if (name !== undefined && name !== existingProduct.name) {
      oldValues.name = existingProduct.name;
      updateData.name = name.trim();
      changes.push(`name: "${existingProduct.name}" → "${name}"`);
    }
    if (description !== undefined && description !== existingProduct.description) {
      oldValues.description = existingProduct.description;
      updateData.description = description?.trim() || '';
      changes.push(`description updated`);
    }
    if (price !== undefined && parseFloat(price) !== existingProduct.price) {
      const priceValue = parseFloat(price);
      oldValues.price = existingProduct.price;
      updateData.price = priceValue;
      updateData.base_price = priceValue;
      changes.push(`price: ${existingProduct.price} → ${priceValue}`);
    }
    if (category !== undefined && category !== existingProduct.category) {
      oldValues.category = existingProduct.category;
      updateData.category = category.trim();
      changes.push(`category: "${existingProduct.category}" → "${category}"`);
    }
    if (sizes !== undefined) {
      oldValues.sizes = existingProduct.sizes;
      updateData.sizes = Array.isArray(sizes) ? sizes : [sizes];
      changes.push(`sizes updated`);
    }
    
    // Handle image updates properly
    if (images !== undefined) {
      oldValues.images = existingProduct.images;
      const imageArray = Array.isArray(images) ? images : (images ? [images] : []);
      updateData.images = imageArray;
      changes.push(`images updated (${imageArray.length} images)`);
      
      console.log(`[${requestId}] 🖼️ Image update:`, {
        oldCount: Array.isArray(existingProduct.images) ? existingProduct.images.length : 0,
        newCount: imageArray.length,
        newImages: imageArray
      });
    }
    
    if (colors !== undefined) {
      oldValues.colors = existingProduct.colors;
      updateData.colors = colors && colors.length > 0 ? (Array.isArray(colors) ? colors : [colors]) : null;
      changes.push(`colors updated`);
    }
    if (stock !== undefined && parseInt(stock) !== existingProduct.stock) {
      const stockValue = parseInt(stock);
      oldValues.stock = existingProduct.stock;
      updateData.stock = stockValue;
      updateData.total_stock = stockValue;
      changes.push(`stock: ${existingProduct.stock} → ${stockValue}`);
    }
    
    const activeValue = is_active !== undefined ? is_active : isActive;
    if (activeValue !== undefined && activeValue !== existingProduct.is_active) {
      oldValues.is_active = existingProduct.is_active;
      updateData.is_active = activeValue;
      changes.push(`is_active: ${existingProduct.is_active} → ${activeValue}`);
    }

    // Check if there are any changes
    if (Object.keys(updateData).length === 0) {
      console.log(`[${requestId}] ℹ️ No changes detected`);
      return NextResponse.json({
        success: true,
        data: { 
          product: transformProduct(existingProduct),
          message: 'No changes detected'
        }
      });
    }

    console.log(`[${requestId}] 📝 Applying ${changes.length} changes:`, changes);
    console.log(`[${requestId}] 📝 Old values:`, oldValues);

    // Update product in database
    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`[${requestId}] ❌ Supabase update error:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: `Failed to update product: ${error.message}`,
            details: error.details,
            timestamp: new Date().toISOString()
          }
        },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[${requestId}] ✅ Product updated successfully in ${duration}ms:`, {
      id: product.id,
      name: product.name,
      changes: changes.length,
      changesList: changes
    });

    return NextResponse.json({
      success: true,
      data: { 
        product: transformProduct(product),
        message: 'Product updated successfully',
        changes: changes
      }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${requestId}] ❌ Update product error after ${duration}ms:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error(`[${requestId}] Stack trace:`, errorStack);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: `Failed to update product: ${errorMessage}`,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Validate admin authentication
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt(`DELETE /api/admin/products/${id}`, false, 'Authentication failed');
      return authError;
    }
    
    const user = getValidatedUser(request);
    logAuthAttempt(`DELETE /api/admin/products/${id}`, true, undefined, user?.id);

    console.log(`📦 Deleting product ${id}...`, {
      userId: user?.id
    });
    
    const supabase = getSupabaseAdmin();

    // Check if product exists
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Produit non trouvé'
          }
        },
        { status: 404 }
      );
    }

    // Delete product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: error.message
          }
        },
        { status: 500 }
      );
    }

    console.log('✅ Product deleted successfully:', id);

    return NextResponse.json({
      success: true,
      data: { message: 'Produit supprimé avec succès' }
    });
  } catch (error) {
    console.error('❌ Delete product API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la suppression du produit'
        }
      },
      { status: 500 }
    );
  }
}
