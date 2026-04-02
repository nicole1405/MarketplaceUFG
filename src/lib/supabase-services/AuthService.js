/**
 * Auth Service for Supabase
 * Handles authentication using Supabase Auth
 * Security: Uses Supabase's built-in auth with email/password
 */

import { supabase } from '../supabase.js';
import { MESSAGES } from '../../config/messages.js';

export class AuthService {
    constructor(profileRepository, sessionRepository) {
        this.profileRepository = profileRepository;
        this.sessionRepository = sessionRepository;
        this.currentUser = null;
        this.currentProfile = null;
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
                    data: { nombre }
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

            return {
                success: true,
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
                    nombre: this.currentProfile?.nombre || data.user.email.split('@')[0]
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

    getCurrentProfile() {
        return this.currentProfile;
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
