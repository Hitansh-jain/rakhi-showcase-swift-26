-- Create products table with comprehensive filtering support
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image_url TEXT,
  category TEXT NOT NULL,
  discount INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table for better filter management
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since this is a public store)
CREATE POLICY "Products are viewable by everyone" 
ON public.products 
FOR SELECT 
USING (true);

CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.categories (name, display_order) VALUES
  ('All', 0),
  ('Designer Rakhi', 1),
  ('Kids Rakhi', 2),
  ('Combo Packs', 3),
  ('Under ₹50', 4),
  ('Premium Collection', 5);

-- Insert sample products
INSERT INTO public.products (name, description, price, original_price, category, discount, image_url) VALUES
  ('Royal Designer Rakhi', 'Beautiful handcrafted designer rakhi with golden threads', 299.00, 399.00, 'Designer Rakhi', 25, '/placeholder.svg'),
  ('Kids Cartoon Rakhi Set', 'Colorful cartoon themed rakhi perfect for kids', 149.00, 199.00, 'Kids Rakhi', 25, '/placeholder.svg'),
  ('Premium Combo Pack', 'Set of 3 premium rakhis with sweets', 599.00, 799.00, 'Combo Packs', 25, '/placeholder.svg'),
  ('Traditional Rakhi', 'Simple yet elegant traditional rakhi', 49.00, 69.00, 'Under ₹50', 29, '/placeholder.svg'),
  ('Silver Thread Rakhi', 'Premium silver thread rakhi with beads', 199.00, 249.00, 'Designer Rakhi', 20, '/placeholder.svg'),
  ('Superhero Rakhi', 'Fun superhero themed rakhi for young brothers', 99.00, 129.00, 'Kids Rakhi', 23, '/placeholder.svg'),
  ('Diamond Studded Rakhi', 'Luxury rakhi with real diamonds', 1299.00, 1599.00, 'Premium Collection', 19, '/placeholder.svg'),
  ('Eco-Friendly Rakhi', 'Made from sustainable materials', 79.00, 99.00, 'Designer Rakhi', 20, '/placeholder.svg');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_discount ON public.products(discount);
CREATE INDEX idx_products_in_stock ON public.products(in_stock);