import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Token manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    try {
      // Vérifier et décoder le token
      const decoded = jwt.verify(token, JWT_SECRET) as any;

      // Vérifier que c'est bien un token admin
      if (!decoded.isAdmin && decoded.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: 'Accès non autorisé' },
          { status: 403 }
        );
      }

      // Retourner les informations de l'utilisateur
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
          isAdmin: decoded.isAdmin || decoded.role === 'admin'
        }
      });

    } catch (jwtError: any) {
      // Token invalide ou expiré
      return NextResponse.json(
        { 
          success: false, 
          error: jwtError.name === 'TokenExpiredError' 
            ? 'Token expiré' 
            : 'Token invalide' 
        },
        { status: 401 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de la vérification du token:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
