-- Table: public.users
-- Note: Supabase Auth gère déjà une table 'auth.users'.
-- Cette table 'public.users' est pour les profils utilisateurs étendus.
-- L'ID doit correspondre à l'ID de 'auth.users'.
CREATE TABLE public.users (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name text NOT NULL,
    email text UNIQUE NOT NULL,
    is_seller boolean DEFAULT FALSE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policies for public.users
CREATE POLICY "Users can view their own profile." ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Table: public.categories
CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories." ON public.categories
  FOR SELECT USING (true);

-- Table: public.products
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    seller_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
    name text NOT NULL,
    description text,
    price numeric(10, 2) NOT NULL,
    image_url text,
    stock integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products." ON public.products
  FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own products." ON public.products
  FOR ALL USING (auth.uid() = seller_id) WITH CHECK (auth.uid() = seller_id);

-- Table: public.orders
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    total_amount numeric(10, 2) NOT NULL,
    status text DEFAULT 'pending' NOT NULL, -- e.g., 'pending', 'completed', 'cancelled'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders." ON public.orders
  FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can create orders." ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Table: public.order_items
CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10, 2) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their order items." ON public.order_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()));
CREATE POLICY "Users can insert order items for their orders." ON public.order_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid()));