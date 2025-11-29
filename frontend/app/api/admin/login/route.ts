import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Configuration admin par défaut
const ADMIN_CREDENTIALS = {
  email: 'admin@grandson.com',
  password: 'admin123',
  username: 'admin'
};

const JWT_SECRET = process.env.JWT_SECRET || 'grandson-secret-key-2024';

// Rate limiting (simple in-memory implementation)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts?: number } {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (attempts) {
    if (now < attempts.resetTime) {
      if (attempts.count >= MAX_ATTEMPTS) {
        return { allowed: false };
      }
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count };
    } else {
      // Reset expired lockout
      loginAttempts.delete(identifier);
    }
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
}

function recordLoginAttempt(identifier: string, success: boolean) {
  if (success) {
    loginAttempts.delete(identifier);
    return;
  }

  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (attempts) {
    attempts.count += 1;
  } else {
    loginAttempts.set(identifier, {
      count: 1,
      resetTime: now + LOCKOUT_DURATION
    });
  }
}

// POST /api/admin/login - Unified admin authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    // Support pour email ou username
    const loginField = email || username;
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    console.log('Admin login attempt:', { 
      loginField, 
      hasPassword: !!password,
      ip: clientIp,
      userAgent: request.headers.get('user-agent')
    });

    // Validation des champs
    if (!loginField || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CREDENTIALS',
            message: 'Email/username et mot de passe requis'
          }
        },
        { status: 400 }
      );
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.log('Rate limit exceeded for:', clientIp);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
          }
        },
        { status: 429 }
      );
    }

    // Essayer de se connecter au backend d'abord
    try {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
      console.log('Attempting backend login at:', backendUrl);
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': request.headers.get('user-agent') || 'Admin-App',
          'X-Forwarded-For': clientIp,
        },
        body: JSON.stringify({ username: loginField, password }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Backend login success');
        recordLoginAttempt(clientIp, true);
        
        // Transform backend response to match expected format
        if (data.success && data.data) {
          return NextResponse.json({
            success: true,
            message: 'Connexion réussie',
            token: data.data.token,
            user: {
              id: data.data.admin.id,
              email: ADMIN_CREDENTIALS.email,
              username: data.data.admin.username,
              role: 'admin'
            }
          });
        }
        return NextResponse.json(data);
      } else {
        console.log('Backend login failed with status:', response.status, '- using fallback');
      }
    } catch (backendError: unknown) {
      const errorMessage = backendError instanceof Error ? backendError.message : 'Unknown error';
      console.log('Backend not available:', errorMessage, '- using demo credentials');
    }

    // Utiliser les identifiants de démonstration
    const isValidEmail = loginField === ADMIN_CREDENTIALS.email;
    const isValidUsername = loginField === ADMIN_CREDENTIALS.username;
    const isValidPassword = password === ADMIN_CREDENTIALS.password;

    if ((isValidEmail || isValidUsername) && isValidPassword) {
      // Générer un token JWT
      const token = jwt.sign(
        {
          id: 'admin-1',
          email: ADMIN_CREDENTIALS.email,
          username: ADMIN_CREDENTIALS.username,
          role: 'admin',
          deviceType: /Mobile|Android|iPhone|iPad/.test(request.headers.get('user-agent') || '') ? 'mobile' : 'desktop'
        },
        JWT_SECRET,
        { 
          expiresIn: '24h'
        }
      );

      console.log('Demo login success for:', loginField);
      recordLoginAttempt(clientIp, true);

      // Headers optimisés
      const response = NextResponse.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: {
          id: 'admin-1',
          email: ADMIN_CREDENTIALS.email,
          username: ADMIN_CREDENTIALS.username,
          role: 'admin'
        }
      });

      response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');

      return response;
    } else {
      console.log('Invalid credentials:', { loginField, isValidEmail, isValidUsername, isValidPassword });
      recordLoginAttempt(clientIp, false);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Identifiants invalides',
            remainingAttempts: rateLimit.remainingAttempts ? rateLimit.remainingAttempts - 1 : undefined
          }
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin login API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la connexion'
        }
      },
      { status: 500 }
    );
  }
}

// GET /api/admin/login - Check login status
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'Token manquant'
          }
        },
        { status: 401 }
      );
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username,
          role: decoded.role,
          isMobile: decoded.isMobile
        }
      });
    } catch (jwtError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TOKEN',
            message: 'Token invalide'
          }
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur de vérification'
        }
      },
      { status: 500 }
    );
  }
}