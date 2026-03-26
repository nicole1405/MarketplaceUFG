/**
 * Controlador de Chat
 * Maneja la UI relacionada con mensajería
 */

import { EVENTS } from '../../config/events.js';
import { MESSAGES } from '../../config/messages.js';
import { eventBus, toast, UIUtils } from '../../core/utils/index.js';

export class ChatController {
    constructor(chatService, authService) {
        this.chatService = chatService;
        this.authService = authService;
        this.elements = {};
        this.init();
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
        // Formulario de enviar mensaje
        if (this.elements.formEnviarMensaje) {
            this.elements.formEnviarMensaje.addEventListener('submit', (e) => this.handleSendMessage(e));
        }

        // Escuchar evento de nueva conversación desde producto
        eventBus.on(EVENTS.CHAT.CONVERSATION_STARTED, (data) => {
            this.handleNewConversationFromProduct(data);
        });
    }

    bindEventBus() {
        // Actualizar badge cuando cambian las conversaciones
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

            // Ordenar por última actualización
            conversations.sort((a, b) => 
                new Date(b.ultimaActualizacion) - new Date(a.ultimaActualizacion)
            );

            container.innerHTML = '';
            conversations.forEach(conv => {
                const item = this.createConversationItem(conv);
                container.appendChild(item);
            });

            this.updateBadge();
        } catch (error) {
            container.innerHTML = `<p class="empty-message">${error.message}</p>`;
        }
    }

    createConversationItem(conversation) {
        const item = document.createElement('div');
        item.className = 'conversacion-item';
        
        const activeConversation = this.chatService.getActiveConversation();
        if (activeConversation && activeConversation.id === conversation.id) {
            item.classList.add('active');
        }

        const currentUser = this.authService.getCurrentUser();
        const otherUser = conversation.getOtherParticipant(currentUser.email);
        const lastMessage = conversation.getLastMessage();

        const lastText = lastMessage ? lastMessage.texto : 'Nueva conversación';
        const unreadCount = conversation.getUnreadCountFor(currentUser.email);
        const showBadge = unreadCount > 0 && (!activeConversation || activeConversation.id !== conversation.id);

        item.innerHTML = `
            <div class="conversacion-producto">${UIUtils.escapeHtml(conversation.productoNombre)}</div>
            <div class="conversacion-usuario">Con: ${UIUtils.escapeHtml(otherUser.nombre)}</div>
            <div class="conversacion-ultimo">${UIUtils.escapeHtml(lastText)}</div>
            ${showBadge ? `<span class="conversacion-badge">${unreadCount}</span>` : ''}
        `;

        item.addEventListener('click', () => this.openChat(conversation));

        return item;
    }

    async openChat(conversation) {
        this.chatService.setActiveConversation(conversation);

        // Actualizar UI
        if (this.elements.chatEmpty) {
            this.elements.chatEmpty.style.display = 'none';
        }
        if (this.elements.chatActivo) {
            this.elements.chatActivo.style.display = 'flex';
        }

        // Actualizar header
        const currentUser = this.authService.getCurrentUser();
        const otherUser = conversation.getOtherParticipant(currentUser.email);

        if (this.elements.chatTitulo) {
            this.elements.chatTitulo.textContent = conversation.productoNombre;
        }
        if (this.elements.chatSubtitulo) {
            this.elements.chatSubtitulo.textContent = `Conversación con ${otherUser.nombre}`;
        }

        // Renderizar mensajes
        this.renderMessages();
        
        // Actualizar lista
        this.renderConversations();

        // Scroll al final
        setTimeout(() => UIUtils.scrollToBottom(this.elements.chatMensajes), 100);

        eventBus.emit(EVENTS.CHAT.CONVERSATION_OPENED, conversation);
    }

    renderMessages() {
        const container = this.elements.chatMensajes;
        if (!container) return;

        const conversation = this.chatService.getActiveConversation();
        if (!conversation) return;

        container.innerHTML = '';
        const currentUser = this.authService.getCurrentUser();

        conversation.mensajes.forEach(message => {
            const bubble = this.createMessageBubble(message, message.isFrom(currentUser.email));
            container.appendChild(bubble);
        });
    }

    createMessageBubble(message, isOwn) {
        const bubble = document.createElement('div');
        bubble.className = `mensaje-bubble ${isOwn ? 'mensaje-enviado' : 'mensaje-recibido'}`;

        bubble.innerHTML = `
            <div>${UIUtils.escapeHtml(message.texto)}</div>
            <div class="mensaje-info">
                <span>${message.getFormattedTime()}</span>
            </div>
        `;

        return bubble;
    }

    async handleSendMessage(event) {
        event.preventDefault();

        const conversation = this.chatService.getActiveConversation();
        if (!conversation) return;

        const input = this.elements.chatInput;
        const texto = input?.value.trim();

        if (!texto) return;

        const result = await this.chatService.sendMessage(conversation.id, texto);

        if (result.success) {
            this.renderMessages();
            this.renderConversations();
            input.value = '';
            UIUtils.scrollToBottom(this.elements.chatMensajes);
            eventBus.emit(EVENTS.CHAT.MESSAGE_SENT, result.conversation);
        } else {
            toast.error(result.error);
        }
    }

    async handleNewConversationFromProduct({ product, mensaje }) {
        const result = await this.chatService.startConversation(product.id, mensaje);

        if (result.success) {
            toast.success(result.message);
            this.chatService.setActiveConversation(result.conversation);
            
            // Cambiar a vista de mensajes
            eventBus.emit(EVENTS.UI.VIEW_CHANGED, 'mensajes');
            
            // Renderizar
            setTimeout(() => {
                this.openChat(result.conversation);
            }, 100);
        } else {
            toast.error(result.error);
        }
    }

    closeChat() {
        this.chatService.clearActiveConversation();

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

        badge.textContent = count;
    }
}

export default ChatController;
