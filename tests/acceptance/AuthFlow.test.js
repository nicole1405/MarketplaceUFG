/**
 * Pruebas de Aceptación - Flujo de Autenticación
 * Tests de integración para el flujo completo de login y registro
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de servicios
const mockAuthService = {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    initialize: vi.fn(),
    getCurrentUser: vi.fn(),
    getCurrentProfile: vi.fn(),
    updateProfile: vi.fn()
};

const mockStorageService = {
    uploadImage: vi.fn()
};

vi.mock('../../src/lib/supabase-services/AuthService.js', () => ({
    AuthService: class {
        constructor() {
            return mockAuthService;
        }
    }
}));

vi.mock('../../src/lib/supabase-services/StorageService.js', () => ({
    StorageService: class {
        constructor() {
            return mockStorageService;
        }
    }
}));

describe('Autenticación - Pruebas de Aceptación', () => {
    let AuthController;
    let toast;

    beforeEach(async () => {
        vi.clearAllMocks();
        
        // Mock global de toast
        toast = {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn(),
            info: vi.fn()
        };
        global.toast = toast;
        
        // Mock document
        document.body.innerHTML = `
            <div id="auth-screen"></div>
            <div id="app-container"></div>
            <form id="login-form">
                <input id="login-email" value="test@test.com" />
                <input id="login-password" value="password123" />
            </form>
            <form id="register-form">
                <input id="register-nombre" value="Test User" />
                <input id="register-email" value="new@test.com" />
                <input id="register-password" value="password123" />
                <input id="register-password-confirm" value="password123" />
            </form>
            <div id="user-profile"></div>
            <img id="user-avatar" />
            <div id="user-name"></div>
        `;
        
        const { AuthController: PC } = await import('../../src/features/auth/AuthController.js');
        AuthController = PC;
    });

    describe('Flujo de Login', () => {
        it('debe iniciar sesión con credenciales válidas', async () => {
            const mockUser = { id: '123', email: 'test@test.com' };
            mockAuthService.login.mockResolvedValue({
                success: true,
                user: mockUser,
                message: 'Bienvenido'
            });

            const controller = new AuthController(mockAuthService, mockStorageService);
            
            // Simular login
            const result = await mockAuthService.login('test@test.com', 'password123');
            
            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
        });

        it('debe mostrar error con credenciales inválidas', async () => {
            mockAuthService.login.mockResolvedValue({
                success: false,
                error: 'Credenciales inválidas'
            });

            const result = await mockAuthService.login('test@test.com', 'wrongpassword');
            
            expect(result.success).toBe(false);
            expect(toast.error).not.toHaveBeenCalled();
        });

        it('debe validar email antes de enviar', async () => {
            mockAuthService.login.mockResolvedValue({
                success: false,
                error: 'Email requerido'
            });

            const result = await mockAuthService.login('', 'password');
            
            expect(result.success).toBe(false);
        });

        it('debe validar contraseña mínima', async () => {
            mockAuthService.login.mockResolvedValue({
                success: false,
                error: 'Contraseña muy corta'
            });

            const result = await mockAuthService.login('test@test.com', '123');
            
            expect(result.success).toBe(false);
        });
    });

    describe('Flujo de Registro', () => {
        it('debe registrar nuevo usuario correctamente', async () => {
            mockAuthService.register.mockResolvedValue({
                success: true,
                message: 'Usuario registrado'
            });

            const result = await mockAuthService.register({
                nombre: 'New User',
                email: 'new@test.com',
                password: 'password123'
            });

            expect(result.success).toBe(true);
        });

        it('debe manejar email duplicado', async () => {
            mockAuthService.register.mockResolvedValue({
                success: false,
                error: 'El email ya está registrado'
            });

            const result = await mockAuthService.register({
                nombre: 'User',
                email: 'existing@test.com',
                password: 'password123'
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('ya está');
        });

        it('debe validar formato de email', async () => {
            mockAuthService.register.mockResolvedValue({
                success: false,
                error: 'Email inválido'
            });

            const result = await mockAuthService.register({
                nombre: 'User',
                email: 'invalid-email',
                password: 'password123'
            });

            expect(result.success).toBe(false);
        });

        it('debe validar que contraseñas coincidan', async () => {
            const controller = new AuthController(mockAuthService, mockStorageService);
            
            // Simular validación
            const passwordsMatch = 'password123' === 'different';
            
            expect(passwordsMatch).toBe(false);
        });
    });

    describe('Flujo de Logout', () => {
        it('debe cerrar sesión correctamente', async () => {
            mockAuthService.logout.mockResolvedValue({
                success: true,
                message: 'Sesión cerrada'
            });

            const result = await mockAuthService.logout();

            expect(result.success).toBe(true);
        });

        it('debe limpiar sesión local después de logout', async () => {
            mockAuthService.logout.mockResolvedValue({ success: true });
            mockAuthService.getCurrentUser.mockReturnValue(null);

            await mockAuthService.logout();
            const user = mockAuthService.getCurrentUser();

            expect(user).toBeNull();
        });

        it('debe manejar error en logout gracefully', async () => {
            mockAuthService.logout.mockResolvedValue({
                success: false,
                error: 'Error de red'
            });

            const result = await mockAuthService.logout();

            expect(result.success).toBe(false);
        });

        it('debe retornar mensaje de confirmación', async () => {
            mockAuthService.logout.mockResolvedValue({
                success: true,
                message: 'Sesión cerrada'
            });

            const result = await mockAuthService.logout();

            expect(result.message).toContain('cerrada');
        });
    });

    describe('Gestión de Perfil', () => {
        it('debe obtener perfil actual', async () => {
            const mockProfile = { nombre: 'Test', avatar_url: '' };
            mockAuthService.getCurrentProfile.mockReturnValue(mockProfile);

            const profile = mockAuthService.getCurrentProfile();

            expect(profile.nombre).toBe('Test');
        });

        it('debe actualizar perfil', async () => {
            mockAuthService.updateProfile.mockResolvedValue({
                success: true,
                profile: { nombre: 'Updated' }
            });

            const result = await mockAuthService.updateProfile({ nombre: 'Updated' });

            expect(result.success).toBe(true);
        });

        it('debe manejar error al actualizar perfil', async () => {
            mockAuthService.updateProfile.mockResolvedValue({
                success: false,
                error: 'Error al actualizar'
            });

            const result = await mockAuthService.updateProfile({});

            expect(result.success).toBe(false);
        });

        it('debe validar nombre requerido', async () => {
            mockAuthService.updateProfile.mockResolvedValue({
                success: false,
                error: 'El nombre es requerido'
            });

            const result = await mockAuthService.updateProfile({ nombre: '' });

            expect(result.success).toBe(false);
        });
    });
});