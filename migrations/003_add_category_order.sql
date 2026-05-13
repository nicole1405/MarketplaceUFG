-- Migration: Add order column to categories
-- Execute this in Supabase SQL Editor if column doesn't exist

-- Check if column exists, if not add it
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'categories' 
        AND column_name = 'orden'
    ) THEN
        -- Add orden column to categories
        ALTER TABLE public.categories 
        ADD COLUMN orden INTEGER DEFAULT 0;
        
        RAISE NOTICE 'Columna "orden" agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna "orden" ya existe';
    END IF;
END $$;

-- Update existing categories to have sequential order if all are 0 or null
WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_order
    FROM categories
    WHERE orden IS NULL OR orden = 0
)
UPDATE categories c
SET orden = n.new_order
FROM numbered n
WHERE c.id = n.id
AND (c.orden IS NULL OR c.orden = 0);

-- Create index for ordering if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_categories_orden ON categories(orden);

-- Verify the changes
SELECT id, nombre, orden, created_at 
FROM categories 
ORDER BY orden ASC;
