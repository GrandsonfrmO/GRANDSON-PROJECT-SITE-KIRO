import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Identifiants admin par défaut
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  email: 'admin@grandson.com'
};

const JWT_SECRET = process.env.JWT_SECRET || 'grandson-secret-key-2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Mobile login attempt:', { username, hasPassword: !!password });

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nom d\'utilisateur et mot de passe requis'
        },
        { status: 400 }
      );
    }

    // Vérifier les identifiants
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Générer un token JWT
      const token = jwt.sign(
        {
          id: 'admin-mobile',
          username: ADMIN_CREDENTIALS.username,
          email: ADMIN_CREDENTIALS.email,
          role: 'admin',
          isMobile: true
        },
        JWT_SECRET,
        { expiresIn: '7d' } // Token valide 7 jours pour mobile
      );

      console.log('Mobile login success');

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: 'admin-mobile',
          username: ADMIN_CREDENTIALS.username,
          email: ADMIN_CREDENTIALS.email,
          role: 'admin'
        }
      });
    }

    // Identifiants invalides
    console.log('Invalid credentials');
    return NextResponse.json(
      {
        success: false,
        error: 'Identifiants incorrects'
      },
      { status: 401 }
    );

  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}

// Vérifier le token
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    return NextResponse.json({
      success: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role,
        isMobile: decoded.isMobile
      }
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Token invalide' },
      { status: 401 }
    );
  }
}
