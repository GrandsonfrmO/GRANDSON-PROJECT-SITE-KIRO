import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📧 Forwarding validation confirmation email to backend...');
    
    // Forward to backend
    const response = await fetch(`${BACKEND_URL}/api/email/send-validation-confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Validation confirmation email sent');
      return NextResponse.json(data);
    } else {
      console.error('❌ Backend error:', data);
      return NextResponse.json(data, { status: response.status });
    }
  } catch (error) {
    console.error('❌ Error sending validation confirmation:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email'
      },
      { status: 500 }
    );
  }
}
