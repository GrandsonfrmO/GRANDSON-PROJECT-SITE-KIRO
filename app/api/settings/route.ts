import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Récupérer les paramètres depuis la base de données
    const { data: logoData, error: logoError } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'logo')
      .single();

    console.log('📊 Logo data from DB:', logoData);
    console.log('❌ Logo error:', logoError);

    const logo = logoData ? JSON.parse(logoData.value) : {
      text: 'GRANDSON PROJECT',
      imageUrl: null
    };
    
    console.log('🎨 Logo final:', logo);

    const settings = {
      siteName: 'Grandson Project',
      siteDescription: 'Boutique en ligne moderne',
      contactEmail: 'contact@grandsonproject.com',
      contactPhone: '+224662662958',
      logo,
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: ''
      },
      deliveryInfo: {
        freeDeliveryThreshold: 50000,
        standardDeliveryFee: 5000
      }
    };

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('❌ Settings API error:', error);
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
    const body = await request.json();
    const { logo } = body;

    if (!logo) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_DATA',
            message: 'Données invalides'
          }
        },
        { status: 400 }
      );
    }

    // Vérifier si le paramètre existe déjà
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'logo')
      .single();

    if (existing) {
      // Mettre à jour
      const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.stringify(logo) })
        .eq('key', 'logo');

      if (error) throw error;
    } else {
      // Créer
      const { error } = await supabase
        .from('site_settings')
        .insert({ key: 'logo', value: JSON.stringify(logo) });

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Logo mis à jour avec succès'
    });
  } catch (error) {
    console.error('❌ Settings update error:', error);
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
