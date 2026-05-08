/**
 * Pruebas de Aceptación - Flujo de Moderación de Admin
 * Tests de integración para el flujo completo de aprobación/rechazo de productos
 * y control de acceso basado en roles
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Module-scope mocks (vi.mock is hoisted)
const mockEventBus = {
    on: vi.fn(),
    emit: vi.fn()
};

const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn()
};

const mockUIUtils = {
    escapeHtml: (str) => str ? String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
};

vi.mock('../../src/core/utils/index.js', () => ({
    get eventBus() { return mockEventBus; },
    get toast() { return mockToast; },
    get UIUtils() { return mockUIUtils; }
}));

// Mock services
function createMockAdminService() {
    return {
        getPendingProducts: vi.fn(),
        approveProduct: vi.fn(),
        rejectProduct: vi.fn(),
        getAllUsers: vi.fn(),
        changeUserRole: vi.fn(),
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn()
    };
}

const mockAuthService = {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
    getCurrentProfile: vi.fn(),
    isAdmin: vi.fn(),
    requireAdmin: vi.fn(),
    updateUserRole: vi.fn()
};

const mockProductService = {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    renderProducts: vi.fn(),
    renderMyProducts: vi.fn()
};

const mockCategoryService = {
    getAll: vi.fn()
};

describe('Moderación de Admin - Pruebas de Aceptación', () => {
    let AdminController;
    let mockAdminService;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        global.confirm = vi.fn().mockReturnValue(true);

        // Set up full admin panel DOM
        document.body.innerHTML = `
            <div id="vista-admin">
                <div id="admin-pending-products-list"></div>
                <button id="btn-load-pending">Actualizar</button>
                <div id="admin-users-list"></div>
                <button id="btn-load-users">Actualizar</button>
                <div id="admin-categories-list"></div>
                <button id="btn-load-categories">Actualizar</button>
                <form id="admin-form-category">
                    <input id="admin-category-nombre" value="">
                    <input id="admin-category-descripcion" value="">
                    <input id="admin-category-icono" value="">
                    <button type="submit" id="btn-create-category">Crear</button>
                </form>
                <div id="admin-reject-modal" style="display: none;">
                    <textarea id="admin-reject-reason"></textarea>
                    <button id="btn-confirm-reject">Confirmar</button>
                    <button id="btn-cancel-reject">Cancelar</button>
                    <span id="btn-close-reject-modal">&times;</span>
                </div>
                <div id="admin-error"></div>
            </div>
        `;

        mockAdminService = createMockAdminService();

        global.window = {
            app: {
                services: {
                    categories: mockCategoryService
                }
            }
        };

        const { AdminController: AC } = await import('../../src/features/admin/AdminController.js');
        AdminController = AC;
    });

    describe('Flujo de Aprobación de Producto', () => {
        it('debe completar flujo completo: producto pendiente -> aprobado', async () => {
            const pendingProduct = {
                id: 'prod-1',
                nombre: 'Laptop Dell Inspiron',
                precio: 450,
                estado_revision: 'pendiente',
                vendedor: { nombre: 'Juan Vendedor' }
            };

            mockAdminService.getPendingProducts.mockResolvedValue([pendingProduct]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadPendingProducts();

            const list = document.getElementById('admin-pending-products-list');
            expect(list.innerHTML).toContain('Laptop Dell Inspiron');
            expect(list.innerHTML).toContain('btn-approve');

            mockAdminService.approveProduct.mockResolvedValue({
                success: true,
                product: { ...pendingProduct, estado_revision: 'aprobado' },
                message: 'Producto aprobado exitosamente'
            });

            mockAdminService.getPendingProducts.mockResolvedValue([]);

            await controller.handleApprove('prod-1');

            expect(mockAdminService.approveProduct).toHaveBeenCalledWith('prod-1');
            expect(mockToast.success).toHaveBeenCalledWith('Producto aprobado exitosamente');
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                expect.stringContaining('admin:product:approved'),
                expect.objectContaining({ estado_revision: 'aprobado' })
            );
        });

        it('debe mostrar producto aprobado en lista publica despues de aprobacion', async () => {
            const approvedProduct = {
                id: 'prod-1',
                nombre: 'Laptop Dell',
                precio: 450,
                estado_revision: 'aprobado',
                estado: 'disponible'
            };

            mockProductService.getProducts.mockResolvedValue({
                success: true,
                data: [approvedProduct]
            });

            const result = await mockProductService.getProducts();

            expect(result.success).toBe(true);
            expect(result.data[0].estado_revision).toBe('aprobado');
        });
    });

    describe('Flujo de Rechazo de Producto', () => {
        it('debe completar flujo completo: producto pendiente -> rechazado con motivo', async () => {
            const pendingProduct = {
                id: 'prod-2',
                nombre: 'iPhone Usado',
                precio: 300,
                estado_revision: 'pendiente',
                vendedor: { nombre: 'Maria Vendedora' }
            };

            mockAdminService.getPendingProducts.mockResolvedValue([pendingProduct]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadPendingProducts();

            controller.handleReject('prod-2');
            expect(document.getElementById('admin-reject-modal').style.display).toBe('block');

            document.getElementById('admin-reject-reason').value = 'Las fotos no son claras';

            mockAdminService.rejectProduct.mockResolvedValue({
                success: true,
                product: { ...pendingProduct, estado_revision: 'rechazado', revision_comentario: 'Las fotos no son claras' },
                message: 'Producto rechazado'
            });

            mockAdminService.getPendingProducts.mockResolvedValue([]);

            await controller.handleConfirmReject();

            expect(mockAdminService.rejectProduct).toHaveBeenCalledWith('prod-2', 'Las fotos no son claras');
            expect(mockToast.success).toHaveBeenCalledWith('Producto rechazado');
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                expect.stringContaining('admin:product:rejected'),
                expect.objectContaining({ estado_revision: 'rechazado' })
            );
        });

        it('debe rechazar si admin intenta rechazar sin motivo', async () => {
            const controller = new AdminController(mockAdminService, mockEventBus);
            controller.handleReject('prod-1');

            document.getElementById('admin-reject-reason').value = '';

            await controller.handleConfirmReject();

            expect(mockAdminService.rejectProduct).not.toHaveBeenCalled();
            expect(mockToast.error).toHaveBeenCalled();
        });

        it('debe permitir cancelar rechazo y cerrar modal', async () => {
            const controller = new AdminController(mockAdminService, mockEventBus);
            controller.handleReject('prod-1');

            controller.closeRejectModal();

            expect(document.getElementById('admin-reject-modal').style.display).toBe('none');
            expect(controller.pendingRejectProductId).toBeNull();
            expect(mockAdminService.rejectProduct).not.toHaveBeenCalled();
        });
    });

    describe('Control de Acceso Basado en Rol', () => {
        it('debe permitir acceso a admin con rol admin', () => {
            mockAuthService.isAdmin.mockReturnValue(true);
            mockAuthService.requireAdmin.mockReturnValue({ id: 'admin-1', rol: 'admin' });

            expect(mockAuthService.isAdmin()).toBe(true);
            expect(() => mockAuthService.requireAdmin()).not.toThrow();
        });

        it('debe bloquear acceso a usuario con rol anunciante', () => {
            mockAuthService.isAdmin.mockReturnValue(false);
            mockAuthService.requireAdmin.mockImplementation(() => {
                throw new Error('Acceso denegado. Se requiere rol de administrador');
            });

            expect(mockAuthService.isAdmin()).toBe(false);
            expect(() => mockAuthService.requireAdmin()).toThrow('Acceso denegado');
        });

        it('debe requerir admin para obtener productos pendientes', async () => {
            mockAdminService.getPendingProducts.mockImplementation(async () => {
                mockAuthService.requireAdmin();
                return [];
            });

            mockAuthService.requireAdmin.mockImplementation(() => {
                throw new Error('Acceso denegado. Se requiere rol de administrador');
            });

            await expect(mockAdminService.getPendingProducts()).rejects.toThrow('Acceso denegado');
        });

        it('debe requerir admin para cambiar rol de usuario', async () => {
            mockAdminService.changeUserRole.mockImplementation(async () => {
                mockAuthService.requireAdmin();
                return { success: true };
            });

            mockAuthService.requireAdmin.mockImplementation(() => {
                throw new Error('Acceso denegado');
            });

            await expect(mockAdminService.changeUserRole('user-1', 'admin')).rejects.toThrow('Acceso denegado');
        });
    });

    describe('Flujo de Gestión de Usuarios', () => {
        it('debe listar todos los usuarios con sus roles', async () => {
            const users = [
                { user_id: 'user-1', nombre: 'Admin Principal', email: 'admin@ufg.edu.sv', rol: 'admin' },
                { user_id: 'user-2', nombre: 'Vendedor Uno', email: 'vendedor1@ufg.edu.sv', rol: 'anunciante' },
                { user_id: 'user-3', nombre: 'Vendedor Dos', email: 'vendedor2@ufg.edu.sv', rol: 'anunciante' }
            ];

            mockAdminService.getAllUsers.mockResolvedValue(users);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadUsers();

            const list = document.getElementById('admin-users-list');
            expect(list.innerHTML).toContain('Admin Principal');
            expect(list.innerHTML).toContain('Vendedor Uno');
            expect(list.innerHTML).toContain('Vendedor Dos');
            expect(list.innerHTML).toContain('badge-admin');
            expect(list.innerHTML).toContain('badge-anunciante');
        });

        it('debe promover anunciante a admin', async () => {
            mockAdminService.changeUserRole.mockResolvedValue({
                success: true,
                message: 'Rol actualizado'
            });

            mockAdminService.getAllUsers.mockResolvedValue([]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleChangeRole('user-2', 'anunciante');

            expect(mockAdminService.changeUserRole).toHaveBeenCalledWith('user-2', 'admin');
            expect(mockToast.success).toHaveBeenCalled();
        });

        it('debe degradar admin a anunciante', async () => {
            mockAdminService.changeUserRole.mockResolvedValue({
                success: true,
                message: 'Rol actualizado'
            });

            mockAdminService.getAllUsers.mockResolvedValue([]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleChangeRole('user-1', 'admin');

            expect(mockAdminService.changeUserRole).toHaveBeenCalledWith('user-1', 'anunciante');
        });
    });

    describe('Flujo de Gestión de Categorias', () => {
        it('debe crear nueva categoria', async () => {
            mockAdminService.createCategory.mockResolvedValue({
                success: true,
                category: { id: 'cat-new', nombre: 'Electrónica', descripcion: 'Dispositivos', icono: '📱' },
                message: 'Categoria creada exitosamente'
            });

            const controller = new AdminController(mockAdminService, mockEventBus);

            document.getElementById('admin-category-nombre').value = 'Electrónica';
            document.getElementById('admin-category-descripcion').value = 'Dispositivos';
            document.getElementById('admin-category-icono').value = '📱';

            const event = { preventDefault: vi.fn() };
            await controller.handleCreateCategory(event);

            expect(mockAdminService.createCategory).toHaveBeenCalledWith({
                nombre: 'Electrónica',
                descripcion: 'Dispositivos',
                icono: '📱'
            });
            expect(mockToast.success).toHaveBeenCalledWith('Categoria creada exitosamente');
        });

        it('debe eliminar categoria existente', async () => {
            mockAdminService.deleteCategory.mockResolvedValue({
                success: true,
                message: 'Categoria eliminada exitosamente'
            });

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleDeleteCategory('cat-1');

            expect(mockAdminService.deleteCategory).toHaveBeenCalledWith('cat-1');
            expect(mockToast.success).toHaveBeenCalledWith('Categoria eliminada exitosamente');
        });

        it('debe rechazar categoria sin nombre', async () => {
            const controller = new AdminController(mockAdminService, mockEventBus);

            document.getElementById('admin-category-nombre').value = '';

            const event = { preventDefault: vi.fn() };
            await controller.handleCreateCategory(event);

            expect(mockAdminService.createCategory).not.toHaveBeenCalled();
            expect(mockToast.error).toHaveBeenCalled();
        });
    });

    describe('Flujo Completo End-to-End', () => {
        it('debe simular flujo completo: anunciante crea producto -> admin aprueba -> aparece en publico', async () => {
            const newProduct = {
                id: 'prod-new',
                nombre: 'Calculadora Científica',
                precio: 25,
                estado: 'disponible',
                estado_revision: 'pendiente',
                vendedor: { nombre: 'Estudiante UFG' }
            };

            mockAdminService.getPendingProducts.mockResolvedValue([newProduct]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadPendingProducts();

            const pendingList = document.getElementById('admin-pending-products-list');
            expect(pendingList.innerHTML).toContain('Calculadora Científica');
            expect(pendingList.innerHTML).toContain('Pendiente');

            mockAdminService.approveProduct.mockResolvedValue({
                success: true,
                product: { ...newProduct, estado_revision: 'aprobado' },
                message: 'Producto aprobado exitosamente'
            });

            mockAdminService.getPendingProducts.mockResolvedValue([]);

            await controller.handleApprove('prod-new');

            expect(mockAdminService.approveProduct).toHaveBeenCalledWith('prod-new');
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                expect.stringContaining('admin:product:approved'),
                expect.any(Object)
            );

            mockProductService.getProducts.mockResolvedValue({
                success: true,
                data: [{ ...newProduct, estado_revision: 'aprobado', estado: 'disponible' }]
            });

            const publicProducts = await mockProductService.getProducts();
            expect(publicProducts.success).toBe(true);
            expect(publicProducts.data[0].estado_revision).toBe('aprobado');
            expect(publicProducts.data[0].nombre).toBe('Calculadora Científica');
        });

        it('debe simular flujo completo: anunciante crea producto -> admin rechaza -> no aparece en publico', async () => {
            const newProduct = {
                id: 'prod-rejected',
                nombre: 'Producto Prohibido',
                precio: 10,
                estado: 'disponible',
                estado_revision: 'pendiente',
                vendedor: { nombre: 'Vendedor' }
            };

            mockAdminService.getPendingProducts.mockResolvedValue([newProduct]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadPendingProducts();

            controller.handleReject('prod-rejected');
            document.getElementById('admin-reject-reason').value = 'Producto no permitido en el marketplace';

            mockAdminService.rejectProduct.mockResolvedValue({
                success: true,
                product: {
                    ...newProduct,
                    estado_revision: 'rechazado',
                    revision_comentario: 'Producto no permitido en el marketplace'
                },
                message: 'Producto rechazado'
            });

            mockAdminService.getPendingProducts.mockResolvedValue([]);

            await controller.handleConfirmReject();

            expect(mockAdminService.rejectProduct).toHaveBeenCalledWith(
                'prod-rejected',
                'Producto no permitido en el marketplace'
            );

            mockProductService.getProducts.mockResolvedValue({
                success: true,
                data: []
            });

            const publicProducts = await mockProductService.getProducts();
            expect(publicProducts.data).toHaveLength(0);
        });
    });
});
