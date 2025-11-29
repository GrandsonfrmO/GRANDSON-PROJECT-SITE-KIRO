import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function verifyAdminAuth(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  return true;
}

export async function GET(request: Request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } },
        { status: 401 }
      );
    }

    // Récupérer tous les paramètres
    const { data: settings, error } = await supabase
      .from('site_settings')
      .select('*');

    if (error) throw error;

    // Transformer en objet clé-valeur
    const settingsObject: any = {};
    settings?.forEach((setting: any) => {
      try {
        settingsObject[setting.key] = JSON.parse(setting.value);
      } catch {
        settingsObject[setting.key] = setting.value;
      }
    });

    return NextResponse.json({
      success: true,
      data: settingsObject
    });
  } catch (error) {
    console.error('❌ Settings fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des paramètres'
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATA', message: 'Clé manquante' } },
        { status: 400 }
      );
    }

    // Vérifier si le paramètre existe
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', key)
      .single();

    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    if (existing) {
      // Mettre à jour
      const { error } = await supabase
        .from('site_settings')
        .update({ value: valueStr })
        .eq('key', key);

      if (error) throw error;
    } else {
      // Créer
      const { error } = await supabase
        .from('site_settings')
        .insert({ key, value: valueStr });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Paramètre mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Settings update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la mise à jour du paramètre'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const settings = body.settings || {};

    // Mettre à jour plusieurs paramètres en une fois
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .single();

      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

      if (existing) {
        return supabase
          .from('site_settings')
          .update({ value: valueStr })
          .eq('key', key);
      } else {
        return supabase
          .from('site_settings')
          .insert({ key, value: valueStr });
      }
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Bulk settings update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la mise à jour des paramètres'
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!verifyAdminAuth(request)) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Non autorisé' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_DATA', message: 'Clé manquante' } },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('key', key);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Paramètre supprimé avec succès'
    });
  } catch (error) {
    console.error('❌ Settings delete error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la suppression du paramètre'
        }
      },
      { status: 500 }
    );
  }
}
