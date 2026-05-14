/**
 * Password Reset Token Repository
 * Maneja tokens de reset de contraseña en la base de datos
 */

import { supabase } from '../supabase.js';

export class PasswordResetTokenRepository {
    constructor() {
        this.table = 'password_reset_tokens';
    }

    async create(email, token, expiresAt) {
        const { data, error } = await supabase
            .from(this.table)
            .insert({
                email,
                token,
                expires_at: expiresAt
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async findByToken(token) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('token', token)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    }

    async markAsUsed(id) {
        const { error } = await supabase
            .from(this.table)
            .update({ used: true })
            .eq('id', id);

        if (error) throw new Error(error.message);
    }

    async invalidateByEmail(email) {
        const { error } = await supabase
            .from(this.table)
            .update({ used: true })
            .eq('email', email)
            .eq('used', false);

        if (error) throw new Error(error.message);
    }
}

export default PasswordResetTokenRepository;
