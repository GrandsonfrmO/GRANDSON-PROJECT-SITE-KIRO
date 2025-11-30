import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// GET /api/products/[id] - Récupérer un produit par ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Produit non trouvé'
        }
      }, { status: 404 });
    }

    // Transformer pour le frontend
    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price,
      category: product.category,
      sizes: product.sizes || [],
      images: product.images || [],
      colors: product.colors || [],
      stock: product.stock,
      isActive: product.is_active,
      isNew: product.is_new,
      isFeatured: product.is_featured,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };

    return NextResponse.json({
      success: true,
      data: { product: transformedProduct },
      product: transformedProduct
    });
  } catch (error) {
    console.error('Product API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur interne du serveur'
      }
    }, { status: 500 });
  }
}

// PUT /api/products/[id] - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data: product, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        price: body.price,
        original_price: body.originalPrice,
        category: body.category,
        sizes: body.sizes,
        images: body.images,
        colors: body.colors,
        stock: body.stock,
        is_active: body.isActive,
        is_new: body.isNew,
        is_featured: body.isFeatured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erreur lors de la mise à jour'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Update product API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur interne du serveur'
      }
    }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Erreur lors de la suppression'
        }
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé'
    });
  } catch (error) {
    console.error('Delete product API error:', error);
    return NextResponse.json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erreur interne du serveur'
      }
    }, { status: 500 });
  }
}
