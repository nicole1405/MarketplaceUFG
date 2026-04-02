/**
 * Profile Repository for Supabase
 * Manages user profiles in the database
 * Security: All operations are protected by RLS policies
 */

import { supabase } from '../supabase.js';

export class ProfileRepository {
    constructor() {
        this.table = 'profiles';
    }

    async getAll() {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .order('created_at', { ascending: false });

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

    async getByUserId(userId) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    }

    async getByEmail(email) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    }

    async create(profile) {
        const { data, error } = await supabase
            .from(this.table)
            .insert({
                user_id: profile.user_id,
                email: profile.email.toLowerCase(),
                nombre: profile.nombre,
                avatar_url: profile.avatar_url || null
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async update(id, profile) {
        const { data, error } = await supabase
            .from(this.table)
            .update({
                nombre: profile.nombre,
                avatar_url: profile.avatar_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async updateByUserId(userId, profile) {
        const { data, error } = await supabase
            .from(this.table)
            .update({
                nombre: profile.nombre,
                avatar_url: profile.avatar_url,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
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

    async exists(email) {
        const profile = await this.getByEmail(email);
        return profile !== null;
    }
}

export default ProfileRepository;
