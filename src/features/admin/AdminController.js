/**
 * Admin Controller
 * Manages admin panel UI for product moderation, user management, and category CRUD
 */

import { EVENTS } from '../../config/events.js';
import { MESSAGES } from '../../config/messages.js';
import { eventBus, toast, UIUtils } from '../../core/utils/index.js';

export class AdminController {
    constructor(adminService, eventEmitter) {
        this.adminService = adminService;
        this.eventEmitter = eventEmitter;
        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
    }

    cacheElements() {
        this.elements = {
            // Pending products section
            pendingProductsList: document.getElementById('admin-pending-products-list'),
            btnLoadPending: document.getElementById('btn-load-pending'),

            // Approve/Reject modal
            rejectModal: document.getElementById('admin-reject-modal'),
            rejectReasonInput: document.getElementById('admin-reject-reason'),
            btnConfirmReject: document.getElementById('btn-confirm-reject'),
            btnCancelReject: document.getElementById('btn-cancel-reject'),
            btnCloseRejectModal: document.getElementById('btn-close-reject-modal'),

            // Users section
            usersList: document.getElementById('admin-users-list'),
            btnLoadUsers: document.getElementById('btn-load-users'),

            // Categories section
            categoriesList: document.getElementById('admin-categories-list'),
            btnLoadCategories: document.getElementById('btn-load-categories'),
            formCategory: document.getElementById('admin-form-category'),
            categoryNombre: document.getElementById('admin-category-nombre'),
            categoryDescripcion: document.getElementById('admin-category-descripcion'),
            categoryIcono: document.getElementById('admin-category-icono'),
            btnCreateCategory: document.getElementById('btn-create-category'),

            // General
            adminError: document.getElementById('admin-error')
        };

        this.pendingRejectProductId = null;
        this.editingCategoryId = null;
    }

    bindEvents() {
        if (this.elements.btnLoadPending) {
            this.elements.btnLoadPending.addEventListener('click', () => this.loadPendingProducts());
        }

        if (this.elements.btnLoadUsers) {
            this.elements.btnLoadUsers.addEventListener('click', () => this.loadUsers());
        }

        if (this.elements.btnLoadCategories) {
            this.elements.btnLoadCategories.addEventListener('click', () => this.loadCategories());
        }

        if (this.elements.formCategory) {
            this.elements.formCategory.addEventListener('submit', (e) => this.handleCreateCategory(e));
        }

        if (this.elements.btnConfirmReject) {
            this.elements.btnConfirmReject.addEventListener('click', () => this.handleConfirmReject());
        }

        if (this.elements.btnCancelReject) {
            this.elements.btnCancelReject.addEventListener('click', () => this.closeRejectModal());
        }

        if (this.elements.btnCloseRejectModal) {
            this.elements.btnCloseRejectModal.addEventListener('click', () => this.closeRejectModal());
        }

        // Event delegation for dynamic buttons
        if (this.elements.pendingProductsList) {
            this.elements.pendingProductsList.addEventListener('click', (e) => {
                if (e.target.dataset.action === 'approve') {
                    this.handleApprove(e.target.dataset.productId);
                }
                if (e.target.dataset.action === 'reject') {
                    this.handleReject(e.target.dataset.productId);
                }
            });
        }

        if (this.elements.usersList) {
            this.elements.usersList.addEventListener('click', (e) => {
                if (e.target.dataset.action === 'change-role') {
                    this.handleChangeRole(e.target.dataset.userId, e.target.dataset.currentRole);
                }
            });
        }

        if (this.elements.categoriesList) {
            this.elements.categoriesList.addEventListener('click', (e) => {
                if (e.target.dataset.action === 'delete-category') {
                    this.handleDeleteCategory(e.target.dataset.categoryId);
                }
                if (e.target.dataset.action === 'edit-category') {
                    this.populateCategoryEditForm(e.target.dataset.categoryId);
                }
            });
        }

        // Cancel edit button
        const btnCancelEdit = document.getElementById('btn-cancel-category-edit');
        if (btnCancelEdit) {
            btnCancelEdit.addEventListener('click', () => this.resetCategoryForm());
        }
    }

    async loadPendingProducts() {
        try {
            const products = await this.adminService.getPendingProducts();
            this.renderPendingProducts(products);
        } catch (error) {
            toast.error(error.message);
            console.error('Error loading pending products:', error);
        }
    }

