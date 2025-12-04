-- Add customer_email column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
