import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // Validate that it's a local backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    if (!imageUrl.startsWith(backendUrl)) {
      return new NextResponse('Invalid URL', { status: 400 });
    }

    // Fetch the image from the backend
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('Content-Type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}