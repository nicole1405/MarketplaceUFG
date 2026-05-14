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
            forgotForm: document.getElementById('forgot-form'),
            loginEmail: document.getElementById('login-email'),
            loginPassword: document.getElementById('login-password'),
            registerNombre: document.getElementById('register-nombre'),
            registerEmail: document.getElementById('register-email'),
            registerPassword: document.getElementById('register-password'),
            registerPasswordConfirm: document.getElementById('register-password-confirm'),
            forgotEmail: document.getElementById('forgot-email'),

            userProfile: document.getElementById('user-profile'),
            userAvatar: document.getElementById('user-avatar'),
            userName: document.getElementById('user-name'),
            
            modalPerfil: document.getElementById('modal-perfil'),
            formPerfil: document.getElementById('form-perfil'),
            perfilNombre: document.getElementById('perfil-nombre'),
            perfilEmail: document.getElementById('perfil-email'),
            perfilAvatar: document.getElementById('perfil-avatar'),
            perfilAvatarPreview: document.getElementById('perfil-avatar-preview'),
            btnEliminarFoto: document.getElementById('btn-eliminar-foto'),
            perfilPassword: document.getElementById('perfil-password'),
            perfilPasswordConfirm: document.getElementById('perfil-password-confirm'),
            btnChangePassword: document.getElementById('btn-change-password'),
            // Reset password form (custom flow, no Supabase emails)
            resetForm: document.getElementById('reset-form'),
            resetPassword: document.getElementById('reset-password'),
            resetPasswordConfirm: document.getElementById('reset-password-confirm'),
            linkBackToLoginFromReset: document.getElementById('link-back-to-login-from-reset')
        };
    }

    bindEvents() {
        // Forms
        const loginFormElement = this.elements.loginForm?.querySelector('form');
        const registerFormElement = this.elements.registerForm?.querySelector('form');
        const forgotFormElement = this.elements.forgotForm?.querySelector('form');

        if (loginFormElement) {
            loginFormElement.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (registerFormElement) {
            registerFormElement.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (forgotFormElement) {
            forgotFormElement.addEventListener('submit', (e) => this.handleForgotPassword(e));
        }

        const resetFormElement = this.elements.resetForm?.querySelector('form');
        if (resetFormElement) {
            resetFormElement.addEventListener('submit', (e) => this.handleResetPassword(e));
        }

        // Links para cambiar entre formularios
        const switchToRegisterLink = document.getElementById('link-to-register');
        const switchToLoginLink = document.getElementById('link-to-login');
        const switchToForgotLink = document.getElementById('link-forgot-password');
        const backToLoginFromForgot = document.getElementById('link-back-to-login');

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

        if (switchToForgotLink) {
            switchToForgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPassword();
            });
        }

        if (backToLoginFromForgot) {
            backToLoginFromForgot.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLogin();
            });
        }

        if (this.elements.linkBackToLoginFromReset) {
            this.elements.linkBackToLoginFromReset.addEventListener('click', (e) => {
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

        // Change password
        if (this.elements.btnChangePassword) {
            this.elements.btnChangePassword.addEventListener('click', () => this.handleChangePassword());
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
        } else if (result.needsConfirmation) {
            // Show confirmation error with resend option
            this.showEmailConfirmationError(email);
        } else {
            toast.error(result.error);
        }
    }

    showEmailConfirmationError(email) {
        const loginForm = this.elements.loginForm?.querySelector('form');
        if (!loginForm) return;

        // Remove existing confirmation message
        const existingMsg = document.getElementById('email-confirm-error');
        if (existingMsg) existingMsg.remove();

        const msgDiv = document.createElement('div');
        msgDiv.id = 'email-confirm-error';
        msgDiv.className = 'auth-confirm-message';
        msgDiv.innerHTML = `
            <div class="confirm-error-content">
                <p>${MESSAGES.AUTH.LOGIN_EMAIL_NOT_CONFIRMED}</p>
                <button type="button" id="btn-resend-confirmation" class="btn-link">Reenviar correo de confirmacion</button>
                <span id="resend-status" style="display:none; color: var(--success); font-size: 0.85rem;"></span>
            </div>
        `;

        // Insert before the submit button
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.parentNode.insertBefore(msgDiv, submitBtn);
        } else {
            loginForm.appendChild(msgDiv);
        }

        const resendBtn = document.getElementById('btn-resend-confirmation');
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                resendBtn.disabled = true;
                resendBtn.textContent = 'Enviando...';
                const result = await this.authService.resendConfirmation(email);
                const status = document.getElementById('resend-status');
                if (status) {
                    status.style.display = 'block';
                    status.textContent = result.success 
                        ? MESSAGES.AUTH.RESEND_CONFIRMATION_SUCCESS 
                        : result.error;
                }
                setTimeout(() => {
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Reenviar correo de confirmacion';
                }, 30000); // Disable for 30s to avoid spam
            });
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
            // Send confirmation email via Resend
            const emailResult = await this.authService.sendConfirmationEmail(email, nombre);
            
            if (emailResult.success) {
                if (emailResult.localLink) {
                    this.showRegistrationConfirmation(email, emailResult.localLink);
                } else {
                    this.showRegistrationConfirmation(email);
                }
            } else {
                // Registration worked but email failed
                toast.error('Cuenta creada pero no se pudo enviar el correo de confirmación.');
                this.showLogin();
                this.clearRegisterForm();
            }
        } else {
            toast.error(result.error);
        }
    }

    showRegistrationConfirmation(email, localLink) {
        const registerForm = this.elements.registerForm;
        if (!registerForm) return;

        const formElement = registerForm.querySelector('form');
        const switchLink = registerForm.querySelector('.auth-switch');
        
        if (formElement) formElement.style.display = 'none';
        if (switchLink) switchLink.style.display = 'none';

        const existing = document.getElementById('registration-confirmed');
        if (existing) existing.remove();

        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'registration-confirmed';
        confirmDiv.className = 'auth-confirm-message';

        if (localLink) {
            confirmDiv.innerHTML = `
                <div class="confirm-success-content">
                    <span class="confirm-icon">🔧</span>
                    <h3>Modo Desarrollo</h3>
                    <p>Hacé clic para confirmar tu cuenta:</p>
                    <p><a href="${localLink}" class="btn-primary" style="display:inline-block;padding:12px 24px;margin-top:10px;text-decoration:none;border-radius:8px;">Confirmar mi cuenta</a></p>
                    <p style="font-size:0.8rem;margin-top:0.75rem;word-break:break-all;color:var(--text-light);">${localLink}</p>
                    <button type="button" id="btn-back-to-login" class="btn-primary" style="margin-top: 1rem;">Volver a Iniciar Sesión</button>
                </div>
            `;
        } else {
            confirmDiv.innerHTML = `
                <div class="confirm-success-content">
                    <span class="confirm-icon">📧</span>
                    <h3>Revisá tu correo</h3>
                    <p>Te enviamos un link de confirmación a <strong>${UIUtils.escapeHtml(email)}</strong>.</p>
                    <p>Hacé clic en el link para activar tu cuenta y después iniciá sesión.</p>
                    <button type="button" id="btn-back-to-login" class="btn-primary" style="margin-top: 1rem;">Volver a Iniciar Sesión</button>
                </div>
            `;
        }

        registerForm.appendChild(confirmDiv);

        document.getElementById('btn-back-to-login')?.addEventListener('click', () => {
            this.showLogin();
        });
    }
            const result = await this.authService.resendConfirmation(email);
            const status = document.getElementById('resend-register-status');
            if (status) {
                status.style.display = 'block';
                status.textContent = result.success 
                    ? MESSAGES.AUTH.RESEND_CONFIRMATION_SUCCESS 
                    : result.error;
            }
            setTimeout(() => {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = 'Reenviar correo';
                }
            }, 30000);
        });
    }

    async checkSession() {
        const hash = window.location.hash;

        // Custom email confirmation link
        if (hash && hash.startsWith('#confirm-email/')) {
            const token = hash.split('#confirm-email/')[1];
            if (token) {
                const result = await this.authService.confirmEmailWithToken(token);
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.error);
                }
                // Clean the hash and show login
                window.location.hash = '';
                this.showLoginScreen();
                return false;
            }
        }

        // Custom password reset link
            const token = hash.split('#reset-password/')[1];
            if (token) {
                this._pendingResetToken = token;
                this.showLoginScreen();
                this.showResetPassword();
                return false;
            }
        }

        // Check if this was a password recovery login (old Supabase flow)
        const wasRecovery = sessionStorage.getItem('ufg_recovery_flow') === 'true';
        sessionStorage.removeItem('ufg_recovery_flow');

        const hasSession = await this.authService.initialize();
        if (hasSession) {
            if (wasRecovery) {
                toast.success('Iniciaste sesión con el link de recuperación. Podés cambiar tu contraseña desde tu perfil.');
            }
            this.showApp();
            eventBus.emit(EVENTS.AUTH.SESSION_RESTORED, this.authService.getCurrentUser());
            return true;
        }
        return false;
    }

    async handleForgotPassword(event) {
        event.preventDefault();
        
        const email = this.elements.forgotEmail?.value.trim().toLowerCase();
        if (!email) {
            toast.error('Ingresá tu correo electrónico');
            return;
        }

        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';
        }

        // Usar nuestro propio sistema de reset (sin Supabase emails)
        const result = await this.authService.requestPasswordReset(email);
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Link de Recuperación';
        }
        
        if (result.success) {
            if (result.localLink) {
                // Show local dev link
                this.showForgotConfirmation(email, result.localLink);
            } else {
                this.showForgotConfirmation(email);
            }
        } else {
            toast.error(result.error);
        }
    }

    showRateLimitError(message) {
        const forgotForm = this.elements.forgotForm;
        if (!forgotForm) return;

        // Remove existing rate limit message
        const existing = document.getElementById('rate-limit-error');
        if (existing) existing.remove();

        const errorDiv = document.createElement('div');
        errorDiv.id = 'rate-limit-error';
        errorDiv.className = 'auth-confirm-message';
        errorDiv.style.cssText = 'margin-top: 1rem;';
        errorDiv.innerHTML = `
            <div class="confirm-error-content">
                <p>⏱️ ${UIUtils.escapeHtml(message)}</p>
                <p style="font-size:0.8rem; color:#666; margin-top:0.5rem;">Esperá unos minutos y volvé a intentarlo.</p>
            </div>
        `;

        const form = forgotForm.querySelector('form');
        if (form) {
            form.appendChild(errorDiv);
        }
    }

    showForgotConfirmation(email, localLink) {
        const forgotForm = this.elements.forgotForm;
        if (!forgotForm) return;

        const formEl = forgotForm.querySelector('form');
        const switchLink = forgotForm.querySelector('.auth-switch');
        
        if (formEl) formEl.style.display = 'none';
        if (switchLink) switchLink.style.display = 'none';

        const existing = document.getElementById('forgot-confirmed');
        if (existing) existing.remove();

        const confirmDiv = document.createElement('div');
        confirmDiv.id = 'forgot-confirmed';
        confirmDiv.className = 'auth-confirm-message';

        if (localLink) {
            // Development mode - show clickable link
            confirmDiv.innerHTML = `
                <div class="confirm-success-content">
                    <span class="confirm-icon">🔧</span>
                    <h3>Modo Desarrollo</h3>
                    <p>Hacé clic en el link para restablecer tu contraseña:</p>
                    <p><a href="${localLink}" class="btn-primary" style="display:inline-block;padding:12px 24px;margin-top:10px;text-decoration:none;border-radius:8px;">Restablecer Contraseña</a></p>
                    <p style="font-size:0.8rem;margin-top:0.75rem;word-break:break-all;color:var(--text-light);">${localLink}</p>
                    <button type="button" id="btn-back-to-login-from-forgot" class="btn-primary" style="margin-top: 1rem;">Volver a Iniciar Sesión</button>
                </div>
            `;
        } else {
            confirmDiv.innerHTML = `
                <div class="confirm-success-content">
                    <span class="confirm-icon">📧</span>
                    <h3>Revisá tu correo</h3>
                    <p>Te enviamos un link de recuperación a <strong>${UIUtils.escapeHtml(email)}</strong>.</p>
                    <p>Hacé clic en el link para restablecer tu contraseña.</p>
                    <button type="button" id="btn-back-to-login-from-forgot" class="btn-primary" style="margin-top: 1rem;">Volver a Iniciar Sesión</button>
                </div>
            `;
        }

        forgotForm.appendChild(confirmDiv);

        document.getElementById('btn-back-to-login-from-forgot')?.addEventListener('click', () => {
            this.showLogin();
        });
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
        if (this.elements.forgotForm) {
            this.elements.forgotForm.style.display = 'none';
        }
    }

    showRegister() {
        if (this.elements.loginForm) {
            this.elements.loginForm.style.display = 'none';
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.style.display = 'block';
        }
        if (this.elements.forgotForm) {
            this.elements.forgotForm.style.display = 'none';
        }
    }

    showForgotPassword() {
        if (this.elements.loginForm) {
            this.elements.loginForm.style.display = 'none';
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.style.display = 'none';
        }
        if (this.elements.forgotForm) {
            const formEl = this.elements.forgotForm.querySelector('form');
            const switchLink = this.elements.forgotForm.querySelector('.auth-switch');
            if (formEl) formEl.style.display = '';
            if (switchLink) switchLink.style.display = '';
            const existing = document.getElementById('forgot-confirmed');
            if (existing) existing.remove();
            
            this.elements.forgotForm.style.display = 'block';
        }
        if (this.elements.resetForm) {
            this.elements.resetForm.style.display = 'none';
        }
    }

    showResetPassword() {
        if (this.elements.loginForm) this.elements.loginForm.style.display = 'none';
        if (this.elements.registerForm) this.elements.registerForm.style.display = 'none';
        if (this.elements.forgotForm) this.elements.forgotForm.style.display = 'none';
        if (this.elements.resetForm) this.elements.resetForm.style.display = 'block';
    }

    async handleResetPassword(event) {
        event.preventDefault();
        
        const password = this.elements.resetPassword?.value;
        const confirm = this.elements.resetPasswordConfirm?.value;

        if (!password || password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirm) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (!this._pendingResetToken) {
            toast.error('Token de reset inválido. Solicita un nuevo correo.');
            return;
        }

        const btn = event.target.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Actualizando...'; }

        const result = await this.authService.resetPasswordWithToken(this._pendingResetToken, password);
        
        if (btn) { btn.disabled = false; btn.textContent = 'Actualizar Contraseña'; }

        if (result.success) {
            toast.success(result.message);
            this._pendingResetToken = null;
            this.showLogin();
            if (this.elements.resetForm?.querySelector('form')) {
                this.elements.resetForm.querySelector('form').reset();
            }
        } else {
            toast.error(result.error);
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
        // Remove confirmation message if present
        const existing = document.getElementById('registration-confirmed');
        if (existing) existing.remove();
        const formEl = this.elements.registerForm?.querySelector('form');
        const switchLink = this.elements.registerForm?.querySelector('.auth-switch');
        if (formEl) formEl.style.display = '';
        if (switchLink) switchLink.style.display = '';
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

    async handleChangePassword() {
        const password = this.elements.perfilPassword?.value;
        const confirm = this.elements.perfilPasswordConfirm?.value;

        if (!password || password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirm) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        const btn = this.elements.btnChangePassword;
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Actualizando...';
        }

        const result = await this.authService.updatePassword(password);

        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Actualizar Contraseña';
        }

        if (result.success) {
            toast.success('Contraseña actualizada correctamente');
            if (this.elements.perfilPassword) this.elements.perfilPassword.value = '';
            if (this.elements.perfilPasswordConfirm) this.elements.perfilPasswordConfirm.value = '';
        } else {
            toast.error(result.error);
        }
    }
}

export default AuthController;
