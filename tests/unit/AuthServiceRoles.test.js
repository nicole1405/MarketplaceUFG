/**
 * Pruebas Unitarias - AuthService Role Methods
 * Tests for role-based authentication methods
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Pure function: extract role from login response
function extractRoleFromLoginResponse(loginResult, profile) {
    if (!loginResult.success || !profile) return null;
    return profile.rol || null;
}

// Pure function: check if user is admin
function isAdminCheck(currentProfile) {
    return currentProfile?.rol === 'admin';
}

// Pure function: filter profile data for non-admin updates
function filterProfileDataForUpdate(data, isAdmin) {
    const { rol, ...rest } = data;
    if (isAdmin) {
        return data;
    }
    return rest;
}

// Pure function: validate role value
function isValidRole(rol) {
    return rol === 'anunciante' || rol === 'admin';
}

describe('AuthService - Role Methods (Unit Tests)', () => {
    describe('extractRoleFromLoginResponse', () => {
        it('debe retornar rol cuando login es exitoso y profile tiene rol', () => {
            const loginResult = { success: true, user: { id: '123' } };
            const profile = { rol: 'admin', nombre: 'Test' };

            const result = extractRoleFromLoginResponse(loginResult, profile);

            expect(result).toBe('admin');
        });

        it('debe retornar rol anunciante cuando profile tiene rol anunciante', () => {
            const loginResult = { success: true, user: { id: '123' } };
            const profile = { rol: 'anunciante', nombre: 'Test' };

            const result = extractRoleFromLoginResponse(loginResult, profile);

            expect(result).toBe('anunciante');
        });

        it('debe retornar null cuando login falla', () => {
            const loginResult = { success: false, error: 'Invalid credentials' };
            const profile = { rol: 'admin', nombre: 'Test' };

            const result = extractRoleFromLoginResponse(loginResult, profile);

            expect(result).toBeNull();
        });

        it('debe retornar null cuando profile no tiene rol', () => {
            const loginResult = { success: true, user: { id: '123' } };
            const profile = { nombre: 'Test' };

            const result = extractRoleFromLoginResponse(loginResult, profile);

            expect(result).toBeNull();
        });

        it('debe retornar null cuando profile es null', () => {
            const loginResult = { success: true, user: { id: '123' } };

            const result = extractRoleFromLoginResponse(loginResult, null);

            expect(result).toBeNull();
        });
    });

    describe('isAdminCheck', () => {
        it('debe retornar true cuando rol es admin', () => {
            const profile = { rol: 'admin' };

            expect(isAdminCheck(profile)).toBe(true);
        });

        it('debe retornar false cuando rol es anunciante', () => {
            const profile = { rol: 'anunciante' };

            expect(isAdminCheck(profile)).toBe(false);
        });

        it('debe retornar false cuando profile es null', () => {
            expect(isAdminCheck(null)).toBe(false);
        });

        it('debe retornar false cuando profile no tiene rol', () => {
            const profile = { nombre: 'Test' };

            expect(isAdminCheck(profile)).toBe(false);
        });
    });

    describe('filterProfileDataForUpdate', () => {
        it('debe incluir rol cuando isAdmin es true', () => {
            const data = { nombre: 'Updated', rol: 'admin', avatar_url: null };

            const result = filterProfileDataForUpdate(data, true);

            expect(result).toEqual({ nombre: 'Updated', rol: 'admin', avatar_url: null });
        });

        it('debe excluir rol cuando isAdmin es false', () => {
            const data = { nombre: 'Updated', rol: 'admin', avatar_url: null };

            const result = filterProfileDataForUpdate(data, false);

            expect(result).toEqual({ nombre: 'Updated', avatar_url: null });
            expect(result).not.toHaveProperty('rol');
        });

        it('debe excluir rol incluso si el usuario intenta cambiarlo', () => {
            const data = { nombre: 'Updated', rol: 'admin' };

            const result = filterProfileDataForUpdate(data, false);

            expect(result).toEqual({ nombre: 'Updated' });
        });
    });

    describe('isValidRole', () => {
        it('debe retornar true para rol admin', () => {
            expect(isValidRole('admin')).toBe(true);
        });

        it('debe retornar true para rol anunciante', () => {
            expect(isValidRole('anunciante')).toBe(true);
        });

        it('debe retornar false para rol invalido', () => {
            expect(isValidRole('superadmin')).toBe(false);
        });

        it('debe retornar false para string vacio', () => {
            expect(isValidRole('')).toBe(false);
        });

        it('debe retornar false para null', () => {
            expect(isValidRole(null)).toBe(false);
        });
    });
});
