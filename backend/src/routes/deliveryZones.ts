import { Router, Request, Response, NextFunction } from 'express';
import { supabase } from '../index';
import { AppError } from '../middleware/errorHandler';
import { DeliveryZone, ApiResponse } from '../types';

const router = Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all active delivery zones
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('🚚 Fetching delivery zones...');

  const { data, error } = await supabase
    .from('delivery_zones')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new AppError(500, 'Failed to fetch delivery zones', 'DB_ERROR');
  }

  const response: ApiResponse<DeliveryZone[]> = {
    success: true,
    data: data || []
  };

  res.json(response);
}));

export default router;
