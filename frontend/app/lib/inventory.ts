import { CartItem } from '../types';

export interface StockCheckResult {
  available: boolean;
  outOfStockItems: Array<{
    productId: string;
    productName: string;
    requestedQuantity: number;
    availableStock: number;
  }>;
}

export const checkCartStock = async (cart: CartItem[]): Promise<StockCheckResult> => {
  const outOfStockItems: StockCheckResult['outOfStockItems'] = [];

  try {
    const productIds = [...new Set(cart.map(item => item.product.id))];
    
    for (const productId of productIds) {
      try {
        const response = await fetch(`/api/products/${productId}`);
        
        if (response.ok) {
          const data = await response.json();
          const product = data.data.product;
          
          const totalQuantityNeeded = cart
            .filter(item => item.product.id === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
          
          if (!product.isActive || product.stock < totalQuantityNeeded) {
            outOfStockItems.push({
              productId: product.id,
              productName: product.name,
              requestedQuantity: totalQuantityNeeded,
              availableStock: product.isActive ? product.stock : 0,
            });
          }
        }
      } catch (error) {
        console.error(`Error checking stock for product ${productId}:`, error);
      }
    }

    return {
      available: outOfStockItems.length === 0,
      outOfStockItems,
    };
  } catch (error) {
    console.error('Error checking cart stock:', error);
    throw error;
  }
};

export const checkProductStock = async (productId: string, quantity: number): Promise<boolean> => {
  try {
    const response = await fetch(`/api/products/${productId}`);
    
    if (response.ok) {
      const data = await response.json();
      const product = data.data.product;
      return product.isActive && product.stock >= quantity;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking product stock:', error);
    return false;
  }
};