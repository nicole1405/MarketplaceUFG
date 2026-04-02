/**
 * Session Repository for Supabase
 * Manages authentication session state
 * Uses Supabase Auth for session management
 */

import { supabase } from '../supabase.js';

export class SessionRepository {
    constructor() {
        this.currentSession = null;
        this.currentUser = null;
    }

    async initialize() {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return null;
        }

        if (session) {
            this.currentSession = session;
            this.currentUser = session.user;
            return session;
        }

        return null;
    }

    async getSession() {
        if (!this.currentSession) {
            await this.initialize();
        }
        return this.currentSession;
    }

    async getUser() {
        if (!this.currentUser) {
            await this.initialize();
        }
        return this.currentUser;
    }

    save(user) {
        this.currentUser = user;
    }

    clear() {
        this.currentSession = null;
        this.currentUser = null;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getUserId() {
        return this.currentUser?.id || null;
    }

    getUserEmail() {
        return this.currentUser?.email || null;
    }

    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            this.currentSession = session;
            this.currentUser = session?.user || null;
            callback(event, session);
        });
    }

    async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) throw new Error(error.message);
        this.clear();
        return { success: true };
    }
}

export default SessionRepository;
