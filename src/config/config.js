/**
 * Centralized Configuration
 * Single Responsibility: One place for all configuration
 */

export const CONFIG = {
    APP: {
        NAME: 'Marketplace UFG',
        VERSION: '2.0.0',
        DESCRIPTION: 'Conectando emprendedores universitarios'
    },
    
    SUPABASE: {
        URL: 'https://rdxbldkxokcltsayhnpl.supabase.co',
        ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkeGJsZGt4b2tjbHRzYXlobnBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNDI5MjcsImV4cCI6MjA4OTYxODkyN30.TyhJrLCC6q3czpZyz3EoGOtra9_LSpZ00189d3zszgE',
        STORAGE_BUCKET: 'fotos_anuncios'
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
