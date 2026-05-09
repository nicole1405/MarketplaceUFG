/**
 * Pruebas Unitarias - AdminService Logic
 * Tests for admin service pure logic functions
 */

import { describe, it, expect } from 'vitest';

// Pure function: filter pending products from admin list
function filterPendingProducts(allProducts) {
    return allProducts.filter(p => p.estado_revision === 'pendiente');
}

// Pure function: validate role change
function validateRoleChange(currentRol, newRol) {
    const validRoles = ['admin', 'anunciante'];
    if (!validRoles.includes(newRol)) {
        return { valid: false, error: 'Invalid role. Must be "admin" or "anunciante"' };
    }
    if (currentRol === newRol) {
        return { valid: false, error: 'User already has this role' };
    }
    return { valid: true };
}

// Pure function: validate rejection reason
function validateRejectionReason(motivo) {
    if (!motivo || motivo.trim() === '') {
        return { valid: false, error: 'Rejection reason is required' };
    }
    return { valid: true };
}

// Pure function: build admin event name
function buildAdminEventName(action) {
    return `admin:${action}`;
}

describe('AdminService - Pure Logic (Unit Tests)', () => {
    describe('filterPendingProducts', () => {
        it('debe retornar solo productos con estado_revision pendiente', () => {
            const products = [
                { id: 1, nombre: 'Product A', estado_revision: 'pendiente' },
                { id: 2, nombre: 'Product B', estado_revision: 'aprobado' },
                { id: 3, nombre: 'Product C', estado_revision: 'rechazado' },
                { id: 4, nombre: 'Product D', estado_revision: 'pendiente' }
            ];

            const result = filterPendingProducts(products);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(1);
            expect(result[1].id).toBe(4);
            expect(result.every(p => p.estado_revision === 'pendiente')).toBe(true);
        });

        it('debe retornar array vacio si no hay productos pendientes', () => {
            const products = [
                { id: 1, nombre: 'Product A', estado_revision: 'aprobado' },
                { id: 2, nombre: 'Product B', estado_revision: 'rechazado' }
            ];

            const result = filterPendingProducts(products);

            expect(result).toHaveLength(0);
            expect(result).toEqual([]);
        });

        it('debe retornar todos los productos si todos estan pendientes', () => {
            const products = [
                { id: 1, nombre: 'Product A', estado_revision: 'pendiente' },
                { id: 2, nombre: 'Product B', estado_revision: 'pendiente' }
            ];

            const result = filterPendingProducts(products);

            expect(result).toHaveLength(2);
        });

        it('debe manejar array vacio', () => {
            const result = filterPendingProducts([]);
            expect(result).toEqual([]);
        });
    });

    describe('validateRoleChange', () => {
        it('debe validar cambio de anunciante a admin', () => {
            const result = validateRoleChange('anunciante', 'admin');
            expect(result.valid).toBe(true);
        });

        it('debe validar cambio de admin a anunciante', () => {
            const result = validateRoleChange('admin', 'anunciante');
            expect(result.valid).toBe(true);
        });

        it('debe rechazar rol invalido', () => {
            const result = validateRoleChange('anunciante', 'superadmin');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('Invalid role');
        });

        it('debe rechazar si el rol es el mismo', () => {
            const result = validateRoleChange('admin', 'admin');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('already has this role');
        });

        it('debe rechazar rol vacio', () => {
            const result = validateRoleChange('anunciante', '');
            expect(result.valid).toBe(false);
        });
    });

    describe('validateRejectionReason', () => {
        it('debe validar motivo con texto', () => {
            const result = validateRejectionReason('Producto no cumple las normas');
            expect(result.valid).toBe(true);
        });

        it('debe rechazar motivo vacio', () => {
            const result = validateRejectionReason('');
            expect(result.valid).toBe(false);
            expect(result.error).toContain('required');
        });

        it('debe rechazar motivo con solo espacios', () => {
            const result = validateRejectionReason('   ');
            expect(result.valid).toBe(false);
        });

        it('debe rechazar motivo null', () => {
            const result = validateRejectionReason(null);
            expect(result.valid).toBe(false);
        });

        it('debe rechazar motivo undefined', () => {
            const result = validateRejectionReason(undefined);
            expect(result.valid).toBe(false);
        });
    });

    describe('buildAdminEventName', () => {
        it('debe construir evento para producto aprobado', () => {
            expect(buildAdminEventName('product:approved')).toBe('admin:product:approved');
        });

        it('debe construir evento para producto rechazado', () => {
            expect(buildAdminEventName('product:rejected')).toBe('admin:product:rejected');
        });

        it('debe construir evento para rol cambiado', () => {
            expect(buildAdminEventName('role:changed')).toBe('admin:role:changed');
        });
    });
});
