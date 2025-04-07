/*
  # Product Database Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `is_american` (boolean)
      - `alternative_to` (uuid, references products)
      - `created_at` (timestamp)
    
  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access
*/

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal NOT NULL,
  image_url text,
  is_american boolean DEFAULT false,
  alternative_to uuid REFERENCES products(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON products
  FOR SELECT
  TO public
  USING (true);