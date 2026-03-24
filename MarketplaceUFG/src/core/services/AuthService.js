/**
 * Servicio de Autenticación
 * Encapsula toda la lógica de negocio relacionada con autenticación
 * SRP: Solo maneja autenticación
 * DIP: Depende de abstracciones (IRepository)
 */

import { User } from '../domain/User.js';
import { MESSAGES } from '../../config/messages.js';

export class AuthService {
    constructor(userRepository, sessionRepository) {
        this.userRepository = userRepository;
        this.sessionRepository = sessionRepository;
        this.currentUser = null;
    }

    async initialize() {
        // Restaurar sesión si existe
        const session = this.sessionRepository.get();
        if (session) {
            this.currentUser = session;
            return true;
        }
        return false;
    }

    async register(userData) {
        // Validar datos
        const user = User.create(userData);
        const validationErrors = user.validate();
        
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: validationErrors.join(', ')
            };
        }

        // Verificar si el email ya existe
        const exists = await this.userRepository.exists(user.email);
        if (exists) {
            return {
                success: false,
                error: MESSAGES.AUTH.REGISTER_ERROR_EMAIL_EXISTS
            };
        }

        try {
            await this.userRepository.create(user);
            return {
                success: true,
                message: MESSAGES.AUTH.REGISTER_SUCCESS
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async login(email, password) {
        const user = await this.userRepository.getByEmail(email);
        
        if (!user || user.password !== password) {
            return {
                success: false,
                error: MESSAGES.AUTH.LOGIN_ERROR
            };
        }

        this.currentUser = user;
        this.sessionRepository.save(user);

        return {
            success: true,
            user: user,
            message: MESSAGES.AUTH.LOGIN_SUCCESS(user.nombre)
        };
    }

    logout() {
        this.currentUser = null;
        this.sessionRepository.clear();
        
        return {
            success: true,
            message: MESSAGES.AUTH.LOGOUT_SUCCESS
        };
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            throw new Error(MESSAGES.AUTH.REQUIRED_LOGIN);
        }
        return this.currentUser;
    }
}

export default AuthService;
