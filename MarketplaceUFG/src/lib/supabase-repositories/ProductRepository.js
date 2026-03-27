/**
 * Product Repository for Supabase
 * Manages products in the database
 * Security: Only returns available products, RLS handles ownership
 */

import { supabase } from '../supabase.js';

export class ProductRepository {
    constructor() {
        this.table = 'products';
    }

    async getAll() {
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                categorias:categoria_id(
                    id,
                    nombre,
                    icono
                ),
                vendedor:vendedor_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .eq('estado', 'disponible')
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async getById(id) {
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                categorias:categoria_id(
                    id,
                    nombre,
                    icono
                ),
                vendedor:vendedor_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    }

    async getBySeller(sellerId) {
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                categorias:categoria_id(
                    id,
                    nombre,
                    icono
                )
            `)
            .eq('vendedor_id', sellerId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async search(query) {
        if (!query || query.trim() === '') {
            return this.getAll();
        }

        const searchTerm = `%${query.trim()}%`;
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                categorias:categoria_id(
                    id,
                    nombre,
                    icono
                ),
                vendedor:vendedor_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .eq('estado', 'disponible')
            .or(`nombre.ilike.${searchTerm},descripcion.ilike.${searchTerm}`)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async getByCategory(categoryId) {
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                categorias:categoria_id(
                    id,
                    nombre,
                    icono
                ),
                vendedor:vendedor_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .eq('estado', 'disponible')
            .eq('categoria_id', categoryId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async create(product) {
        const { data, error } = await supabase
            .from(this.table)
            .insert({
                nombre: product.nombre,
                precio: parseFloat(product.precio),
                descripcion: product.descripcion,
                imagenes_urls: product.imagenes_urls || [],
                imagenes_paths: product.imagenes_paths || [],
                vendedor_id: product.vendedor_id,
                categoria_id: product.categoria_id || null,
                estado: 'disponible'
            })
            .select(`
                *,
                categorias:categoria_id(
                    id,
                    nombre,
                    icono
                ),
                vendedor:vendedor_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id, product) {
        const { data, error } = await supabase
            .from(this.table)
            .update({
                nombre: product.nombre,
                precio: parseFloat(product.precio),
                descripcion: product.descripcion,
                imagenes_urls: product.imagenes_urls,
                imagenes_paths: product.imagenes_paths,
                categoria_id: product.categoria_id,
                estado: product.estado,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select(`
                *,
                categorias:categoria_id(
                    id,
                    nombre,
                    icono
                )
            `)
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async delete(id) {
        const { error } = await supabase
            .from(this.table)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return true;
    }

    async markAsSold(id) {
        const { data, error } = await supabase
            .from(this.table)
            .update({
                estado: 'vendido',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async count() {
        const { count, error } = await supabase
            .from(this.table)
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'disponible');

        if (error) throw new Error(error.message);
        return count;
    }
}

export default ProductRepository;
