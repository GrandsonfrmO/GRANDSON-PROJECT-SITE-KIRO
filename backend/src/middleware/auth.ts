import { Request, Response, NextFunction } from 'express';
import jwt from 'jwt-simple';
import { AppError } from './errorHandler';
import { JwtPayload, User } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Access token required', 'NO_TOKEN');
    }

    const decoded = jwt.decode(token, process.env.JWT_SECRET || 'dev-secret') as JwtPayload;
    
    // Vérifier l'expiration
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new AppError(401, 'Token expired', 'TOKEN_EXPIRED');
    }

    req.user = {
      id: decoded.username,
      username: decoded.username,
      role: decoded.role as 'admin' | 'user'
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(403, 'Invalid token', 'INVALID_TOKEN');
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new AppError(403, 'Admin access required', 'FORBIDDEN');
  }
  next();
};
