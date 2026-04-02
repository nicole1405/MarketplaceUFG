/**
 * Chat Controller
 * Manages chat UI with Supabase backend
 */

import { supabase } from '../../lib/supabase.js';
import { EVENTS } from '../../config/events.js';
import { MESSAGES } from '../../config/messages.js';
import { eventBus, toast, UIUtils } from '../../core/utils/index.js';

export class ChatController {
    constructor(chatService, authService) {
        this.chatService = chatService;
        this.authService = authService;
        this.activeConversationId = null;
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.bindEventBus();
        this.setupRealtime();
    }

    setupRealtime() {
        supabase
            .channel('messages-channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const currentUser = this.authService.getCurrentUser();
                if (payload.new.remitente_id !== currentUser?.id) {
                    this.updateBadge();
                    this.renderConversations();
                }
            })
            .subscribe();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.bindEventBus();
    }

    cacheElements() {
        this.elements = {
            listaConversaciones: document.getElementById('lista-conversaciones'),
            chatEmpty: document.getElementById('chat-empty'),
            chatActivo: document.getElementById('chat-activo'),
            chatTitulo: document.getElementById('chat-titulo'),
            chatSubtitulo: document.getElementById('chat-subtitulo'),
            chatMensajes: document.getElementById('chat-mensajes'),
            formEnviarMensaje: document.getElementById('form-enviar-mensaje'),
            chatInput: document.getElementById('chat-input'),
            badgeMensajes: document.getElementById('badge-mensajes')
        };
    }

    bindEvents() {
        if (this.elements.formEnviarMensaje) {
            this.elements.formEnviarMensaje.addEventListener('submit', (e) => this.handleSendMessage(e));
        }

        eventBus.on(EVENTS.CHAT.CONVERSATION_STARTED, (data) => {
            this.handleNewConversationFromProduct(data);
        });
    }

    bindEventBus() {
        eventBus.on(EVENTS.CHAT.MESSAGE_SENT, () => {
            this.updateBadge();
        });
    }

    async renderConversations() {
        const container = this.elements.listaConversaciones;
        if (!container) return;

        try {
            const conversations = await this.chatService.getConversations();

            if (conversations.length === 0) {
                container.innerHTML = `<p class="empty-message">${MESSAGES.CHAT.NO_CONVERSATIONS}</p>`;
                this.updateBadge(0);
                return;
            }

            container.innerHTML = '';
            conversations.forEach(conv => {
                const item = this.createConversationItem(conv);
                container.appendChild(item);
            });

            this.updateBadge();
        } catch (error) {
            console.error('Error loading conversations:', error);
            container.innerHTML = `<p class="empty-message">Error al cargar conversaciones</p>`;
        }
    }

    createConversationItem(conversation) {
        const item = document.createElement('div');
        item.className = 'conversacion-item';
        
        if (this.activeConversationId === conversation.id) {
            item.classList.add('active');
        }

        const currentUser = this.authService.getCurrentUser();
        const otherUser = conversation.comprador_id === currentUser.id 
            ? conversation.vendedor 
            : conversation.comprador;

        const lastText = 'Nueva conversación';
        
        const showBadge = false;

        item.innerHTML = `
            <div class="conversacion-producto">${UIUtils.escapeHtml(conversation.producto?.nombre || 'Producto')}</div>
            <div class="conversacion-usuario">Con: ${UIUtils.escapeHtml(otherUser?.nombre || 'Usuario')}</div>
            <div class="conversacion-ultimo">${UIUtils.escapeHtml(lastText)}</div>
        `;

        item.addEventListener('click', () => this.openChat(conversation));

        return item;
    }

    async openChat(conversation) {
        this.activeConversationId = conversation.id;

        if (this.elements.chatEmpty) {
            this.elements.chatEmpty.style.display = 'none';
        }
        if (this.elements.chatActivo) {
            this.elements.chatActivo.style.display = 'flex';
        }

        const currentUser = this.authService.getCurrentUser();
        const otherUser = conversation.comprador_id === currentUser.id 
            ? conversation.vendedor 
            : conversation.comprador;

        if (this.elements.chatTitulo) {
            this.elements.chatTitulo.textContent = conversation.producto?.nombre || 'Producto';
        }
        if (this.elements.chatSubtitulo) {
            this.elements.chatSubtitulo.textContent = `Conversación con ${otherUser?.nombre || 'Usuario'}`;
        }

        this.renderMessages(conversation);
        this.renderConversations();
        this.updateBadge();

        setTimeout(() => UIUtils.scrollToBottom(this.elements.chatMensajes), 100);

        eventBus.emit(EVENTS.CHAT.CONVERSATION_OPENED, conversation);
    }

    async renderMessages(conversation = null) {
        const container = this.elements.chatMensajes;
        if (!container) return;

        if (!conversation) {
            conversation = await this.chatService.getConversation(this.activeConversationId);
        }
        
        if (!conversation) return;

        try {
            const messages = await this.chatService.getMessages(conversation.id);
            
            container.innerHTML = '';
            const currentUser = this.authService.getCurrentUser();

            messages.forEach(message => {
                const bubble = this.createMessageBubble(message, message.remitente_id === currentUser.id);
                container.appendChild(bubble);
            });

            await this.chatService.markAsRead(conversation.id);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    createMessageBubble(message, isOwn) {
        const bubble = document.createElement('div');
        bubble.className = `mensaje-bubble ${isOwn ? 'mensaje-enviado' : 'mensaje-recibido'}`;

        const time = new Date(message.created_at).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        bubble.innerHTML = `
            <div>${UIUtils.escapeHtml(message.texto)}</div>
            <div class="mensaje-info">
                <span>${time}</span>
            </div>
        `;

        return bubble;
    }

    async handleSendMessage(event) {
        event.preventDefault();

        if (!this.activeConversationId) return;

        const input = this.elements.chatInput;
        const texto = input?.value.trim();

        if (!texto) return;

        const result = await this.chatService.sendMessage(this.activeConversationId, texto);

        if (result.success) {
            this.renderMessages();
            input.value = '';
            UIUtils.scrollToBottom(this.elements.chatMensajes);
            eventBus.emit(EVENTS.CHAT.MESSAGE_SENT, result.conversation);
        } else {
            toast.error(result.error);
        }
    }

    async handleNewConversationFromProduct({ product, mensaje }) {
        const sellerId = product.vendedor_id || product.vendedor?.user_id;
        
        const result = await this.chatService.createConversation(product.id, sellerId);

        if (result.success) {
            await this.chatService.sendMessage(result.conversation.id, mensaje);
            toast.success('Conversación iniciada');
            
            eventBus.emit(EVENTS.UI.VIEW_CHANGED, 'mensajes');
            
            setTimeout(() => {
                this.openChat(result.conversation);
            }, 100);
        } else {
            toast.error(result.error);
        }
    }

    closeChat() {
        this.activeConversationId = null;

        if (this.elements.chatEmpty) {
            this.elements.chatEmpty.style.display = 'flex';
        }
        if (this.elements.chatActivo) {
            this.elements.chatActivo.style.display = 'none';
        }

        this.renderConversations();
        eventBus.emit(EVENTS.CHAT.CONVERSATION_CLOSED);
    }

    async updateBadge(count = null) {
        const badge = this.elements.badgeMensajes;
        if (!badge) return;

        if (count === null) {
            try {
                count = await this.chatService.getUnreadCount();
            } catch (error) {
                count = 0;
            }
        }

        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

export default ChatController;
