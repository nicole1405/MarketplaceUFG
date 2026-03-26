/**
 * Repository para Sesión
 * Maneja la persistencia de la sesión actual
 */

import { CONFIG } from '../../config/config.js';

export class SessionRepository {
    constructor(storageKey = CONFIG.STORAGE.KEYS.SESSION) {
        this.storageKey = storageKey;
    }

    save(user) {
        localStorage.setItem(this.storageKey, JSON.stringify(user.toJSON()));
    }

    get() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return null;
        
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('Error parsing session:', error);
            return null;
        }
    }

    clear() {
        localStorage.removeItem(this.storageKey);
    }

    exists() {
        return this.get() !== null;
    }
}

export default SessionRepository;
