-- Migration: Add Roles and Product Moderation
-- Adds rol column to profiles, revision workflow to products, and admin RLS policies

-- Add rol column to profiles
ALTER TABLE public.profiles 
    ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'anunciante' 
    CHECK (rol IN ('anunciante', 'admin'));

-- Add product moderation columns
ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS estado_revision VARCHAR(20) DEFAULT 'pendiente' 
    CHECK (estado_revision IN ('pendiente', 'aprobado', 'rechazado'));

ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS revisado_por UUID REFERENCES profiles(user_id);

ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS fecha_revision TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.products 
    ADD COLUMN IF NOT EXISTS motivo_rechazo TEXT;

-- Grandfather existing products: set them as approved
UPDATE public.products 
SET estado_revision = 'aprobado' 
WHERE estado_revision IS NULL OR estado_revision = 'pendiente';

-- Update RLS Policies for Products
-- Drop existing public read policy
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;

-- Public can only see approved and available products
CREATE POLICY "Public can read approved products" ON public.products 
    FOR SELECT 
    USING (estado = 'disponible' AND estado_revision = 'aprobado');

-- Admin can read all products (via rol check)
CREATE POLICY "Admins can read all products" ON public.products 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.rol = 'admin'
        )
    );

-- Users can create products (still need to be the seller)
-- Recreate to ensure it still works with new columns
DROP POLICY IF EXISTS "Users can create products" ON public.products;
CREATE POLICY "Users can create products" ON public.products 
    FOR INSERT 
    WITH CHECK (auth.uid() = vendedor_id);

-- Users can update own products
DROP POLICY IF EXISTS "Users can update own products" ON public.products;
CREATE POLICY "Users can update own products" ON public.products 
    FOR UPDATE 
    USING (auth.uid() = vendedor_id);

-- Users can delete own products
DROP POLICY IF EXISTS "Users can delete own products" ON public.products;
CREATE POLICY "Users can delete own products" ON public.products 
    FOR DELETE 
    USING (auth.uid() = vendedor_id);

-- Admin can update any product (for moderation)
CREATE POLICY "Admins can update products" ON public.products 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.rol = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.rol = 'admin'
        )
    );

-- Update RLS Policies for Categories
-- Drop existing read policy and recreate
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories" ON public.categories 
    FOR SELECT 
    USING (true);

-- Admin can manage categories (create, update, delete)
CREATE POLICY "Admins can manage categories" ON public.categories 
    FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.rol = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.rol = 'admin'
        )
    );

-- Update RLS Policies for Profiles
-- Admin can update any profile (for role changes)
CREATE POLICY "Admins can update profiles" ON public.profiles 
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.rol = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.rol = 'admin'
        )
    );

-- Create index for rol lookups
CREATE INDEX IF NOT EXISTS idx_profiles_rol ON profiles(rol);

-- Create index for estado_revision lookups
CREATE INDEX IF NOT EXISTS idx_products_estado_revision ON products(estado_revision);
