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
            .order('orden', { ascending: true });

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
                icono: category.icono || null,
                orden: category.orden || 0
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id, category) {
        const updateData = {
            nombre: category.nombre,
            descripcion: category.descripcion,
            icono: category.icono
        };
        
        // Only include orden if it's provided and is a number
        if (category.orden !== undefined && category.orden !== null && typeof category.orden === 'number') {
            updateData.orden = category.orden;
            console.log('[CategoryRepository.update] Including orden:', category.orden, 'for category:', category.nombre);
        } else {
            console.warn('[CategoryRepository.update] NOT including orden. Received:', category.orden, 'typeof:', typeof category.orden);
        }
        
        console.log('[CategoryRepository.update] Final updateData:', updateData, 'for id:', id);
        
        const { data, error } = await supabase
            .from(this.table)
            .update(updateData)
            .eq('id', id)
            .select();

        if (error) {
            console.error('[CategoryRepository.update] Supabase error:', error);
            throw new Error(error.message);
        }
        
        console.log('[CategoryRepository.update] Success! Returned:', data);
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
