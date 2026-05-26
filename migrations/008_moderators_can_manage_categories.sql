-- Migration: Allow moderators to manage categories
-- The old policy only allowed admin, but AdminService requires
-- requireModerador() (admin OR moderador) for category CRUD.

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

CREATE POLICY "Moderators and admins can manage categories" ON public.categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND (p.rol = 'admin' OR p.rol = 'moderador')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND (p.rol = 'admin' OR p.rol = 'moderador')
        )
    );
