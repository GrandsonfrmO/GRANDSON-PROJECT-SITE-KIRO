import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Default brand images
const defaultBrandImages = {
  brandImage1: '/images/brand/grandson-ent-logo.svg',
  brandImage2: '/images/brand/made-in-guinea-label.svg',
  brandImage3: '/images/brand/horse-mascot.svg'
};

// GET /api/admin/brand-images - Fetch brand images
export async function GET(request: NextRequest) {
  try {
    // Fetch brand images from site_settings table
    const { data, error } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['brand_image_1', 'brand_image_2', 'brand_image_3']);

    if (error) {
      console.error('Error fetching brand images:', error);
      // Return default images if database error
      return NextResponse.json({
        success: true,
        data: defaultBrandImages
      });
    }

    // Parse the key-value pairs
    const settings: any = {};
    data?.forEach((item: any) => {
      try {
        settings[item.key] = item.value === 'null' ? null : JSON.parse(item.value);
      } catch {
        settings[item.key] = item.value;
      }
    });

    // Return database values or defaults if null
    return NextResponse.json({
      success: true,
      data: {
        brandImage1: settings.brand_image_1 || defaultBrandImages.brandImage1,
        brandImage2: settings.brand_image_2 || defaultBrandImages.brandImage2,
        brandImage3: settings.brand_image_3 || defaultBrandImages.brandImage3
      }
    });
  } catch (error) {
    console.error('Error in GET /api/admin/brand-images:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch brand images',
      data: defaultBrandImages
    }, { status: 500 });
  }
}

// POST /api/admin/brand-images - Update brand images
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { brandImage1, brandImage2, brandImage3 } = body;

    // Validate at least one image is provided
    if (!brandImage1 && !brandImage2 && !brandImage3) {
      return NextResponse.json({
        success: false,
        error: 'At least one brand image URL must be provided'
      }, { status: 400 });
    }

    // Update site_settings table (upsert for each key)
    const updates = [];
    if (brandImage1 !== undefined) {
      updates.push({ key: 'brand_image_1', value: JSON.stringify(brandImage1) });
    }
    if (brandImage2 !== undefined) {
      updates.push({ key: 'brand_image_2', value: JSON.stringify(brandImage2) });
    }
    if (brandImage3 !== undefined) {
      updates.push({ key: 'brand_image_3', value: JSON.stringify(brandImage3) });
    }

    // Perform upserts
    for (const update of updates) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(update, { onConflict: 'key' });

      if (error) {
        console.error(`Error updating ${update.key}:`, error);
        return NextResponse.json({
          success: false,
          error: `Failed to update ${update.key}`
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Brand images updated successfully',
      data: {
        brandImage1: brandImage1 || defaultBrandImages.brandImage1,
        brandImage2: brandImage2 || defaultBrandImages.brandImage2,
        brandImage3: brandImage3 || defaultBrandImages.brandImage3
      }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/brand-images:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update brand images'
    }, { status: 500 });
  }
}
