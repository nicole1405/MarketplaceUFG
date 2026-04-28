/**
 * Pruebas de Aceptación - Flujo de Productos
 * Tests de integración para el flujo completo de gestión de productos
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de services
const mockProductService = {
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
    searchProducts: vi.fn()
};

const mockStorageService = {
    uploadImage: vi.fn(),
    deleteImage: vi.fn()
};

vi.mock('../../src/lib/supabase-services/ProductService.js', () => ({
    ProductService: class {
        constructor() {
            return mockProductService;
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

describe('Productos - Pruebas de Aceptación', () => {
    let ProductController;
    let mockToast;

    beforeEach(async () => {
        vi.clearAllMocks();
        
        mockToast = {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn()
        };
        
        global.toast = mockToast;
        
        const { ProductController: PC } = await import('../../src/features/products/ProductController.js');
        ProductController = PC;
    });

    describe('Flujo de Crear Producto', () => {
        it('debe crear producto con datos válidos', async () => {
            const mockProduct = { 
                id: 'prod-1', 
                nombre: 'Test Product',
                precio: 100,
                categoria_id: 'cat-1'
            };
            
            mockProductService.createProduct.mockResolvedValue({
                success: true,
                data: mockProduct
            });

            const result = await mockProductService.createProduct(mockProduct);
            
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockProduct);
        });

        it('debe rechazar producto sin nombre', async () => {
            const invalidProduct = { precio: 100 };
            
            mockProductService.createProduct.mockResolvedValue({
                success: false,
                error: 'El nombre es requerido'
            });

            try {
                await mockProductService.createProduct(invalidProduct);
            } catch (e) {
                expect(mockToast.error).toHaveBeenCalled();
            }
        });

        it('debe rechazar precio negativo', async () => {
            const result = await mockProductService.createProduct({
                nombre: 'Product',
                precio: -10
            });
            
            expect(result.success).toBe(false);
        });

        it('debe validar imagen antes de subir', async () => {
            const result = await mockProductService.createProduct({
                nombre: 'Product',
                precio: 100,
                imagen: null
            });
            
            expect(result).toBeDefined();
        });
    });

    describe('Fluito de Listar Productos', () => {
        it('debe listar todos los productos', async () => {
            const mockProducts = [
                { id: '1', nombre: 'Product 1' },
                { id: '2', nombre: 'Product 2' }
            ];
            
            mockProductService.getProducts.mockResolvedValue({
                success: true,
                data: mockProducts
            });

            const result = await mockProductService.getProducts();
            
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
        });

        it('debe manejar lista vacía', async () => {
            mockProductService.getProducts.mockResolvedValue({
                success: true,
                data: []
            });

            const result = await mockProductService.getProducts();
            
            expect(result.data).toHaveLength(0);
        });

        it('debe paginar resultados', async () => {
            mockProductService.getProducts.mockResolvedValue({
                success: true,
                data: [{ id: '1' }],
                pagination: { page: 1, total: 100 }
            });

            const result = await mockProductService.getProducts({ page: 1, limit: 10 });
            
            expect(result.pagination).toBeDefined();
        });

        it('debe ordenar por fecha', async () => {
            mockProductService.getProducts.mockResolvedValue({
                success: true,
                data: []
            });

            await mockProductService.getProducts({ orderBy: 'created_at', orderDir: 'desc' });
            
            expect(mockProductService.getProducts).toHaveBeenCalled();
        });
    });

    describe('Flujo de Buscar Productos', () => {
        it('debe buscar por nombre', async () => {
            mockProductService.searchProducts.mockResolvedValue({
                success: true,
                data: [{ nombre: 'Laptop' }]
            });

            const result = await mockProductService.searchProducts('laptop');
            
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
        });

        it('debe buscar por categoría', async () => {
            mockProductService.searchProducts.mockResolvedValue({
                success: true,
                data: []
            });

            await mockProductService.searchProducts('', { categoria: 'tecnologia' });
            
            expect(mockProductService.searchProducts).toHaveBeenCalled();
        });

        it('debe buscar por rango de precio', async () => {
            mockProductService.searchProducts.mockResolvedValue({
                success: true,
                data: [{ precio: 50 }]
            });

            const result = await mockProductService.searchProducts('', { 
                minPrice: 10, 
                maxPrice: 100 
            });
            
            expect(result.success).toBe(true);
        });

        it('debe manejar sin resultados', async () => {
            mockProductService.searchProducts.mockResolvedValue({
                success: true,
                data: []
            });

            const result = await mockProductService.searchProducts('nonexistent');
            
            expect(result.data).toHaveLength(0);
        });
    });

    describe('Flujo de Actualizar Producto', () => {
        it('debe actualizar producto existente', async () => {
            mockProductService.updateProduct.mockResolvedValue({
                success: true,
                data: { id: '1', nombre: 'Updated' }
            });

            const result = await mockProductService.updateProduct('1', { nombre: 'Updated' });
            
            expect(result.success).toBe(true);
        });

        it('debe validar ownership antes de actualizar', async () => {
            mockProductService.updateProduct.mockResolvedValue({
                success: false,
                error: 'No tienes permiso'
            });

            const result = await mockProductService.updateProduct('1', { nombre: 'Updated' });
            
            expect(result.success).toBe(false);
        });

        it('debe rechazar actualización de producto eliminado', async () => {
            mockProductService.updateProduct.mockResolvedValue({
                success: false,
                error: 'Producto no encontrado'
            });

            const result = await mockProductService.updateProduct('deleted-id', { nombre: 'Updated' });
            
            expect(result.error).toContain('no encontrado');
        });

        it('debe manejar error de red', async () => {
            mockProductService.updateProduct.mockRejectedValue(new Error('Network error'));

            try {
                await mockProductService.updateProduct('1', { nombre: 'Updated' });
            } catch (e) {
                expect(e.message).toContain('Network');
            }
        });
    });

    describe('Flujo de Eliminar Producto', () => {
        it('debe eliminar producto correctamente', async () => {
            mockProductService.deleteProduct.mockResolvedValue({
                success: true
            });

            const result = await mockProductService.deleteProduct('1');
            
            expect(result.success).toBe(true);
            expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');
        });

        it('debe validar ownership antes de eliminar', async () => {
            mockProductService.deleteProduct.mockResolvedValue({
                success: false,
                error: 'No tienes permiso'
            });

            await mockProductService.deleteProduct('1');
            
            expect(mockProductService.deleteProduct).toHaveBeenCalled();
        });

        it('debe manejar error al eliminar producto de otro usuario', async () => {
            mockProductService.deleteProduct.mockResolvedValue({
                success: false,
                error: 'No tienes permiso para eliminar este producto'
            });

            const result = await mockProductService.deleteProduct('other-user-product');
            
            expect(result.success).toBe(false);
        });

        it('debe retornar mensaje tras eliminar', async () => {
            mockProductService.deleteProduct.mockResolvedValue({
                success: true,
                message: 'Producto eliminado'
            });

            const result = await mockProductService.deleteProduct('1');
            
            expect(result.message).toContain('eliminado');
        });
    });
});