/**
 * Main Application Class
 * Coordinates all components using Dependency Injection
 * Updated for Supabase backend
 */

import { CONFIG } from './config/config.js';
import { EVENTS } from './config/events.js';
import { 
    ProfileRepository, 
    ProductRepository, 
    ConversationRepository, 
    MessageRepository,
    CategoryRepository,
    SessionRepository 
} from './lib/supabase-repositories/index.js';
import { 
    AuthService, 
    ProductService, 
    ChatService,
    CategoryService,
    StorageService
} from './lib/supabase-services/index.js';
import { eventBus, toast } from './core/utils/index.js';
import { AuthController } from './features/auth/AuthController.js';
import { ProductController } from './features/products/ProductController.js';
import { ChatController } from './features/chat/ChatController.js';

class Application {
    constructor() {
        this.repositories = {};
        this.services = {};
        this.controllers = {};
        this.currentView = 'productos';
        this.unsubscribers = [];
    }

    async initialize() {
        console.log(`Iniciando ${CONFIG.APP.NAME} v${CONFIG.APP.VERSION}`);

        this.initializeRepositories();
        this.initializeServices();
        this.initializeControllers();
        this.bindEvents();

        // Load categories regardless of login status
        await this.loadCategories();

        const hasSession = await this.controllers.auth.checkSession();
        
        if (hasSession) {
            this.onAuthenticated();
        }

        console.log('Aplicacion inicializada correctamente');
    }

    initializeRepositories() {
        this.repositories = {
            profiles: new ProfileRepository(),
            products: new ProductRepository(),
            conversations: new ConversationRepository(),
            messages: new MessageRepository(),
            categories: new CategoryRepository(),
            session: new SessionRepository()
        };
    }

    initializeServices() {
        const authService = new AuthService(
            this.repositories.profiles,
            this.repositories.session
        );
        
        this.services = {
            auth: authService,
            categories: new CategoryService(
                this.repositories.categories
            ),
            storage: new StorageService(),
            products: new ProductService(
                this.repositories.products,
                this.repositories.profiles,
                authService
            ),
            chat: new ChatService(
                this.repositories.conversations,
                this.repositories.messages,
                this.repositories.products,
                authService
            )
        };
    }

    initializeControllers() {
        this.controllers = {
            auth: new AuthController(this.services.auth, this.services.storage),
            products: new ProductController(this.services.products, this.services.categories, this.services.storage, this.services.auth),
            chat: new ChatController(this.services.chat, this.services.auth)
        };
    }

    bindEvents() {
        eventBus.on(EVENTS.AUTH.LOGIN, () => this.onAuthenticated());
        eventBus.on(EVENTS.AUTH.LOGOUT, () => this.onLogout());
        eventBus.on(EVENTS.AUTH.SESSION_RESTORED, () => this.onAuthenticated());
        eventBus.on(EVENTS.UI.VIEW_CHANGED, (view) => this.switchView(view));
        
        this.bindNavigationButtons();
    }

    bindNavigationButtons() {
        const navButtons = {
            'nav-productos': 'productos',
            'nav-vendedor': 'vendedor',
            'nav-mensajes': 'mensajes'
        };

        for (const [id, view] of Object.entries(navButtons)) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => this.switchView(view));
            }
        }
    }

    async loadCategories() {
        try {
            const categories = await this.services.categories.getAll();
            window.categories = categories;
            
            // Update product controller with categories
            if (this.controllers.products) {
                this.controllers.products.updateCategories(categories);
            }
            
            return categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            return [];
        }
    }

    async onAuthenticated() {
        const user = this.services.auth.getCurrentUser();
        const profile = this.services.auth.getCurrentProfile();
        
        const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjOTk5Ij48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyNSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iOTAiIHI9IjIwIiBmaWxsPSIjZmZmIi8+PC9zdmc+';
        
        const userNameEl = document.getElementById('user-name');
        const userAvatarEl = document.getElementById('user-avatar');
        
        if (userNameEl && user) {
            const nombre = profile?.nombre || user.nombre || user.email.split('@')[0] || 'Usuario';
            userNameEl.textContent = nombre;
        }
        
        if (userAvatarEl) {
            const avatarUrl = profile?.avatar_url || '';
            userAvatarEl.src = avatarUrl || defaultAvatar;
        }

        await this.loadCategories();
        
        this.controllers.products.renderProducts();
        this.controllers.chat.renderConversations();
        this.controllers.chat.updateBadge();
        
        this.switchView('productos');
    }

    async onLogout() {
        this.currentView = 'productos';
        
        const userAvatar = document.getElementById('user-avatar');
        const userName = document.getElementById('user-name');
        
        if (userAvatar) {
            userAvatar.src = '';
            userAvatar.style.display = 'none';
        }
        if (userName) {
            userName.textContent = 'Usuario';
        }
    }

    switchView(viewName) {
        const views = ['vista-productos', 'vista-vendedor', 'vista-mensajes'];
        views.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        const targetView = document.getElementById(`vista-${viewName}`);
        if (targetView) {
            targetView.style.display = 'block';
            this.currentView = viewName;

            if (viewName === 'productos') {
                this.controllers.products.renderProducts();
            } else if (viewName === 'vendedor') {
                this.controllers.products.renderMyProducts();
            } else if (viewName === 'mensajes') {
                this.controllers.chat.renderConversations();
                this.controllers.chat.updateBadge();
            }
        }

        this.updateNavigationState(viewName);
    }

    updateNavigationState(activeView) {
        const navMap = {
            'productos': 'nav-productos',
            'vendedor': 'nav-vendedor',
            'mensajes': 'nav-mensajes'
        };

        Object.values(navMap).forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.classList.remove('active');
            }
        });

        const activeBtn = document.getElementById(navMap[activeView]);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    cleanup() {
        this.unsubscribers.forEach(unsub => unsub());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new Application();
    window.app.initialize();
});

window.exportarDatos = async () => {
    console.log('Exportando datos (solo visible en desarrollo)');
};

window.limpiarTodosDatos = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión y limpiar datos locales?')) {
        window.app.services.auth.logout().then(() => {
            location.reload();
        });
    }
};

export default Application;
