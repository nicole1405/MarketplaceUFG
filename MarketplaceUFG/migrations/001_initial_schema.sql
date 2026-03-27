-- Migration: Create Marketplace UFG Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table (links to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    imagen_path TEXT,
    vendedor_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible', 'vendido', 'eliminado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    comprador_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    vendedor_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(producto_id, comprador_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    remitente_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendedor ON products(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria_id);
CREATE INDEX IF NOT EXISTS idx_products_estado ON products(estado);
CREATE INDEX IF NOT EXISTS idx_conversations_comprador ON conversations(comprador_id);
CREATE INDEX IF NOT EXISTS idx_conversations_vendedor ON conversations(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_leido ON messages(conversation_id, leido);

-- Insert default categories
INSERT INTO categories (nombre, descripcion, icono) VALUES 
    ('Electrónica', 'Dispositivos electrónicos y accesorios', '💻'),
    ('Libros', 'Libros y material de estudio', '📚'),
    ('Ropa', 'Ropa y accesorios', '👕'),
    ('Deportes', 'Equipos y artículos deportivos', '⚽'),
    ('Hogar', 'Artículos para el hogar', '🏠'),
    ('Otros', 'Otros productos', '📦')
ON CONFLICT (nombre) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Categories
CREATE POLICY "Anyone can read categories" ON public.categories FOR SELECT USING (true);

-- RLS Policies for Products
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (estado = 'disponible');
CREATE POLICY "Users can create products" ON public.products FOR INSERT WITH CHECK (auth.uid() = vendedor_id);
CREATE POLICY "Users can update own products" ON public.products FOR UPDATE USING (auth.uid() = vendedor_id);
CREATE POLICY "Users can delete own products" ON public.products FOR DELETE USING (auth.uid() = vendedor_id);

-- RLS Policies for Conversations
CREATE POLICY "Users can read own conversations" ON public.conversations FOR SELECT 
    USING (comprador_id = auth.uid() OR vendedor_id = auth.uid());
CREATE POLICY "Users can create conversations" ON public.conversations FOR INSERT 
    WITH CHECK (comprador_id = auth.uid() OR vendedor_id = auth.uid());

-- RLS Policies for Messages
CREATE POLICY "Users can read messages from own conversations" ON public.messages FOR SELECT 
    USING (
        conversation_id IN (
            SELECT id FROM conversations 
            WHERE comprador_id = auth.uid() OR vendedor_id = auth.uid()
        )
    );
CREATE POLICY "Users can create messages" ON public.messages FOR INSERT 
    WITH CHECK (remitente_id = auth.uid());

-- Create trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, nombre)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'nombre');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get unread messages count
CREATE OR REPLACE FUNCTION public.get_unread_count(user_uuid UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.leido = false
    AND m.remitente_id != user_uuid
    AND (c.comprador_id = user_uuid OR c.vendedor_id = user_uuid);
$$ LANGUAGE plpgsql SECURITY DEFINER;
