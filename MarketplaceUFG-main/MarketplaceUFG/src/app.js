/**
 * Clase principal de la aplicación
 * Aplica DIP: Coordina todos los componentes sin depender de implementaciones concretas
 * Iniciaos repositorios, servicios y controladores, y maneja la navegación y eventos globales
 * También se encarga de cargar el tema, inicializar datos de demostración, y exponer utilidades globales para debugging
 * 
 * La navegación se maneja directamente desde los botones para evitar recursión infinita con eventBus
 * Los eventos de autenticación actualizan la UI y renderizan datos según el estado del usuario
 * El tema se guarda en localStorage para persistencia entre sesiones
 */

import { CONFIG } from './config/config.js';
import { EVENTS } from './config/events.js';
import { 
    UserRepository, 
    ProductRepository, 
    ConversationRepository, 
    SessionRepository   
} from './core/repositories/index.js';
import { 
    AuthService, 
    ProductService, 
    ChatService 
} from './core/services/index.js';
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
    }

    async initialize() {
        console.log(`Iniciando ${CONFIG.APP.NAME} v${CONFIG.APP.VERSION}`);

        this.initializeRepositories();
        this.initializeServices();
        this.initializeControllers();
        this.bindEvents();
        this.loadTheme();
        this.initializeDemoData();

        // Verificar sesión existente
        const hasSession = await this.controllers.auth.checkSession();
        
        if (hasSession) {
            this.onAuthenticated();
        }

        console.log('Aplicación inicializada correctamente');
    }

    initializeRepositories() {
        this.repositories = {
            users: new UserRepository(),
            products: new ProductRepository(),
            conversations: new ConversationRepository(),
            session: new SessionRepository()
        };
    }

    initializeServices() {
        this.services = {
            auth: new AuthService(
                this.repositories.users,
                this.repositories.session
            )
        };

        this.services = {
            ...this.services,
            products: new ProductService(
                this.repositories.products,
                this.services.auth
            ),
            chat: new ChatService(
                this.repositories.conversations,
                this.repositories.products,
                this.services.auth
            )
        };
    }

    initializeControllers() {
        this.controllers = {
            auth: new AuthController(this.services.auth),
            products: new ProductController(this.services.products, this.services.auth),
            chat: new ChatController(this.services.chat, this.services.auth)
        };
    }

    bindEvents() {
        // Eventos de autenticación
        eventBus.on(EVENTS.AUTH.LOGIN, () => this.onAuthenticated());
        eventBus.on(EVENTS.AUTH.LOGOUT, () => this.onLogout());
        
        // No usamos eventBus para navegación para evitar recursión infinita
        // La navegación se maneja directamente desde los botones y onAuthenticated
        // Botones de navegación
        this.bindNavigationButtons();
        this.bindThemeToggle();
    }

    bindThemeToggle() {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        btn.addEventListener('click', () => this.toggleTheme());
    }

    loadTheme() {
        const theme = localStorage.getItem('ufg_marketplace_theme') || 'light';
        this.applyTheme(theme);
    }

    toggleTheme() {
        const current = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        this.applyTheme(next);
    }

    applyTheme(theme) {
        const body = document.body;
        const btn = document.getElementById('theme-toggle');

        body.classList.toggle('dark-theme', theme === 'dark');

        if (btn) {
            // Sólo icono por accesibilidad; texto descriptivo en aria-label
            btn.setAttribute('aria-label', theme === 'dark' ? 'Modo claro' : 'Modo oscuro');
        }

        localStorage.setItem('ufg_marketplace_theme', theme);
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

    async initializeDemoData() {
        const demoProducts = [
            {
                id: Date.now() + 1,
                nombre: 'Laptop Dell Inspiron 15',
                precio: 450.00,
                descripcion: 'Laptop en excelente estado, ideal para estudiantes. Intel Core i5, 8GB RAM, 256GB SSD. Incluye cargador original.',
                vendedor: CONFIG.DEFAULTS.DEMO_USER.email,
                vendedorNombre: CONFIG.DEFAULTS.DEMO_USER.nombre,
                imagen: null,
                fecha: new Date().toISOString(),
                id_categoria: 1,
                categoriaNombre: 'Electrónica'
            },
            {
                id: Date.now() + 2,
                nombre: 'Calculadora Científica Casio',
                precio: 25.00,
                descripcion: 'Calculadora científica Casio FX-991EX, perfecta para ingeniería. Como nueva, con manual incluido.',
                vendedor: CONFIG.DEFAULTS.DEMO_USER.email,
                vendedorNombre: CONFIG.DEFAULTS.DEMO_USER.nombre,
                imagen: null,
                fecha: new Date().toISOString(),
                id_categoria: 1,
                categoriaNombre: 'Electrónica'
            },
            {
                id: Date.now() + 3,
                nombre: 'Libros de Programación',
                precio: 15.00,
                descripcion: 'Pack de 3 libros: Clean Code, JavaScript: The Good Parts, y Design Patterns. En buen estado.',
                vendedor: CONFIG.DEFAULTS.DEMO_USER.email,
                vendedorNombre: CONFIG.DEFAULTS.DEMO_USER.nombre,
                imagen: null,
                fecha: new Date().toISOString(),
                id_categoria: 2,
                categoriaNombre: 'Libros'
            }
        ];

        const { Product } = await import('./core/domain/Product.js');
        await this.services.products.initializeDemoData(
            demoProducts.map(p => Product.fromJSON(p))
        );
    }

    onAuthenticated() {
        const user = this.services.auth.getCurrentUser();
        
        // Actualizar nombre en header
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = `${user.nombre}`;
        }

        // Renderizar datos iniciales
        this.controllers.products.renderProducts();
        this.controllers.chat.renderConversations();
        this.controllers.chat.updateBadge();
        
        // Mostrar vista por defecto
        this.switchView('productos');
    }

    onLogout() {
        this.currentView = 'productos';
    }

    switchView(viewName) {
        // Ocultar todas las vistas
        const views = ['vista-productos', 'vista-vendedor', 'vista-mensajes'];
        views.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Mostrar vista seleccionada
        const targetView = document.getElementById(`vista-${viewName}`);
        if (targetView) {
            targetView.style.display = 'block';
            this.currentView = viewName;

            // Actualizar datos según la vista
            if (viewName === 'productos') {
                this.controllers.products.renderProducts();
            } else if (viewName === 'vendedor') {
                this.controllers.products.renderMyProducts();
            } else if (viewName === 'mensajes') {
                this.controllers.chat.renderConversations();
                this.controllers.chat.updateBadge();
            }
        }

        // Actualizar estado de botones de navegación
        this.updateNavigationState(viewName);

        // No reexportamos VIEW_CHANGED para evitar bucle recursivo entre switchView y el listener
        // eventBus.emit(EVENTS.UI.VIEW_CHANGED, viewName);
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
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new Application();
    window.app.initialize();
});

// Exponer utilidades globales para debugging
window.exportarDatos = () => {
    const data = {
        users: JSON.parse(localStorage.getItem(CONFIG.STORAGE.KEYS.USERS) || '[]'),
        products: JSON.parse(localStorage.getItem(CONFIG.STORAGE.KEYS.PRODUCTS) || '[]'),
        conversations: JSON.parse(localStorage.getItem(CONFIG.STORAGE.KEYS.CONVERSATIONS) || '[]')
    };
    console.log('Datos exportados:', data);
    return data;
};

window.limpiarTodosDatos = () => {
    if (confirm('¿Estás seguro de que deseas eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
        Object.values(CONFIG.STORAGE.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        toast.success('Todos los datos han sido eliminados');
        location.reload();
    }
};

export default Application;
