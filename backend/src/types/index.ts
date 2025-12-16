export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  email?: string;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  base_price: number;
  category: string;
  stock: number;
  total_stock: number;
  sizes: string[];
  colors: string[] | null;
  images: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  delivery_zone: string;
  delivery_fee: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  size: string;
  quantity: number;
  price: number;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  is_active: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface JwtPayload {
  username: string;
  role: string;
  exp: number;
}
