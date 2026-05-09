/**
 * Pruebas Unitarias - AdminController
 * Tests for admin controller UI rendering and event handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Module-scope mocks (vi.mock is hoisted, so these must be declared at module level)
const mockEventBus = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
};

const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn()
};

const mockUIUtils = {
    escapeHtml: (str) => str ? String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''
};

vi.mock('../../src/core/utils/index.js', () => ({
    get eventBus() { return mockEventBus; },
    get toast() { return mockToast; },
    get UIUtils() { return mockUIUtils; }
}));

// Mock adminService
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

describe('AdminController - Unit Tests', () => {
    let AdminController;
    let mockAdminService;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();

        // Set up DOM
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

        // Mock window.app for category service access
        global.window = {
            app: {
                services: {
                    categories: {
                        getAll: vi.fn().mockResolvedValue([])
                    }
                }
            }
        };

        const { AdminController: AC } = await import('../../src/features/admin/AdminController.js');
        AdminController = AC;
    });

    describe('renderPendingProducts', () => {
        it('debe renderizar lista vacia cuando no hay productos pendientes', async () => {
            mockAdminService.getPendingProducts.mockResolvedValue([]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadPendingProducts();

            const list = document.getElementById('admin-pending-products-list');
            expect(list.innerHTML).toContain('No hay productos pendientes');
        });

        it('debe renderizar productos pendientes con botones de aprobar/rechazar', async () => {
            const products = [
                {
                    id: 'prod-1',
                    nombre: 'Laptop Dell',
                    precio: 500,
                    estado_revision: 'pendiente',
                    vendedor: { nombre: 'Juan Perez' }
                },
                {
                    id: 'prod-2',
                    nombre: 'iPhone 14',
                    precio: 800,
                    estado_revision: 'pendiente',
                    vendedor: { nombre: 'Maria Lopez' }
                }
            ];

            mockAdminService.getPendingProducts.mockResolvedValue(products);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadPendingProducts();

            const list = document.getElementById('admin-pending-products-list');
            expect(list.innerHTML).toContain('Laptop Dell');
            expect(list.innerHTML).toContain('iPhone 14');
            expect(list.innerHTML).toContain('btn-approve');
            expect(list.innerHTML).toContain('btn-reject');
            expect(list.innerHTML).toContain('badge-pendiente');
        });

        it('debe escapar HTML en nombres de productos', async () => {
            const products = [
                {
                    id: 'prod-1',
                    nombre: '<script>alert("xss")</script>',
                    precio: 100,
                    estado_revision: 'pendiente',
                    vendedor: { nombre: 'Test' }
                }
            ];

            mockAdminService.getPendingProducts.mockResolvedValue(products);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadPendingProducts();

            const list = document.getElementById('admin-pending-products-list');
            expect(list.innerHTML).not.toContain('<script>');
            expect(list.innerHTML).toContain('&lt;script&gt;');
        });
    });

    describe('renderUsers', () => {
        it('debe renderizar lista vacia cuando no hay usuarios', async () => {
            mockAdminService.getAllUsers.mockResolvedValue([]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadUsers();

            const list = document.getElementById('admin-users-list');
            expect(list.innerHTML).toContain('No hay usuarios registrados');
        });

        it('debe renderizar usuarios con badge de rol', async () => {
            const users = [
                { user_id: 'user-1', nombre: 'Admin User', email: 'admin@test.com', rol: 'admin' },
                { user_id: 'user-2', nombre: 'Seller User', email: 'seller@test.com', rol: 'anunciante' }
            ];

            mockAdminService.getAllUsers.mockResolvedValue(users);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadUsers();

            const list = document.getElementById('admin-users-list');
            expect(list.innerHTML).toContain('Admin User');
            expect(list.innerHTML).toContain('Seller User');
            expect(list.innerHTML).toContain('badge-admin');
            expect(list.innerHTML).toContain('badge-anunciante');
        });

        it('debe mostrar boton de cambio de rol correcto segun rol actual', async () => {
            const users = [
                { user_id: 'user-1', nombre: 'Admin', email: 'admin@test.com', rol: 'admin' },
                { user_id: 'user-2', nombre: 'Seller', email: 'seller@test.com', rol: 'anunciante' }
            ];

            mockAdminService.getAllUsers.mockResolvedValue(users);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadUsers();

            const list = document.getElementById('admin-users-list');
            expect(list.innerHTML).toContain('Cambiar a Anunciante');
            expect(list.innerHTML).toContain('Cambiar a Admin');
        });
    });

    describe('renderCategories', () => {
        it('debe renderizar categorias con icono y descripcion', async () => {
            const categories = [
                { id: 'cat-1', nombre: 'Tecnologia', descripcion: 'Dispositivos electronicos', icono: '📱' },
                { id: 'cat-2', nombre: 'Ropa', descripcion: '', icono: '👕' }
            ];

            global.window.app.services.categories.getAll.mockResolvedValue(categories);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.loadCategories();

            const list = document.getElementById('admin-categories-list');
            expect(list.innerHTML).toContain('Tecnologia');
            expect(list.innerHTML).toContain('Ropa');
            expect(list.innerHTML).toContain('📱');
        });
    });

    describe('handleApprove', () => {
        it('debe aprobar producto y emitir evento', async () => {
            mockAdminService.approveProduct.mockResolvedValue({
                success: true,
                product: { id: 'prod-1', estado_revision: 'aprobado' },
                message: 'Producto aprobado exitosamente'
            });

            mockAdminService.getPendingProducts.mockResolvedValue([]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleApprove('prod-1');

            expect(mockAdminService.approveProduct).toHaveBeenCalledWith('prod-1');
            expect(mockToast.success).toHaveBeenCalledWith('Producto aprobado exitosamente');
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                expect.stringContaining('admin:product:approved'),
                expect.any(Object)
            );
        });

        it('debe mostrar error si aprobacion falla', async () => {
            mockAdminService.approveProduct.mockResolvedValue({
                success: false,
                error: 'No autorizado'
            });

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleApprove('prod-1');

            expect(mockToast.error).toHaveBeenCalledWith('No autorizado');
        });
    });

    describe('handleReject', () => {
        it('debe abrir modal de rechazo', async () => {
            const controller = new AdminController(mockAdminService, mockEventBus);
            controller.handleReject('prod-1');

            const modal = document.getElementById('admin-reject-modal');
            expect(modal.style.display).toBe('block');
            expect(controller.pendingRejectProductId).toBe('prod-1');
        });

        it('debe confirmar rechazo con motivo valido', async () => {
            mockAdminService.rejectProduct.mockResolvedValue({
                success: true,
                product: { id: 'prod-1', estado_revision: 'rechazado' },
                message: 'Producto rechazado'
            });

            mockAdminService.getPendingProducts.mockResolvedValue([]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            controller.handleReject('prod-1');

            const reasonInput = document.getElementById('admin-reject-reason');
            reasonInput.value = 'Foto no clara';

            await controller.handleConfirmReject();

            expect(mockAdminService.rejectProduct).toHaveBeenCalledWith('prod-1', 'Foto no clara');
            expect(mockToast.success).toHaveBeenCalledWith('Producto rechazado');
            expect(mockEventBus.emit).toHaveBeenCalledWith(
                expect.stringContaining('admin:product:rejected'),
                expect.any(Object)
            );
        });

        it('debe rechazar si motivo esta vacio', async () => {
            const controller = new AdminController(mockAdminService, mockEventBus);
            controller.handleReject('prod-1');

            const reasonInput = document.getElementById('admin-reject-reason');
            reasonInput.value = '';

            await controller.handleConfirmReject();

            expect(mockAdminService.rejectProduct).not.toHaveBeenCalled();
            expect(mockToast.error).toHaveBeenCalled();
        });

        it('debe cerrar modal despues de rechazo exitoso', async () => {
            mockAdminService.rejectProduct.mockResolvedValue({
                success: true,
                product: { id: 'prod-1' },
                message: 'Producto rechazado'
            });

            mockAdminService.getPendingProducts.mockResolvedValue([]);

            const controller = new AdminController(mockAdminService, mockEventBus);
            controller.handleReject('prod-1');

            const reasonInput = document.getElementById('admin-reject-reason');
            reasonInput.value = 'Motivo de prueba';

            await controller.handleConfirmReject();

            const modal = document.getElementById('admin-reject-modal');
            expect(modal.style.display).toBe('none');
            expect(controller.pendingRejectProductId).toBeNull();
        });
    });

    describe('handleChangeRole', () => {
        it('debe cambiar rol de anunciante a admin', async () => {
            mockAdminService.changeUserRole.mockResolvedValue({
                success: true,
                message: 'Rol actualizado'
            });

            mockAdminService.getAllUsers.mockResolvedValue([]);

            global.confirm = vi.fn().mockReturnValue(true);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleChangeRole('user-1', 'anunciante');

            expect(mockAdminService.changeUserRole).toHaveBeenCalledWith('user-1', 'admin');
            expect(mockToast.success).toHaveBeenCalled();
        });

        it('debe cambiar rol de admin a anunciante', async () => {
            mockAdminService.changeUserRole.mockResolvedValue({
                success: true,
                message: 'Rol actualizado'
            });

            mockAdminService.getAllUsers.mockResolvedValue([]);
            global.confirm = vi.fn().mockReturnValue(true);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleChangeRole('user-1', 'admin');

            expect(mockAdminService.changeUserRole).toHaveBeenCalledWith('user-1', 'anunciante');
        });

        it('debe cancelar si usuario no confirma', async () => {
            global.confirm = vi.fn().mockReturnValue(false);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleChangeRole('user-1', 'anunciante');

            expect(mockAdminService.changeUserRole).not.toHaveBeenCalled();
        });
    });

    describe('handleCreateCategory', () => {
        it('debe crear categoria con datos validos', async () => {
            mockAdminService.createCategory.mockResolvedValue({
                success: true,
                category: { id: 'cat-1', nombre: 'Nueva Categoria' },
                message: 'Categoria creada exitosamente'
            });

            const controller = new AdminController(mockAdminService, mockEventBus);

            document.getElementById('admin-category-nombre').value = 'Nueva Categoria';
            document.getElementById('admin-category-descripcion').value = 'Descripcion';
            document.getElementById('admin-category-icono').value = '🆕';

            const event = { preventDefault: vi.fn() };
            await controller.handleCreateCategory(event);

            expect(mockAdminService.createCategory).toHaveBeenCalledWith({
                nombre: 'Nueva Categoria',
                descripcion: 'Descripcion',
                icono: '🆕'
            });
            expect(mockToast.success).toHaveBeenCalledWith('Categoria creada exitosamente');
        });

        it('debe rechazar si nombre esta vacio', async () => {
            const controller = new AdminController(mockAdminService, mockEventBus);

            document.getElementById('admin-category-nombre').value = '';

            const event = { preventDefault: vi.fn() };
            await controller.handleCreateCategory(event);

            expect(mockAdminService.createCategory).not.toHaveBeenCalled();
            expect(mockToast.error).toHaveBeenCalled();
        });
    });

    describe('handleDeleteCategory', () => {
        it('debe eliminar categoria con confirmacion', async () => {
            mockAdminService.deleteCategory.mockResolvedValue({
                success: true,
                message: 'Categoria eliminada exitosamente'
            });

            global.confirm = vi.fn().mockReturnValue(true);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleDeleteCategory('cat-1');

            expect(mockAdminService.deleteCategory).toHaveBeenCalledWith('cat-1');
            expect(mockToast.success).toHaveBeenCalledWith('Categoria eliminada exitosamente');
        });

        it('debe cancelar si usuario no confirma', async () => {
            global.confirm = vi.fn().mockReturnValue(false);

            const controller = new AdminController(mockAdminService, mockEventBus);
            await controller.handleDeleteCategory('cat-1');

            expect(mockAdminService.deleteCategory).not.toHaveBeenCalled();
        });
    });

    describe('closeRejectModal', () => {
        it('debe cerrar modal y limpiar estado', async () => {
            const controller = new AdminController(mockAdminService, mockEventBus);
            controller.handleReject('prod-1');

            expect(controller.pendingRejectProductId).toBe('prod-1');

            controller.closeRejectModal();

            const modal = document.getElementById('admin-reject-modal');
            expect(modal.style.display).toBe('none');
            expect(controller.pendingRejectProductId).toBeNull();
        });
    });
});
