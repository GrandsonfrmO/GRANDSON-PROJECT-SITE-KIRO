import { NextRequest, NextResponse } from 'next/server';
import { validateAdminRequest, getValidatedUser, logAuthAttempt } from '@/app/lib/jwtValidation';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication using centralized validation
    const authError = validateAdminRequest(request);
    if (authError) {
      logAuthAttempt('GET /api/admin/verify', false, 'Authentication failed');
      return authError;
    }

    // Get validated user payload
    const user = getValidatedUser(request);
    
    if (!user) {
      // This should not happen if validateAdminRequest passed, but handle it anyway
      logAuthAttempt('GET /api/admin/verify', false, 'User payload not found');
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to retrieve user information'
          }
        },
        { status: 500 }
      );
    }

    logAuthAttempt('GET /api/admin/verify', true, undefined, user.id);

    // Return user information
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin || user.role === 'admin'
      }
    });

  } catch (error: any) {
    console.error('❌ Error verifying token:', error);
    logAuthAttempt('GET /api/admin/verify', false, error.message);
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Server error during token verification'
        }
      },
      { status: 500 }
    );
  }
}
