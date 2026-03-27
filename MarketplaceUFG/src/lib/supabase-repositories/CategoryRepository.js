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
}

export default CategoryRepository;
