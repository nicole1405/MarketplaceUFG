/**
 * Centralized Configuration
 * Single Responsibility: One place for all configuration
 */

export const CONFIG = {
    APP: {
        NAME: 'Marketplace UFG',
        VERSION: '2.0.0',
        DESCRIPTION: 'Conectando emprendedores universitarios',
        PUBLIC_URL: 'https://marketplace-ufg.netlify.app'
    },
    
    SUPABASE: {
        URL: 'https://rdxbldkxokcltsayhnpl.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeGJsZGt4b2tjbHRzYXlobnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNDI5MjcsImV4cCI6MjA4OTYxODkyN30.TyhJrLCC6q3czpZyz3EoGOtra9_LSpZ00189d3zszgE',
        STORAGE_BUCKET: 'fotos_anuncios'
    },

    EMAILJS: {
        /**
         * EmailJS configuration for sending emails without backend.
         * Registrate gratis en https://www.emailjs.com
         * 
         * Paso 1: Crear cuenta y conectar un servicio de email
         * Paso 2: Crear un template "confirm" con variables:
         *   {{to_name}}, {{to_email}}, {{confirm_url}}
         * Paso 3: Crear un template "reset" con variables:
         *   {{to_name}}, {{to_email}}, {{reset_url}}
         * Paso 4: Copiar acá los IDs
         */
        SERVICE_ID: '',        // Ej: 'service_abc123'
        TEMPLATE_CONFIRM: '',  // Ej: 'template_confirm_xyz'
        TEMPLATE_RESET: '',    // Ej: 'template_reset_xyz'
        PUBLIC_KEY: ''         // Ej: 'user_abc123'
    },
    
    VALIDATION: {
        MIN_PASSWORD_LENGTH: 6,
        MAX_PRODUCT_NAME_LENGTH: 255,
        MAX_DESCRIPTION_LENGTH: 2000,
        ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        MAX_IMAGE_SIZE_MB: 5
    },
    
    UI: {
        TOAST_DURATION: 3000,
        DEBOUNCE_DELAY: 300,
        ANIMATION_DURATION: 300
    }
};

export default CONFIG;
