/**
 * Conversation Repository for Supabase
 * Manages conversations and messages in the database
 * Security: Users can only access their own conversations
 */

import { supabase } from '../supabase.js';

export class ConversationRepository {
    constructor() {
        this.table = 'conversations';
    }

    async getAll() {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .order('updated_at', { ascending: false });

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

    async getByUser(userId) {
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                producto:producto_id(
                    id,
                    nombre,
                    precio,
                    imagenes_urls
                ),
                comprador:comprador_id(
                    user_id,
                    nombre,
                    email
                ),
                vendedor:vendedor_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .or(`comprador_id.eq.${userId},vendedor_id.eq.${userId}`)
            .order('updated_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data || [];
    }

    async getByProduct(productId) {
        const { data, error } = await supabase
            .from(this.table)
            .select(`
                *,
                comprador:comprador_id(
                    user_id,
                    nombre,
                    email
                ),
                vendedor:vendedor_id(
                    user_id,
                    nombre,
                    email
                )
            `)
            .eq('producto_id', productId);

        if (error) throw new Error(error.message);
        return data || [];
    }

    async create(conversation) {
        const { data, error } = await supabase
            .from(this.table)
            .insert({
                producto_id: conversation.producto_id,
                comprador_id: conversation.comprador_id,
                vendedor_id: conversation.vendedor_id
            })
            .select(`
                *,
                producto:producto_id(
                    id,
                    nombre,
                    precio,
                    imagenes_urls
                ),
                comprador:comprador_id(
                    user_id,
                    nombre,
                    email
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

    async update(id, conversation) {
        const { error } = await supabase
            .from(this.table)
            .update({
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { id };
    }

    async delete(id) {
        const { error } = await supabase
            .from(this.table)
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return true;
    }

    async findByParticipants(productId, buyerId, sellerId) {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('producto_id', productId)
            .eq('comprador_id', buyerId)
            .eq('vendedor_id', sellerId)
            .single();

        if (error && error.code !== 'PGRST116') throw new Error(error.message);
        return data;
    }

    async getUnreadCount(userId) {
        const { data, error } = await supabase
            .rpc('get_unread_count', { user_uuid: userId });

        if (error) throw new Error(error.message);
        return data || 0;
    }

    async markMessagesAsRead(conversationId, userId) {
        const { error } = await supabase
            .from('messages')
            .update({ leido: true })
            .eq('conversation_id', conversationId)
            .neq('remitente_id', userId);

        if (error) throw new Error(error.message);
        return true;
    }
}

export default ConversationRepository;
