/**
 * Pruebas Unitarias - ProductRepository Moderation Methods
 * Tests for product moderation repository methods (pure logic extraction)
 */

import { describe, it, expect } from 'vitest';

// Pure function: build public product query filter
function buildPublicProductFilter() {
    return {
        estado: 'disponible',
        estado_revision: 'aprobado'
    };
}

// Pure function: build product creation data
function buildProductCreateData(product) {
    return {
        nombre: product.nombre,
        precio: parseFloat(product.precio),
        descripcion: product.descripcion,
        imagenes_urls: product.imagenes_urls || [],
        imagenes_paths: product.imagenes_paths || [],
        vendedor_id: product.vendedor_id,
        categoria_id: product.categoria_id || null,
        estado: 'disponible',
        estado_revision: 'pendiente'
    };
}

// Pure function: build approve update data
function buildApproveUpdateData(adminId) {
    return {
        estado_revision: 'aprobado',
        revisado_por: adminId,
        fecha_revision: new Date().toISOString(),
        motivo_rechazo: null,
        updated_at: new Date().toISOString()
    };
}

// Pure function: build reject update data
function buildRejectUpdateData(adminId, motivo) {
    return {
        estado_revision: 'rechazado',
        revisado_por: adminId,
        fecha_revision: new Date().toISOString(),
        motivo_rechazo: motivo,
        updated_at: new Date().toISOString()
    };
}

describe('ProductRepository - Moderation Logic (Unit Tests)', () => {
    describe('buildPublicProductFilter', () => {
        it('debe retornar filtro para productos disponibles y aprobados', () => {
            const filter = buildPublicProductFilter();

            expect(filter.estado).toBe('disponible');
            expect(filter.estado_revision).toBe('aprobado');
        });

        it('debe tener exactamente dos propiedades de filtro', () => {
            const filter = buildPublicProductFilter();

            expect(Object.keys(filter)).toHaveLength(2);
        });
    });

    describe('buildProductCreateData', () => {
        it('debe incluir estado_revision pendiente por defecto', () => {
            const product = {
                nombre: 'Test Product',
                precio: 100,
                descripcion: 'Test',
                vendedor_id: 'user-123'
            };

            const result = buildProductCreateData(product);

            expect(result.estado_revision).toBe('pendiente');
        });

        it('debe incluir estado disponible', () => {
            const product = {
                nombre: 'Test Product',
                precio: 100,
                vendedor_id: 'user-123'
            };

            const result = buildProductCreateData(product);

            expect(result.estado).toBe('disponible');
        });

        it('debe parsear precio a float', () => {
            const product = {
                nombre: 'Test',
                precio: '99.99',
                vendedor_id: 'user-123'
            };

            const result = buildProductCreateData(product);

            expect(result.precio).toBe(99.99);
            expect(typeof result.precio).toBe('number');
        });

        it('debe usar arrays vacios para imagenes si no se proporcionan', () => {
            const product = {
                nombre: 'Test',
                precio: 100,
                vendedor_id: 'user-123'
            };

            const result = buildProductCreateData(product);

            expect(result.imagenes_urls).toEqual([]);
            expect(result.imagenes_paths).toEqual([]);
        });

        it('debe usar null para categoria_id si no se proporciona', () => {
            const product = {
                nombre: 'Test',
                precio: 100,
                vendedor_id: 'user-123'
            };

            const result = buildProductCreateData(product);

            expect(result.categoria_id).toBeNull();
        });

        it('debe preservar categoria_id si se proporciona', () => {
            const product = {
                nombre: 'Test',
                precio: 100,
                vendedor_id: 'user-123',
                categoria_id: 5
            };

            const result = buildProductCreateData(product);

            expect(result.categoria_id).toBe(5);
        });
    });

    describe('buildApproveUpdateData', () => {
        it('debe establecer estado_revision como aprobado', () => {
            const adminId = 'admin-123';
            const result = buildApproveUpdateData(adminId);

            expect(result.estado_revision).toBe('aprobado');
        });

        it('debe establecer revisado_por con adminId', () => {
            const adminId = 'admin-123';
            const result = buildApproveUpdateData(adminId);

            expect(result.revisado_por).toBe(adminId);
        });

        it('debe establecer fecha_revision como ISO string', () => {
            const adminId = 'admin-123';
            const result = buildApproveUpdateData(adminId);

            expect(result.fecha_revision).toBeDefined();
            expect(typeof result.fecha_revision).toBe('string');
            // Verify it's a valid ISO date
            expect(new Date(result.fecha_revision).toISOString()).toBe(result.fecha_revision);
        });

        it('debe establecer motivo_rechazo como null', () => {
            const adminId = 'admin-123';
            const result = buildApproveUpdateData(adminId);

            expect(result.motivo_rechazo).toBeNull();
        });
    });

    describe('buildRejectUpdateData', () => {
        it('debe establecer estado_revision como rechazado', () => {
            const adminId = 'admin-123';
            const motivo = 'Producto no cumple las normas';
            const result = buildRejectUpdateData(adminId, motivo);

            expect(result.estado_revision).toBe('rechazado');
        });

        it('debe establecer motivo_rechazo con el motivo proporcionado', () => {
            const adminId = 'admin-123';
            const motivo = 'Imagen inapropiada';
            const result = buildRejectUpdateData(adminId, motivo);

            expect(result.motivo_rechazo).toBe(motivo);
        });

        it('debe establecer revisado_por con adminId', () => {
            const adminId = 'admin-456';
            const result = buildRejectUpdateData(adminId, 'Test');

            expect(result.revisado_por).toBe(adminId);
        });
    });
});
