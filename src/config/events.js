/**
 * Eventos globales de la aplicación
 * Centraliza todos los eventos para evitar strings mágicos
 */

export const EVENTS = {
    AUTH: {
        LOGIN: 'auth:login',
        LOGOUT: 'auth:logout',
        REGISTER: 'auth:register',
        SESSION_RESTORED: 'auth:session:restored'
    },
    
    PROFILE: {
        UPDATED: 'profile:updated'
    },
    
    PRODUCTS: {
        CREATED: 'products:created',
        UPDATED: 'products:updated',
        DELETED: 'products:deleted',
        SEARCH: 'products:search',
        FILTERED: 'products:filtered'
    },
    
    ADMIN: {
        PRODUCT_APPROVED: 'admin:product:approved',
        PRODUCT_REJECTED: 'admin:product:rejected',
        ROLE_CHANGED: 'admin:role:changed',
        CATEGORY_CREATED: 'admin:category:created',
        CATEGORY_UPDATED: 'admin:category:updated',
        CATEGORY_DELETED: 'admin:category:deleted'
    },
    
    CHAT: {
        MESSAGE_SENT: 'chat:message:sent',
        MESSAGE_RECEIVED: 'chat:message:received',
        CONVERSATION_STARTED: 'chat:conversation:started',
        CONVERSATION_OPENED: 'chat:conversation:opened',
        CONVERSATION_CLOSED: 'chat:conversation:closed'
    },
    
    UI: {
        VIEW_CHANGED: 'ui:view:changed',
        MODAL_OPENED: 'ui:modal:opened',
        MODAL_CLOSED: 'ui:modal:closed',
        TOAST_SHOW: 'ui:toast:show'
    }
};

export default EVENTS;
