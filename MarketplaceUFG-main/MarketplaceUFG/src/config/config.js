/**
 * Configuración centralizada de la aplicación
 * Single Responsibility: Un solo lugar para toda la configuración
 */

export const CONFIG = {
    APP: {
        NAME: 'Marketplace UFG',
        VERSION: '1.0.0',
        DESCRIPTION: 'Conectando emprendedores universitarios'
    },
    
    STORAGE: {
        KEYS: {
            USERS: 'ufg_marketplace_users',
            PRODUCTS: 'ufg_marketplace_products',
            CONVERSATIONS: 'ufg_marketplace_conversations',
            SESSION: 'ufg_marketplace_session'
        },
        PREFIX: 'ufg_marketplace_'
    },
    
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_PRODUCT_NAME_LENGTH: 100,
        MAX_DESCRIPTION_LENGTH: 1000,
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        MAX_IMAGE_SIZE_MB: 5
    },
    
    UI: {
        TOAST_DURATION: 3000,
        DEBOUNCE_DELAY: 300,
        ANIMATION_DURATION: 300
    },
    
    DEFAULTS: {
        DEMO_USER: {
            email: 'demo@ufg.edu.sv',
            nombre: 'Usuario Demo'
        }
    }
};

export default CONFIG;