    renderPendingProducts(products) {
        const container = this.elements.pendingProductsList;
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay productos pendientes de revision</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="admin-product-item" data-product-id="${product.id}">
                <div class="admin-product-info">
                    <h4>${UIUtils.escapeHtml(product.nombre)}</h4>
                    <p>Vendedor: ${UIUtils.escapeHtml(product.vendedor?.nombre || 'N/A')}</p>
                    <p>Precio: $${parseFloat(product.precio).toFixed(2)}</p>
                    <span class="badge badge-pendiente">Pendiente</span>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-action btn-approve" data-action="approve" data-product-id="${product.id}">
                        Aprobar
                    </button>
                    <button class="btn-action btn-reject" data-action="reject" data-product-id="${product.id}">
                        Rechazar
                    </button>
                </div>
            </div>
        `).join('');
    }

    async handleApprove(productId) {
        try {
            const result = await this.adminService.approveProduct(productId);
            if (result.success) {
                toast.success(result.message);
                this.eventEmitter.emit(EVENTS.ADMIN.PRODUCT_APPROVED, result.product);
                this.loadPendingProducts();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(error.message);
            console.error('Error approving product:', error);
        }
    }

    handleReject(productId) {
        this.pendingRejectProductId = productId;
        if (this.elements.rejectModal) {
            this.elements.rejectModal.style.display = 'block';
        }
        if (this.elements.rejectReasonInput) {
            this.elements.rejectReasonInput.value = '';
            this.elements.rejectReasonInput.focus();
        }
    }

    async handleConfirmReject() {
        const motivo = this.elements.rejectReasonInput?.value?.trim();

        if (!motivo) {
            toast.error(MESSAGES.ADMIN.REJECTION_REASON_REQUIRED);
            return;
        }

        try {
            const result = await this.adminService.rejectProduct(this.pendingRejectProductId, motivo);
            if (result.success) {
                toast.success(result.message);
                this.eventEmitter.emit(EVENTS.ADMIN.PRODUCT_REJECTED, result.product);
                this.closeRejectModal();
                this.loadPendingProducts();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(error.message);
            console.error('Error rejecting product:', error);
        }
    }

    closeRejectModal() {
        if (this.elements.rejectModal) {
            this.elements.rejectModal.style.display = 'none';
        }
        this.pendingRejectProductId = null;
    }

    async loadUsers() {
        try {
            const users = await this.adminService.getAllUsers();
            this.renderUsers(users);
        } catch (error) {
            toast.error(error.message);
            console.error('Error loading users:', error);
        }
    }

    renderUsers(users) {
        const container = this.elements.usersList;
        if (!container) return;

        if (users.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay usuarios registrados</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="admin-user-item" data-user-id="${user.user_id || user.id}">
                <div class="admin-user-info">
                    <h4>${UIUtils.escapeHtml(user.nombre || 'Sin nombre')}</h4>
                    <p>${UIUtils.escapeHtml(user.email)}</p>
                    <span class="badge badge-${user.rol}">${UIUtils.escapeHtml(user.rol)}</span>
                </div>
                <div class="admin-user-actions">
                    <button class="btn-action btn-change-role" 
                        data-action="change-role" 
                        data-user-id="${user.user_id || user.id}" 
                        data-current-role="${user.rol}">
                        ${user.rol === 'admin' ? 'Cambiar a Anunciante' : 'Cambiar a Admin'}
                    </button>
                </div>
            </div>
        `).join('');
    }

    async handleChangeRole(userId, currentRole) {
        // Prevent self-demotion: admin cannot change their own role
        const currentAdminId = this.adminService?.authService?.getCurrentUser?.()?.id;
        if (currentAdminId && userId === currentAdminId) {
            toast.error('No puedes cambiar tu propio rol. Pide a otro administrador que lo haga.');
            return;
        }

        if (!confirm(MESSAGES.ADMIN.ROLE_CHANGE_CONFIRM)) return;

        const newRole = currentRole === 'admin' ? 'anunciante' : 'admin';

        try {
            const result = await this.adminService.changeUserRole(userId, newRole);
            if (result.success) {
                toast.success(MESSAGES.ADMIN.ROLE_CHANGED);
                this.eventEmitter.emit(EVENTS.ADMIN.ROLE_CHANGED, { userId, newRole });
                this.loadUsers();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(error.message);
            console.error('Error changing user role:', error);
        }
    }

    async loadCategories() {
        try {
            const categoryService = window.app?.services?.categories;
            if (categoryService) {
                const categories = await categoryService.getAll();
                this.renderCategories(categories);
            }
        } catch (error) {
            toast.error(error.message);
            console.error('Error loading categories:', error);
        }
    }

    renderCategories(categories) {
        const container = this.elements.categoriesList;
        if (!container) return;

        if (!categories || categories.length === 0) {
            container.innerHTML = '<p class="empty-message">No hay categorias</p>';
            return;
        }

        container.innerHTML = categories.map(cat => `
            <div class="admin-category-item" data-category-id="${cat.id}">
                <div class="admin-category-info">
                    <h4>${cat.icono || ''} ${UIUtils.escapeHtml(cat.nombre)}</h4>
                    <p>${UIUtils.escapeHtml(cat.descripcion || 'Sin descripcion')}</p>
                </div>
                <div class="admin-category-actions">
                    <button class="btn-action btn-edit-category" 
                        data-action="edit-category" 
                        data-category-id="${cat.id}">
                        Editar
                    </button>
                    <button class="btn-action btn-delete-category" 
                        data-action="delete-category" 
                        data-category-id="${cat.id}">
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    async handleCreateCategory(event) {
        event.preventDefault();

        const nombre = this.elements.categoryNombre?.value?.trim();
        const descripcion = this.elements.categoryDescripcion?.value?.trim();
        const icono = this.elements.categoryIcono?.value?.trim();

        if (!nombre) {
            toast.error(MESSAGES.ADMIN.CATEGORY_NAME_REQUIRED);
            return;
        }

        try {
            if (this.editingCategoryId) {
                // Update existing category
                await this.handleUpdateCategory(this.editingCategoryId, { nombre, descripcion, icono });
            } else {
                // Create new category
                await this.createNewCategory({ nombre, descripcion, icono });
            }
        } catch (error) {
            toast.error(error.message);
            console.error('Error handling category:', error);
        }
    }

    async createNewCategory(data) {
        const result = await this.adminService.createCategory(data);
        if (result.success) {
            toast.success(result.message);
            this.eventEmitter.emit(EVENTS.ADMIN.CATEGORY_CREATED, result.category);
            this.resetCategoryForm();
            this.refreshCategories();
        } else {
            toast.error(result.error);
        }
    }

    async populateCategoryEditForm(categoryId) {
        try {
            const categoryService = window.app?.services?.categories;
            if (!categoryService) return;

            const categories = await categoryService.getAll();
            const category = categories.find(c => c.id.toString() === categoryId.toString());
            if (!category) return;

            this.editingCategoryId = categoryId;
            if (this.elements.categoryNombre) this.elements.categoryNombre.value = category.nombre || '';
            if (this.elements.categoryDescripcion) this.elements.categoryDescripcion.value = category.descripcion || '';
            if (this.elements.categoryIcono) this.elements.categoryIcono.value = category.icono || '';

            const btnCreate = this.elements.btnCreateCategory;
            const btnCancel = document.getElementById('btn-cancel-category-edit');
            if (btnCreate) btnCreate.textContent = 'Actualizar Categoria';
            if (btnCancel) btnCancel.style.display = 'inline-block';

            // Scroll to form
            this.elements.formCategory?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            toast.error('Error al cargar categoria para editar');
            console.error('Error populating edit form:', error);
        }
    }

    async handleUpdateCategory(categoryId, data) {
        const result = await this.adminService.updateCategory(categoryId, data);
        if (result.success) {
            toast.success(result.message || 'Categoria actualizada exitosamente');
            this.eventEmitter.emit(EVENTS.ADMIN.CATEGORY_UPDATED, { id: categoryId, ...data });
            this.resetCategoryForm();
            this.refreshCategories();
        } else {
            toast.error(result.error);
        }
    }

    resetCategoryForm() {
        this.editingCategoryId = null;
        if (this.elements.formCategory) this.elements.formCategory.reset();
        const btnCreate = this.elements.btnCreateCategory;
        const btnCancel = document.getElementById('btn-cancel-category-edit');
        if (btnCreate) btnCreate.textContent = 'Crear Categoria';
        if (btnCancel) btnCancel.style.display = 'none';
    }

    async handleDeleteCategory(categoryId) {
        if (!confirm(MESSAGES.ADMIN.CATEGORY_DELETE_CONFIRM)) return;

        try {
            const result = await this.adminService.deleteCategory(categoryId);
            if (result.success) {
                toast.success(result.message);
                this.eventEmitter.emit(EVENTS.ADMIN.CATEGORY_DELETED, { id: categoryId });
                this.refreshCategories();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error(error.message);
            console.error('Error deleting category:', error);
        }
    }

    async refreshCategories() {
        try {
            const categoryService = window.app?.services?.categories;
            if (categoryService) {
                const categories = await categoryService.getAll();
                this.renderCategories(categories);
            }
        } catch (error) {
            console.error('Error refreshing categories:', error);
        }
    }
}

export default AdminController;
