/**
 * Chat Service for Supabase
 * Manages conversations and messages
 * Security: Users can only access their own conversations
 */

import { supabase } from '../supabase.js';
import { MESSAGES } from '../../config/messages.js';

export class ChatService {
    constructor(conversationRepository, messageRepository, productRepository, authService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.productRepository = productRepository;
        this.authService = authService;
    }

    async getConversations() {
        const user = this.authService.requireAuth();
        return await this.conversationRepository.getByUser(user.id);
    }

    async getConversation(conversationId) {
        return await this.conversationRepository.getById(conversationId);
    }

    async getMessages(conversationId) {
        return await this.messageRepository.getByConversation(conversationId);
    }

    async createConversation(productId, sellerId) {
        const user = this.authService.requireAuth();

        if (user.id === sellerId) {
            return {
                success: false,
                error: 'No puedes iniciar una conversación contigo mismo'
            };
        }

        const product = await this.productRepository.getById(productId);
        if (!product) {
            return {
                success: false,
                error: 'Producto no encontrado'
            };
        }

        try {
            let conversation = await this.conversationRepository.findByParticipants(
                productId,
                user.id,
                sellerId
            );

            if (!conversation) {
                conversation = await this.conversationRepository.create({
                    producto_id: productId,
                    comprador_id: user.id,
                    vendedor_id: sellerId
                });
            }

            return {
                success: true,
                conversation: conversation
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendMessage(conversationId, texto) {
        const user = this.authService.requireAuth();

        if (!texto || texto.trim() === '') {
            return {
                success: false,
                error: 'El mensaje no puede estar vacío'
            };
        }

        try {
            const message = await this.messageRepository.create({
                conversation_id: conversationId,
                remitente_id: user.id,
                texto: texto.trim()
            });

            await this.conversationRepository.update(conversationId, {});

            return {
                success: true,
                message: message
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async markAsRead(conversationId) {
        const user = this.authService.requireAuth();

        try {
            await this.conversationRepository.markMessagesAsRead(conversationId, user.id);
            return {
                success: true
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getUnreadCount() {
        const user = this.authService.requireAuth();
        return await this.conversationRepository.getUnreadCount(user.id);
    }

    async deleteConversation(conversationId) {
        const user = this.authService.requireAuth();
        
        const conversation = await this.conversationRepository.getById(conversationId);
        if (!conversation) {
            return {
                success: false,
                error: 'Conversación no encontrada'
            };
        }

        if (conversation.comprador_id !== user.id && conversation.vendedor_id !== user.id) {
            return {
                success: false,
                error: 'No tienes permiso para eliminar esta conversación'
            };
        }

        try {
            await this.conversationRepository.delete(conversationId);
            return {
                success: true,
                message: 'Conversación eliminada'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default ChatService;
