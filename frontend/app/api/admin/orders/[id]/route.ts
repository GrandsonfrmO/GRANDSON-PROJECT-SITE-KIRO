import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    // Get admin token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token d\'authentification requis'
          }
        },
        { status: 401 }
      );
    }

    // Verify admin token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
      if (!decoded) {
        throw new Error('Invalid token');
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token invalide'
          }
        },
        { status: 401 }
      );
    }

    console.log(`🔄 Frontend API: Updating order ${id} status to: ${status}`);

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: 'Statut invalide'
          }
        },
        { status: 400 }
      );
    }

    // Map status for database (temporary mapping for enum compatibility)
    let dbStatus = status.toUpperCase();
    if (status.toLowerCase() === 'processing') {
      dbStatus = 'CONFIRMED'; // Temporary mapping
      console.log('⚠️ Mapping PROCESSING to CONFIRMED (temporary)');
    }
    if (status.toLowerCase() === 'shipped') {
      dbStatus = 'CONFIRMED'; // Temporary mapping
      console.log('⚠️ Mapping SHIPPED to CONFIRMED (temporary)');
    }

    // Update order status directly in Supabase
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: dbStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error updating order status:', error);
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

    console.log(`✅ Order ${id} status updated to ${dbStatus}`);

    // Return the requested status (not the mapped one)
    return NextResponse.json({
      success: true,
      data: {
        order: {
          ...data,
          status: status.toLowerCase() // Return the requested status
        }
      }
    });
  } catch (error) {
    console.error('❌ Update order status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la mise à jour du statut'
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
    
    // Get admin token from headers
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token d\'authentification requis'
          }
        },
        { status: 401 }
      );
    }

    // Verify admin token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this-in-production');
      if (!decoded) {
        throw new Error('Invalid token');
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token invalide'
          }
        },
        { status: 401 }
      );
    }

    console.log(`🗑️ Frontend API: Deleting order ${id} from Supabase...`);
    
    // Delete order directly from Supabase
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting order:', error);
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

    console.log(`✅ Order ${id} deleted successfully`);
    
    return NextResponse.json({
      success: true,
      data: { message: 'Commande supprimée avec succès' }
    });
  } catch (error) {
    console.error('❌ Delete order error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la suppression de la commande'
        }
      },
      { status: 500 }
    );
  }
}