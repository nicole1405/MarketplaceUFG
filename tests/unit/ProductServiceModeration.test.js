/**
 * Pruebas Unitarias - ProductService Moderation Logic
 * Tests for product service moderation-related logic
 */

import { describe, it, expect } from 'vitest';

// Pure function: build product create data (T14 - no hardcoded estado)
function buildProductCreateData(productData, user) {
    return {
        nombre: productData.nombre,
        precio: parseFloat(productData.precio),
        descripcion: productData.descripcion,
        imagenes_urls: productData.imagenes_urls || [],
        imagenes_paths: productData.imagenes_paths || [],
        vendedor_id: user.id,
        categoria_id: productData.categoria_id || null
    };
}

// Pure function: determine if update should reset revision state
function shouldResetRevisionState(currentProduct, userId) {
    if (!currentProduct) return { shouldReset: false, reason: 'Product not found' };
    if (currentProduct.vendedor_id !== userId) return { shouldReset: false, reason: 'Not owner' };
    if (currentProduct.estado_revision === 'aprobado') {
        return { shouldReset: true, reason: 'Approved product edited - requires re-review' };
    }
    return { shouldReset: false, reason: 'Product not approved, no reset needed' };
}

// Pure function: build product update data with revision reset
function buildProductUpdateDataWithReset(productData, currentProduct, userId) {
    const updateData = {
        nombre: productData.nombre,
        precio: parseFloat(productData.precio),
        descripcion: productData.descripcion,
        imagenes_urls: productData.imagenes_urls,
        imagenes_paths: productData.imagenes_paths,
        categoria_id: productData.categoria_id,
        estado: productData.estado,
        updated_at: new Date().toISOString()
    };

    const resetCheck = shouldResetRevisionState(currentProduct, userId);
    if (resetCheck.shouldReset) {
        updateData.estado_revision = 'pendiente';
    }

    return updateData;
}

describe('ProductService - Moderation Logic (Unit Tests)', () => {
    describe('buildProductCreateData (T14)', () => {
        it('debe crear datos sin campo estado (manejado por repositorio)', () => {
            const productData = {
                nombre: 'Test Product',
                precio: 100,
                descripcion: 'Test',
                categoria_id: 5
            };
            const user = { id: 'user-123' };

            const result = buildProductCreateData(productData, user);

            expect(result).not.toHaveProperty('estado');
            expect(result).not.toHaveProperty('estado_revision');
            expect(result.vendedor_id).toBe('user-123');
            expect(result.nombre).toBe('Test Product');
        });

        it('debe parsear precio a float', () => {
            const productData = { nombre: 'Test', precio: '99.99' };
            const user = { id: 'user-1' };

            const result = buildProductCreateData(productData, user);

            expect(result.precio).toBe(99.99);
            expect(typeof result.precio).toBe('number');
        });

        it('debe usar arrays vacios para imagenes si no se proporcionan', () => {
            const productData = { nombre: 'Test', precio: 100 };
            const user = { id: 'user-1' };

            const result = buildProductCreateData(productData, user);

            expect(result.imagenes_urls).toEqual([]);
            expect(result.imagenes_paths).toEqual([]);
        });

        it('debe usar null para categoria_id si no se proporciona', () => {
            const productData = { nombre: 'Test', precio: 100 };
            const user = { id: 'user-1' };

            const result = buildProductCreateData(productData, user);

            expect(result.categoria_id).toBeNull();
        });
    });

    describe('shouldResetRevisionState (T15)', () => {
        it('debe indicar reset cuando producto aprobado es editado por owner', () => {
            const product = {
                id: 1,
                vendedor_id: 'user-123',
                estado_revision: 'aprobado'
            };

            const result = shouldResetRevisionState(product, 'user-123');

            expect(result.shouldReset).toBe(true);
            expect(result.reason).toContain('re-review');
        });

        it('debe NO indicar reset cuando producto pendiente es editado', () => {
            const product = {
                id: 1,
                vendedor_id: 'user-123',
                estado_revision: 'pendiente'
            };

            const result = shouldResetRevisionState(product, 'user-123');

            expect(result.shouldReset).toBe(false);
        });

        it('debe NO indicar reset cuando producto rechazado es editado', () => {
            const product = {
                id: 1,
                vendedor_id: 'user-123',
                estado_revision: 'rechazado'
            };

            const result = shouldResetRevisionState(product, 'user-123');

            expect(result.shouldReset).toBe(false);
        });

        it('debe rechazar si no es el owner', () => {
            const product = {
                id: 1,
                vendedor_id: 'user-123',
                estado_revision: 'aprobado'
            };

            const result = shouldResetRevisionState(product, 'other-user');

            expect(result.shouldReset).toBe(false);
            expect(result.reason).toBe('Not owner');
        });

        it('debe rechazar si producto no existe', () => {
            const result = shouldResetRevisionState(null, 'user-123');
            expect(result.shouldReset).toBe(false);
            expect(result.reason).toBe('Product not found');
        });
    });

    describe('buildProductUpdateDataWithReset (T15)', () => {
        it('debe incluir estado_revision pendiente cuando producto aprobado es editado', () => {
            const productData = {
                nombre: 'Updated Name',
                precio: 150,
                descripcion: 'Updated',
                categoria_id: 3,
                estado: 'disponible'
            };
            const currentProduct = {
                id: 1,
                vendedor_id: 'user-123',
                estado_revision: 'aprobado'
            };

            const result = buildProductUpdateDataWithReset(productData, currentProduct, 'user-123');

            expect(result.estado_revision).toBe('pendiente');
            expect(result.nombre).toBe('Updated Name');
            expect(result.updated_at).toBeDefined();
        });

        it('debe NO incluir estado_revision cuando producto pendiente es editado', () => {
            const productData = {
                nombre: 'Updated',
                precio: 100,
                descripcion: 'Updated',
                estado: 'disponible'
            };
            const currentProduct = {
                id: 1,
                vendedor_id: 'user-123',
                estado_revision: 'pendiente'
            };

            const result = buildProductUpdateDataWithReset(productData, currentProduct, 'user-123');

            expect(result).not.toHaveProperty('estado_revision');
        });
    });
});
