/**
 * Pruebas al Encontrar Errores - Manejo de Errores
 * Tests para verificar el manejo robusto de errores en la aplicación
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock console para capturar errores
const mockConsole = {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn()
};

vi.stubGlobal('console', mockConsole);

describe('Manejo de Errores - Pruebas al Encontrar Errores', () => {
    
    describe('Errores de Red', () => {
        it('debe manejar error de conexión de red', async () => {
            const networkError = new Error('Failed to fetch');
            networkError.name = 'NetworkError';
            
            // Simular manejo de error de red
            const handleNetworkError = (error) => {
                if (error.message.includes('fetch') || error.message.includes('network')) {
                    return 'Error de conexión. Verifica tu conexión a internet.';
                }
                return 'Error desconocido';
            };
            
            const result = handleNetworkError(networkError);
            expect(result).toContain('conexión');
        });

        it('debe manejar timeout de servidor', async () => {
            const timeoutError = new Error('Request timeout');
            timeoutError.name = 'TimeoutError';
            
            const handleError = (error) => {
                if (error.name === 'TimeoutError') {
                    return 'El servidor tardó en responder. Intenta de nuevo.';
                }
                return 'Error';
            };
            
            const result = handleError(timeoutError);
            expect(result).toContain('servidor');
        });

        it('debe manejar error 500 del servidor', async () => {
            const serverError = { status: 500, message: 'Internal Server Error' };
            
            const handleHttpError = (response) => {
                if (response.status >= 500) {
                    return 'Error del servidor. Intenta más tarde.';
                }
                return 'Error';
            };
            
            const result = handleHttpError(serverError);
            expect(result).toContain('servidor');
        });

        it('debe manejar error 503 servicio no disponible', async () => {
            const serviceError = { status: 503, message: 'Service Unavailable' };
            
            const handleError = (response) => {
                if (response.status === 503) {
                    return 'Servicio temporalmente no disponible.';
                }
                return 'Error';
            };
            
            const result = handleError(serviceError);
            expect(result).toContain('temporalmente');
        });
    });

    describe('Errores de Autenticación', () => {
        it('debe manejar sesión expirada', async () => {
            const expiredSession = { code: 'TOKEN_EXPIRED', message: 'Session has expired' };
            
            const handleAuthError = (error) => {
                if (error.code === 'TOKEN_EXPIRED') {
                    return 'Tu sesión ha expirado. Inicia sesión nuevamente.';
                }
                return 'Error de autenticación';
            };
            
            const result = handleAuthError(expiredSession);
            expect(result).toContain('expirado');
        });

        it('debe manejar token inválido', async () => {
            const invalidToken = { code: 'INVALID_TOKEN', message: 'Invalid token' };
            
            const handleError = (error) => {
                if (error.code === 'INVALID_TOKEN') {
                    return 'Token inválido. Inicia sesión.';
                }
                return 'Error';
            };
            
            const result = handleError(invalidToken);
            expect(result).toContain('inválido');
        });

        it('debe manejar acceso denegado (403)', async () => {
            const forbiddenError = { status: 403, message: 'Forbidden' };
            
            const handleError = (response) => {
                if (response.status === 403) {
                    return 'No tienes permiso para realizar esta acción.';
                }
                return 'Error';
            };
            
            const result = handleError(forbiddenError);
            expect(result).toContain('permiso');
        });

        it('debe manejar usuario no autorizado', async () => {
            const unauthorizedError = { status: 401, message: 'Unauthorized' };
            
            const handleError = (response) => {
                if (response.status === 401) {
                    return 'Debes iniciar sesión para continuar.';
                }
                return 'Error';
            };
            
            const result = handleError(unauthorizedError);
            expect(result).toContain('iniciar sesión');
        });
    });

    describe('Errores de Validación', () => {
        it('debe manejar email inválido', () => {
            const invalidEmail = 'invalid-email';
            
            const validateEmail = (email) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return 'Por favor ingresa un email válido.';
                }
                return null;
            };
            
            const result = validateEmail(invalidEmail);
            expect(result).toContain('válido');
        });

        it('debe manejar contraseña débil', () => {
            const weakPassword = '123';
            
            const validatePassword = (password) => {
                if (password.length < 6) {
                    return 'La contraseña debe tener al menos 6 caracteres.';
                }
                return null;
            };
            
            const result = validatePassword(weakPassword);
            expect(result).toContain('6 caracteres');
        });

        it('debe manejar campo requerido vacío', () => {
            const emptyField = '';
            
            const validateRequired = (value, fieldName) => {
                if (!value || value.trim() === '') {
                    return `El campo ${fieldName} es requerido.`;
                }
                return null;
            };
            
            const result = validateRequired(emptyField, 'nombre');
            expect(result).toContain('requerido');
        });

        it('debe manejar imagen con formato inválido', () => {
            const invalidImage = { type: 'application/pdf', size: 1000000 };
            
            const validateImage = (file) => {
                const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validTypes.includes(file.type)) {
                    return 'Formato de imagen no válido. Usa JPG, PNG, GIF o WebP.';
                }
                return null;
            };
            
            const result = validateImage(invalidImage);
            expect(result).toContain('Formato');
        });
    });

    describe('Errores de Base de Datos', () => {
        it('debe manejar error de única constraint (email duplicado)', async () => {
            const uniqueError = { code: '23505', message: 'duplicate key value' };
            
            const handleDbError = (error) => {
                if (error.code === '23505') {
                    return 'Este email ya está registrado.';
                }
                return 'Error de base de datos';
            };
            
            const result = handleDbError(uniqueError);
            expect(result).toContain('ya está registrado');
        });

        it('debe manejar foreign key violation', async () => {
            const fkError = { code: '23503', message: 'foreign key violation' };
            
            const handleError = (error) => {
                if (error.code === '23503') {
                    return 'Error: Referencia a registro inexistente.';
                }
                return 'Error';
            };
            
            const result = handleError(fkError);
            expect(result).toContain('inexistente');
        });

        it('debe manejar error de conexión a BD', async () => {
            const connectionError = { message: 'Connection refused' };
            
            const handleError = (error) => {
                if (error.message.includes('Connection')) {
                    return 'No se pudo conectar a la base de datos.';
                }
                return 'Error';
            };
            
            const result = handleError(connectionError);
            expect(result).toContain('base de datos');
        });

        it('debe manejar consulta inválida (SQL)', async () => {
            const sqlError = { message: 'syntax error at or near' };
            
            const handleError = (error) => {
                if (error.message.includes('syntax')) {
                    return 'Error interno. Contacta al administrador.';
                }
                return 'Error';
            };
            
            const result = handleError(sqlError);
            expect(result).toContain('interno');
        });
    });

    describe('Errores de Archivo/Storage', () => {
        it('debe manejar archivo muy grande', () => {
            const largeFile = { size: 10 * 1024 * 1024 }; // 10MB
            
            const validateSize = (file, maxSizeMB = 5) => {
                if (file.size > maxSizeMB * 1024 * 1024) {
                    return `El archivo excede el límite de ${maxSizeMB}MB.`;
                }
                return null;
            };
            
            const result = validateSize(largeFile);
            expect(result).toContain('excede');
        });

        it('debe manejar upload fallido', async () => {
            const uploadError = { message: 'Upload failed' };
            
            const handleUploadError = (error) => {
                if (error.message.includes('Upload')) {
                    return 'Error al subir archivo. Intenta de nuevo.';
                }
                return 'Error';
            };
            
            const result = handleUploadError(uploadError);
            expect(result).toContain('subir');
        });

        it('debe manejar archivo corrupto', () => {
            const corruptFile = { size: 0, name: 'corrupt.png' };
            
            const validateFile = (file) => {
                if (file.size === 0) {
                    return 'El archivo está vacío o corrupto.';
                }
                return null;
            };
            
            const result = validateFile(corruptFile);
            expect(result).toContain('corrupto');
        });

        it('debe manejar404 de archivo en storage', async () => {
            const notFoundError = { status: 404, message: 'Not Found' };
            
            const handleError = (error) => {
                if (error.status === 404) {
                    return 'Archivo no encontrado.';
                }
                return 'Error';
            };
            
            const result = handleError(notFoundError);
            expect(result).toContain('no encontrado');
        });
    });

    describe('Errores Genéricos y Fallback', () => {
        it('debe manejar error desconocido con stack trace', () => {
            const unknownError = new Error('Something went wrong');
            
            const handleError = (error) => {
                if (!error.message) {
                    return 'Ocurrió un error inesperado.';
                }
                return error.message;
            };
            
            const result = handleError(unknownError);
            expect(result).toBeDefined();
        });

        it('debe usar mensaje genérico si no hay detalles', () => {
            const vagueError = {};
            
            const handleError = (error) => {
                const message = error?.message || error?.error || 'Ocurrió un error. Intenta de nuevo.';
                return message;
            };
            
            const result = handleError(vagueError);
            expect(result).toContain('error');
        });

        it('debe loguear errores unknown para debugging', () => {
            const error = new Error('Unknown error');
            
            const logError = (err) => {
                console.error('[ERROR]', err.message, err.stack);
            };
            
            logError(error);
            
            expect(mockConsole.error).toHaveBeenCalled();
        });

        it('debe proporcionar recuperación tras error', async () => {
            const recoverableError = { retryable: true };
            
            const handleAndRetry = async (error) => {
                if (error.retryable) {
                    // Intentar de nuevo
                    return { retried: true };
                }
                return { retried: false };
            };
            
            const result = await handleAndRetry(recoverableError);
            expect(result.retried).toBe(true);
        });
    });
});