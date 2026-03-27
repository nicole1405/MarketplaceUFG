/**
 * Controlador de Autenticación
 * Maneja la UI relacionada con login/registro
 */

import { EVENTS } from '../../config/events.js';
import { MESSAGES } from '../../config/messages.js';
import { eventBus, toast, UIUtils } from '../../core/utils/index.js';

export class AuthController {
    constructor(authService, storageService) {
        this.authService = authService;
        this.storageService = storageService;
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
            registerPasswordConfirm: document.getElementById('register-password-confirm'),
            
            userProfile: document.getElementById('user-profile'),
            userAvatar: document.getElementById('user-avatar'),
            userName: document.getElementById('user-name'),
            
            modalPerfil: document.getElementById('modal-perfil'),
            formPerfil: document.getElementById('form-perfil'),
            perfilNombre: document.getElementById('perfil-nombre'),
            perfilEmail: document.getElementById('perfil-email'),
            perfilAvatar: document.getElementById('perfil-avatar'),
            perfilAvatarPreview: document.getElementById('perfil-avatar-preview'),
            btnEliminarFoto: document.getElementById('btn-eliminar-foto')
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

        // Links para cambiar entre login y registro
        const switchToRegisterLink = document.getElementById('link-to-register');
        const switchToLoginLink = document.getElementById('link-to-login');

        if (switchToRegisterLink) {
            switchToRegisterLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegister();
            });
        }

        if (switchToLoginLink) {
            switchToLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogin();
            });
        }

        // User profile click
        if (this.elements.userProfile) {
            this.elements.userProfile.addEventListener('click', () => this.openProfileModal());
        }

        // Profile form
        if (this.elements.formPerfil) {
            this.elements.formPerfil.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        // Profile avatar upload
        if (this.elements.perfilAvatar) {
            this.elements.perfilAvatar.addEventListener('change', (e) => this.handleProfileImageSelect(e));
        }

        // Delete profile photo
        if (this.elements.btnEliminarFoto) {
            this.elements.btnEliminarFoto.addEventListener('click', () => this.handleDeleteProfilePhoto());
        }

        // Close modal on backdrop click
        if (this.elements.modalPerfil) {
            this.elements.modalPerfil.addEventListener('click', (e) => {
                if (e.target === this.elements.modalPerfil) {
                    this.closeProfileModal();
                }
            });
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

    updateUserDisplay(user, profile) {
        const nombre = profile?.nombre || user?.nombre || user?.email?.split('@')[0] || 'Usuario';
        const avatarUrl = profile?.avatar_url || '';
        
        const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjOTk5Ij48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyNSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iOTAiIHI9IjIwIiBmaWxsPSIjZmZmIi8+PC9zdmc+';
        
        const userNameEl = document.getElementById('user-name');
        const userAvatarEl = document.getElementById('user-avatar');
        
        if (userNameEl) {
            userNameEl.textContent = nombre;
        }
        
        if (userAvatarEl) {
            userAvatarEl.src = avatarUrl || defaultAvatar;
        }
    }

    openProfileModal() {
        const user = this.authService.getCurrentUser();
        const profile = this.authService.getCurrentProfile();
        
        if (!user) return;
        
        const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjOTk5Ij48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyNSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iOTAiIHI9IjIwIiBmaWxsPSIjZmZmIi8+PC9zdmc+';
        
        if (this.elements.perfilNombre) {
            this.elements.perfilNombre.value = profile?.nombre || user.nombre || '';
        }
        if (this.elements.perfilEmail) {
            this.elements.perfilEmail.value = user.email || '';
        }
        if (this.elements.perfilAvatarPreview) {
            this.elements.perfilAvatarPreview.src = profile?.avatar_url || defaultAvatar;
        }
        
        this.profileImageFile = null;
        this.deleteAvatar = false;
        
        if (this.elements.modalPerfil) {
            this.elements.modalPerfil.style.display = 'block';
        }
    }

    closeProfileModal() {
        if (this.elements.modalPerfil) {
            this.elements.modalPerfil.style.display = 'none';
        }
        this.profileImageFile = null;
        this.deleteAvatar = false;
    }

    handleProfileImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
            return;
        }
        
        const maxSizeMB = 2;
        if (file.size > maxSizeMB * 1024 * 1024) {
            toast.error(`La imagen no puede exceder ${maxSizeMB}MB`);
            return;
        }
        
        this.profileImageFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.elements.perfilAvatarPreview) {
                this.elements.perfilAvatarPreview.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
    }

    async handleProfileUpdate(event) {
        event.preventDefault();
        
        const nombre = this.elements.perfilNombre?.value.trim();
        if (!nombre) {
            toast.error('El nombre es requerido');
            return;
        }
        
        let avatarUrl = null;
        const user = this.authService.getCurrentUser();
        
        if (this.profileImageFile && user) {
            try {
                const uploadResult = await this.storageService.uploadImage(
                    this.profileImageFile,
                    user.id
                );
                avatarUrl = uploadResult.url;
            } catch (error) {
                toast.error('Error al subir imagen: ' + error.message);
                return;
            }
        }
        
        const result = await this.authService.updateProfile({
            nombre,
            avatar_url: avatarUrl,
            delete_avatar: this.deleteAvatar
        });
        
        if (result.success) {
            toast.success('Perfil actualizado correctamente');
            this.updateUserDisplay(user, result.profile);
            this.closeProfileModal();
            this.deleteAvatar = false;
            eventBus.emit(EVENTS.PROFILE.UPDATED, result.profile);
        } else {
            toast.error(result.error);
        }
    }

    async handleDeleteProfilePhoto() {
        this.deleteAvatar = true;
        this.profileImageFile = null;
        
        const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjOTk5Ij48Y2lyY2xlIGN4PSI1MCIgY3k9IjM1IiByPSIyNSIgZmlsbD0iI2ZmZiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iOTAiIHI9IjIwIiBmaWxsPSIjZmZmIi8+PC9zdmc+';
        
        if (this.elements.perfilAvatarPreview) {
            this.elements.perfilAvatarPreview.src = defaultAvatar;
        }
        
        if (this.elements.perfilAvatar) {
            this.elements.perfilAvatar.value = '';
        }
        
        toast.info('Foto eliminada. Guarda los cambios para aplicar.');
    }
}

export default AuthController;
