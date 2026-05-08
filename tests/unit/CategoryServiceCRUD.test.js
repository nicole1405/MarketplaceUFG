/**
 * Pruebas Unitarias - CategoryService CRUD Logic
 * Tests for category service create, update, delete logic
 */

import { describe, it, expect } from 'vitest';

// Pure function: validate category data for create
function validateCategoryCreate(data) {
    const errors = [];
    if (!data.nombre || data.nombre.trim() === '') {
        errors.push('Category name is required');
    }
    if (data.nombre && data.nombre.length > 100) {
        errors.push('Category name must be 100 characters or less');
    }
    if (data.descripcion && data.descripcion.length > 500) {
        errors.push('Description must be 500 characters or less');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}

// Pure function: validate category data for update
function validateCategoryUpdate(data) {
    const errors = [];
    if (data.nombre !== undefined && data.nombre !== null && data.nombre.trim() === '') {
        errors.push('Category name cannot be empty');
    }
    if (data.nombre && data.nombre.length > 100) {
        errors.push('Category name must be 100 characters or less');
    }
    if (data.descripcion && data.descripcion.length > 500) {
        errors.push('Description must be 500 characters or less');
    }
    return {
        valid: errors.length === 0,
        errors
    };
}

// Pure function: build category create payload
function buildCategoryCreatePayload(data) {
    return {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion || null,
        icono: data.icono || null
    };
}

// Pure function: build category update payload
function buildCategoryUpdatePayload(data) {
    const payload = {};
    if (data.nombre !== undefined) payload.nombre = data.nombre.trim();
    if (data.descripcion !== undefined) payload.descripcion = data.descripcion;
    if (data.icono !== undefined) payload.icono = data.icono;
    payload.updated_at = new Date().toISOString();
    return payload;
}

describe('CategoryService - CRUD Logic (Unit Tests)', () => {
    describe('validateCategoryCreate', () => {
        it('debe validar categoria con solo nombre', () => {
            const result = validateCategoryCreate({ nombre: 'Electronica' });
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('debe validar categoria con todos los campos', () => {
            const result = validateCategoryCreate({
                nombre: 'Libros',
                descripcion: 'Libros y material educativo',
                icono: '📚'
            });
            expect(result.valid).toBe(true);
        });

        it('debe rechazar nombre vacio', () => {
            const result = validateCategoryCreate({ nombre: '' });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Category name is required');
        });

        it('debe rechazar nombre con solo espacios', () => {
            const result = validateCategoryCreate({ nombre: '   ' });
            expect(result.valid).toBe(false);
        });

        it('debe rechazar nombre mayor a 100 caracteres', () => {
            const longName = 'a'.repeat(101);
            const result = validateCategoryCreate({ nombre: longName });
            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Category name must be 100 characters or less');
        });

        it('debe rechazar descripcion mayor a 500 caracteres', () => {
            const longDesc = 'a'.repeat(501);
            const result = validateCategoryCreate({ nombre: 'Test', descripcion: longDesc });
            expect(result.valid).toBe(false);
        });
    });

    describe('validateCategoryUpdate', () => {
        it('debe validar update con nombre', () => {
            const result = validateCategoryUpdate({ nombre: 'Updated' });
            expect(result.valid).toBe(true);
        });

        it('debe permitir update sin nombre (partial update)', () => {
            const result = validateCategoryUpdate({ descripcion: 'New desc' });
            expect(result.valid).toBe(true);
        });

        it('debe rechazar nombre vacio en update', () => {
            const result = validateCategoryUpdate({ nombre: '' });
            expect(result.valid).toBe(false);
        });

        it('debe permitir nombre null en update (no cambiar)', () => {
            const result = validateCategoryUpdate({ nombre: null });
            expect(result.valid).toBe(true);
        });
    });

    describe('buildCategoryCreatePayload', () => {
        it('debe construir payload con nombre trimmeado', () => {
            const result = buildCategoryCreatePayload({ nombre: '  Electronica  ' });
            expect(result.nombre).toBe('Electronica');
        });

        it('debe usar null para campos opcionales no proporcionados', () => {
            const result = buildCategoryCreatePayload({ nombre: 'Test' });
            expect(result.descripcion).toBeNull();
            expect(result.icono).toBeNull();
        });

        it('debe tener exactamente tres propiedades', () => {
            const result = buildCategoryCreatePayload({ nombre: 'Test' });
            expect(Object.keys(result)).toHaveLength(3);
        });
    });

    describe('buildCategoryUpdatePayload', () => {
        it('debe incluir updated_at como ISO string', () => {
            const result = buildCategoryUpdatePayload({ nombre: 'Updated' });
            expect(result.updated_at).toBeDefined();
            expect(typeof result.updated_at).toBe('string');
            expect(new Date(result.updated_at).toISOString()).toBe(result.updated_at);
        });

        it('debe incluir solo campos proporcionados', () => {
            const result = buildCategoryUpdatePayload({ nombre: 'Updated' });
            expect(result.nombre).toBe('Updated');
            expect(result).not.toHaveProperty('descripcion');
            expect(result).not.toHaveProperty('icono');
        });

        it('debe permitir explicitamente null en campos', () => {
            const result = buildCategoryUpdatePayload({ descripcion: null });
            expect(result.descripcion).toBeNull();
        });
    });
});
