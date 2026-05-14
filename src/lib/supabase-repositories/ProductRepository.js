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
            .eq('estado_revision', 'aprobado')
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
            .eq('estado_revision', 'aprobado')
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
            .eq('estado_revision', 'aprobado')
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
                estado: 'disponible',
                estado_revision: 'pendiente'
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

    /**
     * Update only the estado field using a SECURITY DEFINER function
     * to bypass RLS SELECT policy issues when reading back the result
     */
    async updateEstado(id, newEstado) {
        const { error } = await supabase
            .from(this.table)
            .update({
                estado: newEstado,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { success: true };
    }

    /**
     * Admin full update - includes all fields like vendedor_id, estado_revision
     */
    async adminUpdate(id, product) {
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
                estado_revision: product.estado_revision,
                vendedor_id: product.vendedor_id,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
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

    // Admin-only methods

    async getAllForAdmin() {
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
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async approve(id, adminId) {
        const { data, error } = await supabase
            .from(this.table)
            .update({
                estado_revision: 'aprobado',
                revisado_por: adminId,
                fecha_revision: new Date().toISOString(),
                motivo_rechazo: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
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

    async reject(id, adminId, motivo) {
        const { data, error } = await supabase
            .from(this.table)
            .update({
                estado_revision: 'rechazado',
                revisado_por: adminId,
                fecha_revision: new Date().toISOString(),
                motivo_rechazo: motivo,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
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
}

export default ProductRepository;
