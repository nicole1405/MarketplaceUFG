/**
 * Controlador de Autenticación
 * Maneja la UI relacionada con login/registro
 */

import { EVENTS } from '../../config/events.js';
import { MESSAGES } from '../../config/messages.js';
import { eventBus, toast } from '../../core/utils/index.js';

export class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
    }

    cacheElements() {
        this.elements = {
            authScreen: document.getElementById('auth-screen'),
            appContainer: document.getElementById('app-container'),
            loginForm: document.getElementById('login-form'),
            registerForm: document.getElementById('register-form'),
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            registerNombre: document.getElementById('register-nombre'),
            registerEmail: document.getElementById('register-email'),
            registerPassword: document.getElementById('register-password'),
            registerPasswordConfirm: document.getElementById('register-password-confirm')
        };
    }

    bindEvents() {
        // Forms
        const loginFormElement = this.elements.loginForm?.querySelector('form');
        const registerFormElement = this.elements.registerForm?.querySelector('form');

        if (loginFormElement) {
            loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerFormElement) {
            registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Links para cambiar entre login y registro (usando IDs específicos)
        const switchToRegisterLink = document.getElementById('link-to-register');
        const switchToLoginLink = document.getElementById('link-to-login');

        if (switchToRegisterLink) {
            switchToRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clic en Regístrate aquí');
                this.showRegister();
            });
        } else {
            console.error('No se encontró el enlace link-to-register');
        }

        if (switchToLoginLink) {
            switchToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Clic en Inicia sesión aquí');
                this.showLogin();
            });
        } else {
            console.error('No se encontró el enlace link-to-login');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const email = this.elements.loginEmail?.value.trim().toLowerCase();
        const password = this.elements.loginPassword?.value;

        if (!email || !password) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        const result = await this.authService.login(email, password);
        
        if (result.success) {
            toast.success(result.message);
            eventBus.emit(EVENTS.AUTH.LOGIN, result.user);
            this.showApp();
        } else {
            toast.error(result.error);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const nombre = this.elements.registerNombre?.value.trim();
        const email = this.elements.registerEmail?.value.trim().toLowerCase();
        const password = this.elements.registerPassword?.value;
        const passwordConfirm = this.elements.registerPasswordConfirm?.value;

        // Validar contraseñas coincidan
        if (password !== passwordConfirm) {
            toast.error(MESSAGES.AUTH.PASSWORD_MISMATCH);
            return;
        }

        const result = await this.authService.register({
            nombre,
            email,
            password
        });

        if (result.success) {
            toast.success(result.message);
            this.showLogin();
            this.clearRegisterForm();
        } else {
            toast.error(result.error);
        }
    }

    async checkSession() {
        const hasSession = await this.authService.initialize();
        if (hasSession) {
            this.showApp();
            eventBus.emit(EVENTS.AUTH.SESSION_RESTORED, this.authService.getCurrentUser());
            return true;
        }
        return false;
    }

    logout() {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            const result = this.authService.logout();
            toast.success(result.message);
            eventBus.emit(EVENTS.AUTH.LOGOUT);
            this.showLoginScreen();
        }
    }

    showLogin() {
        if (this.elements.loginForm) {
            this.elements.loginForm.style.display = 'block';
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.style.display = 'none';
        }
    }

    showRegister() {
        if (this.elements.loginForm) {
            this.elements.loginForm.style.display = 'none';
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.style.display = 'block';
        }
    }

    showApp() {
        if (this.elements.authScreen) {
            this.elements.authScreen.style.display = 'none';
        }
        if (this.elements.appContainer) {
            this.elements.appContainer.style.display = 'block';
        }
    }

    showLoginScreen() {
        if (this.elements.authScreen) {
            this.elements.authScreen.style.display = 'flex';
        }
        if (this.elements.appContainer) {
            this.elements.appContainer.style.display = 'none';
        }
        this.showLogin();
    }

    clearRegisterForm() {
        const form = this.elements.registerForm?.querySelector('form');
        if (form) {
            form.reset();
        }
    }

    clearLoginForm() {
        const form = this.elements.loginForm?.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

export default AuthController;
