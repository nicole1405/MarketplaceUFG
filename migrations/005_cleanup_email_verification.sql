-- Migration: Cleanup unused email verification objects
-- Removes tables, functions, and columns related to email verification
-- that are no longer referenced by the codebase after removing the
-- forgot/reset password flow. Change password from profile (updatePassword)
-- uses supabase.auth.updateUser() client-side and is NOT affected.

-- Drop table: password_reset_tokens (used by deleted PasswordResetTokenRepository)
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;

-- Drop table: verification_tokens (never referenced by code)
DROP TABLE IF EXISTS public.verification_tokens CASCADE;

-- Drop function: admin_reset_user_password (only called by deleted resetPasswordWithToken)
DROP FUNCTION IF EXISTS public.admin_reset_user_password;

-- Drop column: email_verified from profiles (never read/written by code)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email_verified;
