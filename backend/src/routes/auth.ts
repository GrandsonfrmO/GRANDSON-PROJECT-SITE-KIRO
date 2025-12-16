import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest, ApiResponse } from '../types';

const router = Router();

// Wrapper pour gérer les erreurs async
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  const { username, password }: AuthRequest = req.body;

  if (!username || !password) {
    throw new AppError(400, 'Username and password required', 'MISSING_FIELDS');
  }

  console.log('🔐 Login attempt for:', username);

  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .single();

  if (error || !admin) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const isValid = await bcrypt.compare(password, admin.password);
  if (!isValid) {
    throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
  }

  const token = jwt.encode(
    {
      username: admin.username,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
    },
    process.env.JWT_SECRET || 'dev-secret'
  );

  console.log('✅ Login successful for:', username);

  const response: ApiResponse<any> = {
    success: true,
    data: {
      token,
      admin: { username: admin.username, role: 'admin' }
    }
  };

  res.json(response);
}));

router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError(400, 'Token required', 'MISSING_TOKEN');
  }

  try {
    const decoded = jwt.decode(token, process.env.JWT_SECRET || 'dev-secret');
    
    const response: ApiResponse<any> = {
      success: true,
      data: { valid: true, user: decoded }
    };

    res.json(response);
  } catch (error) {
    throw new AppError(401, 'Invalid token', 'INVALID_TOKEN');
  }
}));

export default router;
