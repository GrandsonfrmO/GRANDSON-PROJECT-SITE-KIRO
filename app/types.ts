// Types pour l'application frontend

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // Prix original pour les promotions
  category: string;
  sizes: string[];
  images: string[];
  colors?: string[];
  stock: number;
  isActive: boolean;
  isNew?: boolean; // Nouveau produit
  isFeatured?: boolean; // Produit mis en avant
  rating?: number; // Note moyenne
  reviewCount?: number; // Nombre d'avis
  tags?: string[]; // Tags pour le produit
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryZone?: string;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  size: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    images: string[];
  };
}

export interface DeliveryZone {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  deliveryInfo: {
    freeDeliveryThreshold: number;
    standardDeliveryFee: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface AdminUser {
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}