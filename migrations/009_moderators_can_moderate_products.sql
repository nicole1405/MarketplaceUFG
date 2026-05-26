-- Migration: Allow moderators to moderate products (approve/reject)
-- Existing UPDATE policy only allowed admin, but AdminService uses
-- requireModerador() (admin OR moderador) for approve/reject operations.
-- Also add SELECT policy so moderators can read all products in admin panel.

-- 1. Moderators can read all products (for admin panel listing)
DROP POLICY IF EXISTS "Moderators can read all products" ON public.products;
CREATE POLICY "Moderators can read all products" ON public.products
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol = 'moderador'
        )
    );

-- 2. Moderators can update products (for approve/reject)
DROP POLICY IF EXISTS "Moderators can update products" ON public.products;
CREATE POLICY "Moderators can update products" ON public.products
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol = 'moderador'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol = 'moderador'
        )
    );
