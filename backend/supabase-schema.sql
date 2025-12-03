-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for order status
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  sizes JSONB NOT NULL DEFAULT '[]', -- Array of available sizes
  images JSONB NOT NULL DEFAULT '[]', -- Array of image URLs
  colors JSONB DEFAULT '[]', -- Array of available colors (optional)
  stock INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  delivery_address TEXT NOT NULL,
  delivery_zone VARCHAR(100),
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  size VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site settings table
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL, -- JSON string for complex data
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery zones table
CREATE TABLE delivery_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page content table
CREATE TABLE page_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key VARCHAR(100) UNIQUE NOT NULL, -- 'starter-pack', 'download', 'contact'
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  content TEXT NOT NULL, -- JSON string for page-specific content
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_delivery_zones_is_active ON delivery_zones(is_active);
CREATE INDEX idx_page_contents_is_active ON page_contents(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_delivery_zones_updated_at BEFORE UPDATE ON delivery_zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_page_contents_updated_at BEFORE UPDATE ON page_contents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO admins (username, password) VALUES 
('admin', '$2b$10$rQJ8YnWmjKqZ8YnWmjKqZOeKqZ8YnWmjKqZ8YnWmjKqZ8YnWmjKqZO');

-- Insert default delivery zones
INSERT INTO delivery_zones (name, price) VALUES 
('Camayenne', 30000),
('Dixinn', 25000),
('Kaloum', 35000),
('Matam', 25000),
('Matoto', 25000),
('Ratoma', 20000);

-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES 
('site_name', '"Grandson Project"'),
('contact_phone', '"+224662662958"'),
('contact_email', '"contact@grandsonproject.com"'),
('delivery_info', '"Livraison disponible dans toute la région de Conakry"');

-- Insert default page contents
INSERT INTO page_contents (page_key, title, subtitle, content) VALUES 
('starter-pack', 'Starter Pack', 'Découvrez notre collection exclusive', '{"description": "Pack de démarrage avec nos meilleurs produits", "features": ["Qualité premium", "Livraison rapide", "Support client"]}'),
('download', 'Téléchargements', 'Ressources et catalogues', '{"description": "Téléchargez nos catalogues et guides", "files": []}'),
('contact', 'Contact', 'Nous contacter', '{"description": "Contactez-nous pour toute question", "address": "Conakry, Guinée", "hours": "Lun-Sam: 8h-18h"}');