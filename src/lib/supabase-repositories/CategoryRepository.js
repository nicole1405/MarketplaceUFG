/**
 * Category Repository for Supabase
 * Manages product categories
 */

import { supabase } from '../supabase.js';

export class CategoryRepository {
    constructor() {
        this.table = 'categories';
    }

    async getAll() {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .order('nombre', { ascending: true });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async getById(id) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    }

    async getByName(nombre) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .ilike('nombre', nombre)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    }

    async create(category) {
        const { data, error } = await supabase
            .from(this.table)
            .insert({
                nombre: category.nombre,
                descripcion: category.descripcion || null,
                icono: category.icono || null
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id, category) {
        const { data, error } = await supabase
            .from(this.table)
            .update({
                nombre: category.nombre,
                descripcion: category.descripcion,
                icono: category.icono,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
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
}

export default CategoryRepository;
