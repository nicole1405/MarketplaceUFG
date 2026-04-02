/**
 * Message Repository for Supabase
 * Manages messages in conversations
 * Security: Users can only read messages from their conversations
 */

import { supabase } from '../supabase.js';

export class MessageRepository {
    constructor() {
        this.table = 'messages';
    }

    async getByConversation(conversationId) {
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                remitente:remitente_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

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

    async create(message) {
        const { data, error } = await supabase
            .from(this.table)
            .insert({
                conversation_id: message.conversation_id,
                remitente_id: message.remitente_id,
                texto: message.texto.trim(),
                leido: false
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return data;
    }

    async markAsRead(id) {
        const { data, error } = await supabase
            .from(this.table)
            .update({ leido: true })
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

    async getUnreadCount(conversationId, userId) {
        const { count, error } = await supabase
            .from(this.table)
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversationId)
            .eq('leido', false)
            .neq('remitente_id', userId);

        if (error) throw new Error(error.message);
        return count;
    }
}

export default MessageRepository;
