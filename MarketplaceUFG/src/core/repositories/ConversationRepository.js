/**
 * Repository para Conversaciones
 * Encapsula la lógica de persistencia de conversaciones
 */

import { IRepository } from './IRepository.js';
import { Conversation } from '../domain/Conversation.js';
import { CONFIG } from '../../config/config.js';

export class ConversationRepository extends IRepository {
    constructor(storageKey = CONFIG.STORAGE.KEYS.CONVERSATIONS) {
        super();
        this.storageKey = storageKey;
    }

    async getAll() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];
        
        try {
            const parsed = JSON.parse(data);
            return parsed.map(c => Conversation.fromJSON(c));
        } catch (error) {
            console.error('Error parsing conversations:', error);
            return [];
        }
    }

    async getById(id) {
        const conversations = await this.getAll();
        return conversations.find(c => c.id === id) || null;
    }

    async getByUser(email) {
        const conversations = await this.getAll();
        return conversations.filter(c => c.involvesUser(email));
    }

    async getByProduct(productId) {
        const conversations = await this.getAll();
        return conversations.filter(c => c.productoId === productId);
    }

    async create(conversation) {
        const conversations = await this.getAll();
        
        // Verificar si ya existe
        const existing = await this.getById(conversation.id);
        if (existing) {
            // Actualizar en lugar de crear
            return this.update(conversation.id, conversation);
        }
        
        conversations.push(conversation);
        await this.saveAll(conversations);
        return conversation;
    }

    async update(id, updatedConversation) {
        const conversations = await this.getAll();
        const index = conversations.findIndex(c => c.id === id);
        
        if (index === -1) {
            throw new Error('Conversation not found');
        }
        
        conversations[index] = updatedConversation;
        await this.saveAll(conversations);
        return updatedConversation;
    }

    async delete(id) {
        const conversations = await this.getAll();
        const filtered = conversations.filter(c => c.id !== id);
        await this.saveAll(filtered);
        return true;
    }

    async deleteByProduct(productId) {
        const conversations = await this.getAll();
        const filtered = conversations.filter(c => c.productoId !== productId);
        await this.saveAll(filtered);
        return true;
    }

    async saveAll(conversations) {
        localStorage.setItem(this.storageKey, JSON.stringify(conversations.map(c => c.toJSON())));
    }

    async clear() {
        localStorage.removeItem(this.storageKey);
    }

    async getUnreadCountFor(email) {
        const conversations = await this.getByUser(email);
        return conversations.reduce((total, conv) => {
            return total + conv.getUnreadCountFor(email);
        }, 0);
    }

    // Obtener conversación entre usuarios para un producto específico
    async findByParticipants(productId, buyerEmail, sellerEmail) {
        const conversations = await this.getAll();
        return conversations.find(c => 
            c.productoId === productId &&
            c.comprador === buyerEmail &&
            c.vendedor === sellerEmail
        ) || null;
    }
}

export default ConversationRepository;
