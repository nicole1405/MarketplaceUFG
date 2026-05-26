-- Migration: Allow admins to create products for any user
-- The existing "Users can create products" policy only allows auth.uid() = vendedor_id.
-- Admins need to create products that belong to other users from the admin panel.

CREATE POLICY "Admins can create products" ON public.products
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol = 'admin'
        )
    );
