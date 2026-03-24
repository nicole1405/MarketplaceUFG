/**
 * Repository para Usuarios
 * Encapsula la lógica de persistencia de usuarios
 * SRP: Solo se encarga de la persistencia de usuarios
 */

import { IRepository } from './IRepository.js';
import { User } from '../domain/User.js';
import { CONFIG } from '../../config/config.js';

export class UserRepository extends IRepository {
    constructor(storageKey = CONFIG.STORAGE.KEYS.USERS) {
        super();
        this.storageKey = storageKey;
    }

    async getAll() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];
        
        try {
            const parsed = JSON.parse(data);
            return parsed.map(u => User.fromJSON(u));
        } catch (error) {
            console.error('Error parsing users:', error);
            return [];
        }
    }

    async getById(id) {
        const users = await this.getAll();
        return users.find(u => u.id === id) || null;
    }

    async getByEmail(email) {
        const users = await this.getAll();
        return users.find(u => u.email === email.toLowerCase().trim()) || null;
    }

    async create(user) {
        const users = await this.getAll();
        
        // Verificar email único
        const existing = await this.getByEmail(user.email);
        if (existing) {
            throw new Error('Email already exists');
        }
        
        users.push(user);
        await this.saveAll(users);
        return user;
    }

    async update(id, updatedUser) {
        const users = await this.getAll();
        const index = users.findIndex(u => u.id === id);
        
        if (index === -1) {
            throw new Error('User not found');
        }
        
        users[index] = updatedUser;
        await this.saveAll(users);
        return updatedUser;
    }

    async delete(id) {
        const users = await this.getAll();
        const filtered = users.filter(u => u.id !== id);
        await this.saveAll(filtered);
        return true;
    }

    async saveAll(users) {
        localStorage.setItem(this.storageKey, JSON.stringify(users.map(u => u.toJSON())));
    }

    async clear() {
        localStorage.removeItem(this.storageKey);
    }

    async exists(email) {
        const user = await this.getByEmail(email);
        return user !== null;
    }
}

export default UserRepository;
