-- Migration: Allow admins to delete any product
-- Only "Users can delete own products" existed; admins need to delete
-- any product from the admin panel.

CREATE POLICY "Admins can delete products" ON public.products
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND p.rol = 'admin'
        )
    );
