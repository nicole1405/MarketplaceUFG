/**
 * Servicio de Chat/Conversaciones
 * Encapsula toda la lógica de negocio relacionada con mensajería
 */

import { Conversation } from '../domain/Conversation.js';
import { Message } from '../domain/Message.js';
import { MESSAGES } from '../../config/messages.js';

export class ChatService {
    constructor(conversationRepository, productRepository, authService) {
        this.conversationRepository = conversationRepository;
        this.productRepository = productRepository;
        this.authService = authService;
        this.activeConversation = null;
    }

    async getConversations() {
        const user = this.authService.requireAuth();
        return await this.conversationRepository.getByUser(user.email);
    }

    async startConversation(productId, messageText) {
        const user = this.authService.requireAuth();
        
        const product = await this.productRepository.getById(productId);
        if (!product) {
            return {
                success: false,
                error: 'Producto no encontrado'
            };
        }

        // No permitir conversación consigo mismo
        if (product.belongsTo(user.email)) {
            return {
                success: false,
                error: MESSAGES.PRODUCTS.OWN_PRODUCT
            };
        }

        // Buscar o crear conversación
        let conversation = await this.conversationRepository.findByParticipants(
            productId,
            user.email,
            product.vendedor
        );

        if (!conversation) {
            conversation = Conversation.create({
                productoId: product.id,
                productoNombre: product.nombre,
                comprador: user.email,
                compradorNombre: user.nombre,
                vendedor: product.vendedor,
                vendedorNombre: product.vendedorNombre,
                mensajes: []
            });
        }

        // Agregar mensaje inicial
        const message = Message.create({
            remitente: user.email,
            remitenteNombre: user.nombre,
            texto: messageText
        });

        conversation.addMessage(message);
        await this.conversationRepository.create(conversation);

        return {
            success: true,
            conversation: conversation,
            message: MESSAGES.CHAT.MESSAGE_SENT
        };
    }

    async sendMessage(conversationId, messageText) {
        const user = this.authService.requireAuth();
        
        const conversation = await this.conversationRepository.getById(conversationId);
        if (!conversation) {
            return {
                success: false,
                error: 'Conversación no encontrada'
            };
        }

        if (!conversation.involvesUser(user.email)) {
            return {
                success: false,
                error: 'No tienes acceso a esta conversación'
            };
        }

        const message = Message.create({
            remitente: user.email,
            remitenteNombre: user.nombre,
            texto: messageText
        });

        conversation.addMessage(message);
        await this.conversationRepository.update(conversationId, conversation);

        return {
            success: true,
            conversation: conversation
        };
    }

    async getUnreadCount() {
        const user = this.authService.requireAuth();
        return await this.conversationRepository.getUnreadCountFor(user.email);
    }

    async deleteByProduct(productId) {
        await this.conversationRepository.deleteByProduct(productId);
    }

    setActiveConversation(conversation) {
        this.activeConversation = conversation;
    }

    getActiveConversation() {
        return this.activeConversation;
    }

    clearActiveConversation() {
        this.activeConversation = null;
    }
}

export default ChatService;
