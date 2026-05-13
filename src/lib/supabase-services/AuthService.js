/**
 * Auth Service for Supabase
 * Handles authentication using Supabase Auth
 * Security: Uses Supabase's built-in auth with email/password
 */

import { supabase } from '../supabase.js';
import { MESSAGES } from '../../config/messages.js';
import { CONFIG } from '../../config/config.js';

export class AuthService {
    constructor(profileRepository, sessionRepository) {
        this.profileRepository = profileRepository;
        this.sessionRepository = sessionRepository;
        this.currentUser = null;
        this.currentProfile = null;
    }

    /**
     * Get the redirect URL for email links.
     * Uses the configured PUBLIC_URL if set, otherwise falls back to current origin.
     */
    getRedirectUrl() {
        if (CONFIG.APP.PUBLIC_URL) {
            return CONFIG.APP.PUBLIC_URL;
        }
        if (typeof window !== 'undefined' && window.location) {
            return window.location.origin;
        }
        return 'http://localhost:5500';
    }

    async initialize() {
        const session = await this.sessionRepository.getSession();
        if (session) {
            this.currentUser = session.user;
            this.currentProfile = await this.profileRepository.getByUserId(session.user.id);
            return true;
        }
        return false;
    }

    async register({ email, password, nombre }) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { nombre },
                    emailRedirectTo: this.getRedirectUrl()
                }
            });

            if (error) {
                if (error.message.includes('already been registered')) {
                    return {
                        success: false,
                        error: MESSAGES.AUTH.REGISTER_ERROR_EMAIL_EXISTS
                    };
                }
                return {
                    success: false,
                    error: error.message
                };
            }

            const needsConfirmation = !data.user?.email_confirmed_at;

            if (needsConfirmation) {
                return {
                    success: true,
                    needsConfirmation: true,
                    message: MESSAGES.AUTH.REGISTER_NEEDS_CONFIRMATION,
                    user: data.user
                };
            }

            return {
                success: true,
                needsConfirmation: false,
                message: MESSAGES.AUTH.REGISTER_SUCCESS,
                user: data.user
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                // Check if the error is due to unconfirmed email
                if (error.message?.toLowerCase().includes('email not confirmed') || 
                    error.message?.toLowerCase().includes('email_not_confirmed')) {
                    return {
                        success: false,
                        needsConfirmation: true,
                        error: MESSAGES.AUTH.LOGIN_EMAIL_NOT_CONFIRMED,
                        email: email
                    };
                }
                return {
                    success: false,
                    error: MESSAGES.AUTH.LOGIN_ERROR
                };
            }

            this.currentUser = data.user;
            this.currentProfile = await this.profileRepository.getByUserId(data.user.id);
            this.sessionRepository.save(data.user);

            return {
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    nombre: this.currentProfile?.nombre || data.user.email.split('@')[0],
                    rol: this.currentProfile?.rol || 'anunciante'
                },
                message: MESSAGES.AUTH.LOGIN_SUCCESS(this.currentProfile?.nombre || data.user.email)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async logout() {
        try {
            await this.sessionRepository.signOut();
            this.currentUser = null;
            this.currentProfile = null;
            this.sessionRepository.clear();
            
            return {
                success: true,
                message: MESSAGES.AUTH.LOGOUT_SUCCESS
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        if (!this.currentUser) return null;
        
        return {
            id: this.currentUser.id,
            email: this.currentUser.email,
            nombre: this.currentProfile?.nombre || this.currentUser.email.split('@')[0]
        };
    }

    getUserId() {
        return this.currentUser?.id || null;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            throw new Error(MESSAGES.AUTH.REQUIRED_LOGIN);
        }
        return this.getCurrentUser();
    }

    requireAdmin() {
        const user = this.requireAuth();
        if (!this.isAdmin()) {
            throw new Error('Only administrators can perform this action');
        }
        return user;
    }

    getCurrentProfile() {
        return this.currentProfile;
    }

    isAdmin() {
        return this.currentProfile?.rol === 'admin';
    }

    async updateProfile({ nombre, avatar_url, delete_avatar }) {
        try {
            const profileData = {
                nombre,
                updated_at: new Date().toISOString()
            };
            
            if (delete_avatar) {
                profileData.avatar_url = null;
            } else if (avatar_url) {
                profileData.avatar_url = avatar_url;
            }
            
            // Non-admin users cannot change their role
            const isAdmin = this.isAdmin();
            if (!isAdmin) {
                delete profileData.rol;
            }
            
            const updated = await this.profileRepository.updateByUserId(this.currentUser.id, profileData);
            this.currentProfile = updated;
            return {
                success: true,
                profile: updated
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateUserRole(userId, newRol) {
        try {
            if (!this.isAdmin()) {
                return {
                    success: false,
                    error: 'Only administrators can change user roles'
                };
            }

            if (newRol !== 'admin' && newRol !== 'anunciante') {
                return {
                    success: false,
                    error: 'Invalid role. Must be "admin" or "anunciante"'
                };
            }

            const updated = await this.profileRepository.updateByUserId(userId, {
                rol: newRol,
                updated_at: new Date().toISOString()
            });

            // If admin changed their own role, update currentProfile
            if (userId === this.currentUser?.id) {
                this.currentProfile = updated;
            }

            return {
                success: true,
                profile: updated
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    onAuthStateChange(callback) {
        return this.sessionRepository.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                this.currentProfile = await this.profileRepository.getByUserId(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.currentProfile = null;
            }
            callback(event, session);
        });
    }

    async resendConfirmation(email) {
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: this.getRedirectUrl()
                }
            });

            if (error) {
                console.error('[resendConfirmation] Error:', error);
                if (error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('rate_limit')) {
                    return {
                        success: false,
                        rateLimited: true,
                        error: MESSAGES.AUTH.RESEND_CONFIRMATION_RATE_LIMIT
                    };
                }
                return {
                    success: false,
                    error: MESSAGES.AUTH.RESEND_CONFIRMATION_ERROR
                };
            }

            return {
                success: true,
                message: MESSAGES.AUTH.RESEND_CONFIRMATION_SUCCESS
            };
        } catch (error) {
            console.error('[resendConfirmation] Exception:', error);
            return {
                success: false,
                error: MESSAGES.AUTH.RESEND_CONFIRMATION_ERROR
            };
        }
    }

    async resetPasswordForEmail(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: this.getRedirectUrl()
            });

            if (error) {
                console.error('[resetPasswordForEmail] Error:', error);
                if (error.message?.toLowerCase().includes('rate limit') || error.message?.toLowerCase().includes('rate_limit')) {
                    return {
                        success: false,
                        rateLimited: true,
                        error: MESSAGES.AUTH.FORGOT_PASSWORD_RATE_LIMIT
                    };
                }
                return {
                    success: false,
                    error: MESSAGES.AUTH.FORGOT_PASSWORD_ERROR
                };
            }

            return {
                success: true,
                message: MESSAGES.AUTH.FORGOT_PASSWORD_SUCCESS
            };
        } catch (error) {
            console.error('[resetPasswordForEmail] Exception:', error);
            return {
                success: false,
                error: MESSAGES.AUTH.FORGOT_PASSWORD_ERROR
            };
        }
    }

    async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error('[updatePassword] Error:', error);
                return {
                    success: false,
                    error: MESSAGES.AUTH.RESET_PASSWORD_ERROR
                };
            }

            return {
                success: true,
                message: MESSAGES.AUTH.RESET_PASSWORD_SUCCESS
            };
        } catch (error) {
            console.error('[updatePassword] Exception:', error);
            return {
                success: false,
                error: MESSAGES.AUTH.RESET_PASSWORD_ERROR
            };
        }
    }

    /**
     * Check if current URL has a password recovery token.
     * Supabase redirects with #access_token=...type=recovery after email link click.
     * Must capture the hash early since supabase-js clears it after processing.
     */

    async logout() {
        try {
            await this.sessionRepository.signOut();
            this.currentUser = null;
            this.currentProfile = null;
            this.sessionRepository.clear();
            
            return {
                success: true,
                message: MESSAGES.AUTH.LOGOUT_SUCCESS
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        if (!this.currentUser) return null;
        
        return {
            id: this.currentUser.id,
            email: this.currentUser.email,
            nombre: this.currentProfile?.nombre || this.currentUser.email.split('@')[0]
        };
    }

    getUserId() {
        return this.currentUser?.id || null;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            throw new Error(MESSAGES.AUTH.REQUIRED_LOGIN);
        }
        return this.getCurrentUser();
    }

    requireAdmin() {
        const user = this.requireAuth();
        if (!this.isAdmin()) {
            throw new Error('Only administrators can perform this action');
        }
        return user;
    }

    getCurrentProfile() {
        return this.currentProfile;
    }

    isAdmin() {
        return this.currentProfile?.rol === 'admin';
    }

    async updateProfile({ nombre, avatar_url, delete_avatar }) {
        try {
            const profileData = {
                nombre,
                updated_at: new Date().toISOString()
            };
            
            if (delete_avatar) {
                profileData.avatar_url = null;
            } else if (avatar_url) {
                profileData.avatar_url = avatar_url;
            }
            
            // Non-admin users cannot change their role
            const isAdmin = this.isAdmin();
            if (!isAdmin) {
                delete profileData.rol;
            }
            
            const updated = await this.profileRepository.updateByUserId(this.currentUser.id, profileData);
            this.currentProfile = updated;
            return {
                success: true,
                profile: updated
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateUserRole(userId, newRol) {
        try {
            if (!this.isAdmin()) {
                return {
                    success: false,
                    error: 'Only administrators can change user roles'
                };
            }

            if (newRol !== 'admin' && newRol !== 'anunciante') {
                return {
                    success: false,
                    error: 'Invalid role. Must be "admin" or "anunciante"'
                };
            }

            const updated = await this.profileRepository.updateByUserId(userId, {
                rol: newRol,
                updated_at: new Date().toISOString()
            });

            // If admin changed their own role, update currentProfile
            if (userId === this.currentUser?.id) {
                this.currentProfile = updated;
            }

            return {
                success: true,
                profile: updated
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    onAuthStateChange(callback) {
        return this.sessionRepository.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                this.currentUser = session.user;
                this.currentProfile = await this.profileRepository.getByUserId(session.user.id);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.currentProfile = null;
            }
            callback(event, session);
        });
    }
}

export default AuthService;
