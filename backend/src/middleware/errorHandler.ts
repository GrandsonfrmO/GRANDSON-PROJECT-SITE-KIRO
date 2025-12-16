import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('❌ Error:', err);

  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      error: {
        message: err.message,
        code: err.code
      }
    };
    return res.status(err.statusCode).json(response);
  }

  // Default error
  const response: ApiResponse<null> = {
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    }
  };
  return res.status(500).json(response);
};
