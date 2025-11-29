/**
 * Utility functions for cart management
 */

/**
 * Clear the cart from localStorage
 */
export const clearCartStorage = (): void => {
  try {
    localStorage.removeItem('grandson-cart');
    console.log('Cart storage cleared successfully');
  } catch (error) {
    console.error('Error clearing cart storage:', error);
  }
};

/**
 * Get cart data from localStorage
 */
export const getCartFromStorage = (): any[] => {
  try {
    const savedCart = localStorage.getItem('grandson-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error reading cart from storage:', error);
    return [];
  }
};

/**
 * Debug cart storage - log current cart data
 */
export const debugCartStorage = (): void => {
  try {
    const cart = getCartFromStorage();
    console.log('Current cart in storage:', cart);
    console.log('Cart items count:', cart.length);
    
    cart.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        name: item.product?.name,
        id: item.product?.id,
        stock: item.product?.stock,
        quantity: item.quantity,
        size: item.size,
        isActive: item.product?.isActive
      });
    });
  } catch (error) {
    console.error('Error debugging cart storage:', error);
  }
};

/**
 * Remove items with zero stock from localStorage
 */
export const cleanCartStorage = (): void => {
  try {
    const cart = getCartFromStorage();
    const cleanedCart = cart.filter(item => {
      const hasStock = item.product?.stock > 0;
      const isActive = item.product?.isActive !== false;
      
      if (!hasStock || !isActive) {
        console.log(`Removing ${item.product?.name} from storage: stock=${item.product?.stock}, active=${isActive}`);
        return false;
      }
      
      return true;
    });
    
    localStorage.setItem('grandson-cart', JSON.stringify(cleanedCart));
    console.log(`Cleaned cart: removed ${cart.length - cleanedCart.length} items`);
  } catch (error) {
    console.error('Error cleaning cart storage:', error);
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).cartUtils = {
    clearCartStorage,
    getCartFromStorage,
    debugCartStorage,
    cleanCartStorage
  };
}