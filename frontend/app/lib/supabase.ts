import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client pour le frontend avec clé publique
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour TypeScript (réutilisés du backend)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string[];
  images: string[];
  colors?: string[];
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address: string;
  delivery_zone?: string;
  delivery_fee: number;
  total_amount: number;
  status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
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
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  id: string;
  page_key: string;
  title: string;
  subtitle?: string;
  content: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}