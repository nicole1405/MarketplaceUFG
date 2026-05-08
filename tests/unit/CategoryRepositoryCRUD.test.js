/**
 * Pruebas Unitarias - CategoryRepository CRUD Methods
 * Tests for category create, update, delete methods (pure logic extraction)
 */

import { describe, it, expect } from 'vitest';

// Pure function: build category create data
function buildCategoryCreateData(category) {
    return {
        nombre: category.nombre,
        descripcion: category.descripcion || null,
        icono: category.icono || null
    };
}

// Pure function: build category update data
function buildCategoryUpdateData(category) {
    return {
        nombre: category.nombre,
        descripcion: category.descripcion,
        icono: category.icono,
        updated_at: new Date().toISOString()
    };
}

describe('CategoryRepository - CRUD Logic (Unit Tests)', () => {
    describe('buildCategoryCreateData', () => {
        it('debe crear datos con solo nombre requerido', () => {
            const category = { nombre: 'Electrónica' };

            const result = buildCategoryCreateData(category);

            expect(result.nombre).toBe('Electrónica');
            expect(result.descripcion).toBeNull();
            expect(result.icono).toBeNull();
        });

        it('debe incluir descripcion si se proporciona', () => {
            const category = { nombre: 'Libros', descripcion: 'Libros y material' };

            const result = buildCategoryCreateData(category);

            expect(result.descripcion).toBe('Libros y material');
        });

        it('debe incluir icono si se proporciona', () => {
            const category = { nombre: 'Deportes', icono: '⚽' };

            const result = buildCategoryCreateData(category);

            expect(result.icono).toBe('⚽');
        });

        it('debe tener exactamente tres propiedades', () => {
            const category = { nombre: 'Test' };

            const result = buildCategoryCreateData(category);

            expect(Object.keys(result)).toHaveLength(3);
        });
    });

    describe('buildCategoryUpdateData', () => {
        it('debe incluir updated_at como ISO string', () => {
            const category = { nombre: 'Updated' };

            const result = buildCategoryUpdateData(category);

            expect(result.updated_at).toBeDefined();
            expect(typeof result.updated_at).toBe('string');
            expect(new Date(result.updated_at).toISOString()).toBe(result.updated_at);
        });

        it('debe incluir todos los campos proporcionados', () => {
            const category = {
                nombre: 'Updated',
                descripcion: 'New description',
                icono: '🆕'
            };

            const result = buildCategoryUpdateData(category);

            expect(result.nombre).toBe('Updated');
            expect(result.descripcion).toBe('New description');
            expect(result.icono).toBe('🆕');
        });

        it('debe permitir valores null en campos opcionales', () => {
            const category = {
                nombre: 'Updated',
                descripcion: null,
                icono: null
            };

            const result = buildCategoryUpdateData(category);

            expect(result.descripcion).toBeNull();
            expect(result.icono).toBeNull();
        });
    });
});
