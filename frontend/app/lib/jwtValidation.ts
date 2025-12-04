/**
 * JWT Validation Utility
 * 
 * Centralized JWT token validation for admin routes
 * Requirements: 6.3, 6.4
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  id: string;
  username: string;
  email: string;
  role?: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

export interface ValidationResult {
  success: boolean;
  payload?: JWTPayload;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Validate JWT token and return payload
 * Requirement 6.3: Validate JWT token for authenticated requests
 * Requirement 6.4: Return 401 with clear message for invalid/expired tokens
 */
export function validateToken(token: string): ValidationResult {
  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Verify that it's an admin token
    if (!decoded.isAdmin && decoded.role !== 'admin') {
      return {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. Admin privileges required.',
          details: 'User does not have admin role'
        }
      };
    }
    
    return {
      success: true,
      payload: decoded
    };
    
  } catch (error: any) {
    // Handle specific JWT errors with clear messages
    if (error.name === 'TokenExpiredError') {
      const expiredAt = error.expiredAt ? new Date(error.expiredAt).toISOString() : 'unknown';
      return {
        success: false,
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Your session has expired. Please log in again.',
          details: `Token expired at ${expiredAt}`
        }
      };
    }
    
    if (error.name === 'JsonWebTokenError') {
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authentication token. Please log in again.',
          details: error.message
        }
      };
    }
    
    if (error.name === 'NotBeforeError') {
      return {
        success: false,
        error: {
          code: 'TOKEN_NOT_ACTIVE',
          message: 'Token is not yet active. Please try again.',
          details: error.message
        }
      };
    }
    
    // Generic error
    return {
      success: false,
      error: {
        code: 'TOKEN_VALIDATION_ERROR',
        message: 'Failed to validate authentication token. Please log in again.',
        details: error.message || 'Unknown error'
      }
    };
  }
}

/**
 * Middleware function to validate JWT token from request
 * Returns error response if validation fails, or null if successful
 * 
 * Usage:
 * ```typescript
 * const authError = await validateAdminRequest(request);
 * if (authError) return authError;
 * ```
 */
export function validateAdminRequest(request: NextRequest): NextResponse | null {
  // Extract token from Authorization header
  const token = extractToken(request);
  
  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
          details: 'No authorization token provided'
        }
      },
      { status: 401 }
    );
  }
  
  // Validate the token
  const validation = validateToken(token);
  
  if (!validation.success) {
    const statusCode = validation.error?.code === 'FORBIDDEN' ? 403 : 401;
    
    return NextResponse.json(
      {
        success: false,
        error: validation.error
      },
      { status: statusCode }
    );
  }
  
  // Validation successful, return null (no error)
  return null;
}

/**
 * Get validated user payload from request
 * Returns the JWT payload if valid, or null if invalid
 */
export function getValidatedUser(request: NextRequest): JWTPayload | null {
  const token = extractToken(request);
  
  if (!token) {
    return null;
  }
  
  const validation = validateToken(token);
  
  return validation.success ? validation.payload! : null;
}

/**
 * Log authentication attempt for debugging
 */
export function logAuthAttempt(
  endpoint: string,
  success: boolean,
  error?: string,
  userId?: string
): void {
  const timestamp = new Date().toISOString();
  
  if (success) {
    console.log(`[JWT Auth] ✅ ${endpoint}`, {
      success: true,
      userId,
      timestamp
    });
  } else {
    console.error(`[JWT Auth] ❌ ${endpoint}`, {
      success: false,
      error,
      timestamp
    });
  }
}
