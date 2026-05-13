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
            // Tabs
            tabButtons: document.querySelectorAll('.admin-tab-btn'),
            tabPanels: document.querySelectorAll('.admin-tab-panel'),

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
            userSearchInput: document.getElementById('admin-user-search'),

            // Categories section
            categoriesList: document.getElementById('admin-categories-list'),
            btnLoadCategories: document.getElementById('btn-load-categories'),
            btnToggleCategoryForm: document.getElementById('btn-toggle-category-form'),
            btnCloseCategoryForm: document.getElementById('btn-close-category-form'),
            btnEditCategoryOrder: document.getElementById('btn-edit-category-order'),
            categoryFormContainer: document.getElementById('admin-category-form-container'),
            categoryFormTitle: document.getElementById('admin-category-form-title'),
            formCategory: document.getElementById('admin-form-category'),
            categoryNombre: document.getElementById('admin-category-nombre'),
            categoryDescripcion: document.getElementById('admin-category-descripcion'),
            categoryIcono: document.getElementById('admin-category-icono'),
            btnCreateCategory: document.getElementById('btn-create-category'),
            btnCancelCategoryEdit: document.getElementById('btn-cancel-category-edit'),
            categorySearchInput: document.getElementById('admin-category-search'),

            // Reorder modal
            reorderModal: document.getElementById('modal-reorder-categories'),
            btnCloseReorder: document.querySelector('.btn-close-reorder'),
            btnCancelReorder: document.getElementById('btn-cancel-reorder'),
            btnSaveReorder: document.getElementById('btn-save-reorder'),
            reorderList: document.getElementById('reorder-categories-list'),

            // Review modal
            reviewModal: document.getElementById('modal-review-product'),
            reviewDetail: document.getElementById('review-product-detail'),
            btnCloseReview: document.querySelector('.btn-close-review'),

            // General
            adminError: document.getElementById('admin-error')
        };

        this.pendingRejectProductId = null;
        this.editingCategoryId = null;
        this.allUsers = []; // Store all users for filtering
        this.allCategories = []; // Store all categories for filtering
    }

    bindEvents() {
        // Tab navigation
        this.elements.tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.switchTab(tabId);
            });
        });

        if (this.elements.btnLoadPending) {
            this.elements.btnLoadPending.addEventListener('click', () => this.loadPendingProducts());
        }

        if (this.elements.btnLoadUsers) {
            this.elements.btnLoadUsers.addEventListener('click', () => this.loadUsers());
        }

        // User search filter
        if (this.elements.userSearchInput) {
            this.elements.userSearchInput.addEventListener('input', (e) => {
                this.filterUsers(e.target.value);
            });
        }

        if (this.elements.btnLoadCategories) {
            this.elements.btnLoadCategories.addEventListener('click', () => this.loadCategories());
        }

        // Category form toggle
        if (this.elements.btnToggleCategoryForm) {
            this.elements.btnToggleCategoryForm.addEventListener('click', () => this.toggleCategoryForm());
        }

        if (this.elements.btnCloseCategoryForm) {
            this.elements.btnCloseCategoryForm.addEventListener('click', () => this.closeCategoryForm());
        }

        // Edit order button
        if (this.elements.btnEditCategoryOrder) {
            this.elements.btnEditCategoryOrder.addEventListener('click', () => this.openReorderModal());
        }

        // Reorder modal close buttons
        if (this.elements.btnCloseReorder) {
            this.elements.btnCloseReorder.addEventListener('click', () => this.closeReorderModal());
        }

        if (this.elements.btnCancelReorder) {
            this.elements.btnCancelReorder.addEventListener('click', () => this.closeReorderModal());
        }

        // Save reorder
        if (this.elements.btnSaveReorder) {
            this.elements.btnSaveReorder.addEventListener('click', () => this.saveCategoryOrder());
        }

        // Review modal close
        if (this.elements.btnCloseReview) {
            this.elements.btnCloseReview.addEventListener('click', () => this.closeReviewModal());
        }

        // Close review modal on outside click
        if (this.elements.reviewModal) {
            this.elements.reviewModal.addEventListener('click', (e) => {
                if (e.target === this.elements.reviewModal) {
                    this.closeReviewModal();
                }
            });
        }

        // Close modal on outside click
        if (this.elements.reorderModal) {
            window.addEventListener('click', (e) => {
                if (e.target === this.elements.reorderModal) {
                    this.closeReorderModal();
                }
            });
        }

        // Category search filter
        if (this.elements.categorySearchInput) {
            this.elements.categorySearchInput.addEventListener('input', (e) => {
                this.filterCategories(e.target.value);
            });
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
                // Click on approve button
                if (e.target.dataset.action === 'approve') {
                    e.stopPropagation();
                    this.handleApprove(e.target.dataset.productId);
                    return;
                }
                // Click on reject button
                if (e.target.dataset.action === 'reject') {
                    e.stopPropagation();
                    this.handleReject(e.target.dataset.productId);
                    return;
                }
                // Click on the card itself - view detail
                const item = e.target.closest('.admin-product-item.clickable');
                if (item && item.dataset.productId) {
                    this.openReviewModal(item.dataset.productId);
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

        this.pendingProducts = products;

        container.innerHTML = products.map(product => `
            <div class="admin-product-item clickable" data-product-id="${product.id}" data-action="view-detail">
                <div class="admin-product-info">
                    <h4>${UIUtils.escapeHtml(product.nombre)}</h4>
                    <p>Vendedor: ${UIUtils.escapeHtml(product.vendedor?.nombre || 'N/A')}</p>
                    <p>Precio: $${parseFloat(product.precio).toFixed(2)}</p>
                    <div class="product-badges">
                        <span class="rol-badge rol-badge-pendiente">Pendiente</span>
                    </div>
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

    /**
     * Open the review modal for a pending product
     * @param {string} productId
     */
    openReviewModal(productId) {
        const product = this.pendingProducts?.find(p => p.id.toString() === productId.toString());
        if (!product) {
            toast.error('Producto no encontrado');
            return;
        }

        this.renderReviewDetail(product);

        if (this.elements.reviewModal) {
            this.elements.reviewModal.style.display = 'block';
        }
    }

    /**
     * Close the review modal
     */
    closeReviewModal() {
        if (this.elements.reviewModal) {
            this.elements.reviewModal.style.display = 'none';
        }
    }

    /**
     * Render product detail inside the review modal
     * @param {Object} product
     */
    renderReviewDetail(product) {
        const container = this.elements.reviewDetail;
        if (!container) return;

        const imagenes = product.imagenes_urls && product.imagenes_urls.length > 0 
            ? product.imagenes_urls 
            : product.imagen_url 
                ? [product.imagen_url] 
                : [];

        const categoriaNombre = product.categorias?.nombre 
            || product.categoria?.nombre 
            || product.categoria 
            || 'Sin categoria';

        container.innerHTML = `
            <div class="review-product-detail">
                ${imagenes.length > 0 ? `
                <div class="review-images">
                    ${imagenes.map((url, idx) => `
                        <div class="review-image-wrapper">
                            <img src="${UIUtils.escapeHtml(url)}" alt="${UIUtils.escapeHtml(product.nombre)}" class="review-image clickable-zoom" data-index="${idx}" onerror="this.style.display='none'">
                            <button class="btn-zoom-image" data-index="${idx}" title="Ver imagen mas grande">🔍</button>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                <div class="review-info-grid">
                    <div class="review-field">
                        <span class="review-label">Nombre</span>
                        <span class="review-value">${UIUtils.escapeHtml(product.nombre)}</span>
                    </div>
                    <div class="review-field">
                        <span class="review-label">Precio</span>
                        <span class="review-value">$${parseFloat(product.precio).toFixed(2)}</span>
                    </div>
                    <div class="review-field">
                        <span class="review-label">Vendedor</span>
                        <span class="review-value">${UIUtils.escapeHtml(product.vendedor?.nombre || 'N/A')}</span>
                    </div>
                    <div class="review-field">
                        <span class="review-label">Email Vendedor</span>
                        <span class="review-value">${UIUtils.escapeHtml(product.vendedor?.email || 'N/A')}</span>
                    </div>
                    <div class="review-field">
                        <span class="review-label">Categoria</span>
                        <span class="review-value">${UIUtils.escapeHtml(categoriaNombre)}</span>
                    </div>
                    <div class="review-field">
                        <span class="review-label">Fecha de Publicacion</span>
                        <span class="review-value">${product.created_at ? new Date(product.created_at).toLocaleDateString('es-SV') : 'N/A'}</span>
                    </div>
                </div>

                <div class="review-description">
                    <span class="review-label">Descripcion</span>
                    <p>${UIUtils.escapeHtml(product.descripcion || 'Sin descripcion')}</p>
                </div>

                <div class="review-actions">
                    <button class="btn-action btn-approve review-btn-action" data-action="approve-from-review" data-product-id="${product.id}">
                        Aprobar Producto
                    </button>
                    <button class="btn-action btn-reject review-btn-action" data-action="reject-from-review" data-product-id="${product.id}">
                        Rechazar Producto
                    </button>
                    <button class="btn-secondary review-btn-action btn-close-review-inline">
                        Cerrar
                    </button>
                </div>
            </div>
        `;

        // Bind zoom buttons
        container.querySelectorAll('.btn-zoom-image, .review-image.clickable-zoom').forEach(el => {
            el.addEventListener('click', (e) => {
                const idx = parseInt(e.currentTarget.dataset.index);
                if (!isNaN(idx) && imagenes[idx]) {
                    this.openImageZoom(imagenes[idx], product.nombre);
                }
            });
        });
        const btnInlineClose = container.querySelector('.btn-close-review-inline');
        if (btnInlineClose) {
            btnInlineClose.addEventListener('click', () => this.closeReviewModal());
        }

        // Bind approve button in review modal
        const btnApproveReview = container.querySelector('[data-action="approve-from-review"]');
        if (btnApproveReview) {
            btnApproveReview.addEventListener('click', (e) => {
                this.closeReviewModal();
                this.handleApprove(e.target.dataset.productId);
            });
        }

        // Bind reject button in review modal
        const btnRejectReview = container.querySelector('[data-action="reject-from-review"]');
        if (btnRejectReview) {
            btnRejectReview.addEventListener('click', (e) => {
                this.closeReviewModal();
                this.handleReject(e.target.dataset.productId);
            });
        }
    }

    /**
     * Open an image zoom overlay
     * @param {string} imageUrl
     * @param {string} productName
     */
    openImageZoom(imageUrl, productName) {
        // Remove existing overlay if any
        const existing = document.getElementById('image-zoom-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'image-zoom-overlay';
        overlay.className = 'modal';
        overlay.style.cssText = 'display: flex; align-items: center; justify-content: center; z-index: 99999;';
        overlay.innerHTML = `
            <div class="zoom-overlay-content">
                <span class="close zoom-close">&times;</span>
                <img src="${UIUtils.escapeHtml(imageUrl)}" alt="${UIUtils.escapeHtml(productName)}" class="zoom-image">
                <p class="zoom-caption">${UIUtils.escapeHtml(productName)}</p>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close handlers
        overlay.querySelector('.zoom-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const o = document.getElementById('image-zoom-overlay');
                if (o) o.remove();
            }
        });
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
            this.allUsers = users; // Store all users for filtering
            this.renderUsers(users);
        } catch (error) {
            toast.error(error.message);
            console.error('Error loading users:', error);
        }
    }

    renderUsers(users) {
        const container = this.elements.usersList;
        if (!container) return;

        if (!users || users.length === 0) {
            const searchTerm = this.elements.userSearchInput?.value?.trim();
            if (searchTerm) {
                container.innerHTML = `<p class="empty-message">No se encontraron usuarios que coincidan con "${UIUtils.escapeHtml(searchTerm)}"</p>`;
            } else {
                container.innerHTML = '<p class="empty-message">No hay usuarios registrados</p>';
            }
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="admin-user-item" data-user-id="${user.user_id || user.id}">
                <div class="admin-user-info">
                    <h4>${UIUtils.escapeHtml(user.nombre || 'Sin nombre')}</h4>
                    <p>${UIUtils.escapeHtml(user.email)}</p>
                    <div class="user-badges">
                        <span class="rol-badge rol-badge-${user.rol}">${UIUtils.escapeHtml(user.rol)}</span>
                    </div>
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
                this.allCategories = categories; // Store all categories for filtering
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
            const searchTerm = this.elements.categorySearchInput?.value?.trim();
            if (searchTerm) {
                container.innerHTML = `<p class="empty-message">No se encontraron categorías que coincidan con "${UIUtils.escapeHtml(searchTerm)}"</p>`;
            } else {
                container.innerHTML = '<p class="empty-message">No hay categorias. Hacé clic en "Nueva Categoría" para crear una.</p>';
            }
            return;
        }

        container.innerHTML = categories.map((cat, index) => `
            <div class="admin-category-item" data-category-id="${cat.id}">
                <div class="admin-category-info">
                    <div class="category-info-content">
                        <h4>${cat.icono || ''} ${cat.icono ? ' ' : ''}${UIUtils.escapeHtml(cat.nombre)}</h4>
                        <p>${UIUtils.escapeHtml(cat.descripcion || 'Sin descripcion')}</p>
                        <span class="category-order-badge">Orden: ${cat.orden || index + 1}</span>
                    </div>
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

    /**
     * Toggle category form visibility
     */
    toggleCategoryForm() {
        const container = this.elements.categoryFormContainer;
        if (container) {
            const isHidden = container.style.display === 'none';
            container.style.display = isHidden ? 'block' : 'none';
            
            if (this.elements.btnToggleCategoryForm) {
                this.elements.btnToggleCategoryForm.textContent = isHidden ? '✖ Ocultar Formulario' : '➕ Nueva Categoría';
            }
            
            if (isHidden && !this.editingCategoryId) {
                this.resetCategoryForm();
            }
            
            if (isHidden) {
                this.elements.categoryNombre?.focus();
            }
        }
    }

    /**
     * Close category form
     */
    closeCategoryForm() {
        if (this.elements.categoryFormContainer) {
            this.elements.categoryFormContainer.style.display = 'none';
        }
        if (this.elements.btnToggleCategoryForm) {
            this.elements.btnToggleCategoryForm.textContent = '➕ Nueva Categoría';
        }
        this.resetCategoryForm();
    }

    /**
     * Filter categories by name
     * @param {string} searchTerm - The search term to filter by
     */
    filterCategories(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.renderCategories(this.allCategories);
            return;
        }

        const filtered = this.allCategories.filter(cat => {
            const nombre = (cat.nombre || '').toLowerCase();
            const descripcion = (cat.descripcion || '').toLowerCase();
            return nombre.includes(term) || descripcion.includes(term);
        });

        this.renderCategories(filtered);
    }

    /**
     * Open reorder modal
     */
    async openReorderModal() {
        try {
            const categoryService = window.app?.services?.categories;
            if (!categoryService) return;

            const categories = await categoryService.getAll();
            this.categoriesToReorder = [...categories]; // Store a copy for reordering

            this.renderReorderList();

            if (this.elements.reorderModal) {
                this.elements.reorderModal.style.display = 'block';
            }
        } catch (error) {
            toast.error('Error al cargar categorías para reordenar: ' + error.message);
            console.error('Error opening reorder modal:', error);
        }
    }

    /**
     * Close reorder modal
     */
    closeReorderModal() {
        if (this.elements.reorderModal) {
            this.elements.reorderModal.style.display = 'none';
        }
        this.categoriesToReorder = null;
    }

    /**
     * Render reorder list with drag handles
     */
    renderReorderList() {
        const container = this.elements.reorderList;
        if (!container || !this.categoriesToReorder) return;

        container.innerHTML = this.categoriesToReorder.map((cat, index) => `
            <div class="reorder-item" data-category-id="${cat.id}" data-index="${index}" draggable="true">
                <div class="reorder-drag-handle" title="Arrastrar para reordenar">
                    ☰
                </div>
                <div class="reorder-item-info">
                    <span class="reorder-position">${index + 1}</span>
                    <span class="reorder-category-name">
                        ${cat.icono || ''}${cat.icono ? ' ' : ''}${UIUtils.escapeHtml(cat.nombre)}
                    </span>
                </div>
                <div class="reorder-item-actions">
                    <button class="btn-reorder-move btn-reorder-up" data-action="move-up" data-index="${index}" title="Mover arriba">
                        ▲
                    </button>
                    <button class="btn-reorder-move btn-reorder-down" data-action="move-down" data-index="${index}" title="Mover abajo">
                        ▼
                    </button>
                </div>
            </div>
        `).join('');

        // Bind drag and drop events
        this.bindDragAndDrop();

        // Bind move buttons
        container.querySelectorAll('.btn-reorder-move').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                const index = parseInt(e.target.dataset.index);
                this.moveCategoryInReorder(action, index);
            });
        });
    }

    /**
     * Bind drag and drop events
     */
    bindDragAndDrop() {
        const items = this.elements.reorderList?.querySelectorAll('.reorder-item');
        if (!items) return;

        let draggedItem = null;

        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedItem = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                draggedItem = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (draggedItem && draggedItem !== item) {
                    item.classList.add('drag-over');
                }
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                
                if (draggedItem && draggedItem !== item) {
                    const fromIndex = parseInt(draggedItem.dataset.index);
                    const toIndex = parseInt(item.dataset.index);
                    this.swapCategoriesInReorder(fromIndex, toIndex);
                }
            });
        });
    }

    /**
     * Move category up or down in reorder list
     * @param {string} action - 'move-up' or 'move-down'
     * @param {number} index - Current index of the category
     */
    moveCategoryInReorder(action, index) {
        const targetIndex = action === 'move-up' ? index - 1 : index + 1;
        
        if (targetIndex < 0 || targetIndex >= this.categoriesToReorder.length) return;

        // Swap in array
        const temp = this.categoriesToReorder[index];
        this.categoriesToReorder[index] = this.categoriesToReorder[targetIndex];
        this.categoriesToReorder[targetIndex] = temp;

        // Re-render
        this.renderReorderList();
    }

    /**
     * Swap two categories in reorder list
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Target index
     */
    swapCategoriesInReorder(fromIndex, toIndex) {
        const temp = this.categoriesToReorder[fromIndex];
        this.categoriesToReorder[fromIndex] = this.categoriesToReorder[toIndex];
        this.categoriesToReorder[toIndex] = temp;

        // Re-render
        this.renderReorderList();
    }

    /**
     * Save new category order
     */
    async saveCategoryOrder() {
        try {
            const categoryService = window.app?.services?.categories;
            if (!categoryService) return;

            console.log('Guardando orden de categorías:', this.categoriesToReorder.map((c, i) => ({
                id: c.id,
                nombre: c.nombre,
                nuevoOrden: i + 1
            })));

            // Update order for all categories
            const updatePromises = this.categoriesToReorder.map((cat, index) => {
                const newOrder = index + 1;
                console.log(`Actualizando categoría ${cat.nombre} (ID: ${cat.id}) - Nuevo orden: ${newOrder}`);
                
                // Create update data object explicitly with orden as a number
                const updateData = {
                    nombre: String(cat.nombre),
                    descripcion: cat.descripcion || null,
                    icono: cat.icono || null,
                    orden: Number(newOrder)  // Force it to be a number
                };
                
                console.log(`[saveCategoryOrder] updateData for ${cat.nombre}:`, updateData);
                
                return categoryService.update(cat.id, updateData);
            });

            const results = await Promise.all(updatePromises);
            console.log('Resultados de actualización:', results);

            toast.success('Orden de categorías guardado exitosamente');
            this.closeReorderModal();
            
            // Force reload and update window.categories
            console.log('Recargando categorías y actualizando vista...');
            await this.loadCategories();
            
            // Update window.categories for product view
            if (window.app?.services?.categories) {
                const updatedCategories = await window.app.services.categories.getAll();
                window.categories = updatedCategories;
                console.log('window.categories actualizado:', window.categories);
                
                // Re-render category filters in product view
                if (window.app?.controllers?.products) {
                    window.app.controllers.products.updateCategories(updatedCategories);
                    window.app.controllers.products.renderCategoryFilters();
                    window.app.controllers.products.renderCategorySelect();
                }
            }
        } catch (error) {
            toast.error('Error al guardar orden: ' + error.message);
            console.error('Error saving category order:', error);
        }
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
        try {
            // Assign order (next sequential number)
            const categoryService = window.app?.services?.categories;
            const categories = await categoryService.getAll();
            const maxOrder = categories.reduce((max, cat) => Math.max(max, cat.orden || 0), 0);
            data.orden = maxOrder + 1;
            
            const result = await this.adminService.createCategory(data);
            if (result.success) {
                toast.success(result.message);
                this.eventEmitter.emit(EVENTS.ADMIN.CATEGORY_CREATED, result.category);
                this.closeCategoryForm();
                this.refreshCategories();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al crear categoría: ' + error.message);
            console.error('Error creating category:', error);
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
            const btnCancel = this.elements.btnCancelCategoryEdit;
            if (btnCreate) btnCreate.textContent = 'Actualizar Categoria';
            if (btnCancel) btnCancel.style.display = 'inline-block';
            
            // Update form title
            if (this.elements.categoryFormTitle) {
                this.elements.categoryFormTitle.textContent = 'Editar Categoría';
            }

            // Show form container
            if (this.elements.categoryFormContainer) {
                this.elements.categoryFormContainer.style.display = 'block';
            }
            if (this.elements.btnToggleCategoryForm) {
                this.elements.btnToggleCategoryForm.textContent = '✖ Ocultar Formulario';
            }

            // Scroll to form
            this.elements.categoryFormContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (error) {
            toast.error('Error al cargar categoria para editar');
            console.error('Error populating edit form:', error);
        }
    }

    async handleUpdateCategory(categoryId, data) {
        try {
            // Get current category to preserve order
            const categoryService = window.app?.services?.categories;
            const categories = await categoryService.getAll();
            const currentCategory = categories.find(c => c.id.toString() === categoryId.toString());
            
            const result = await this.adminService.updateCategory(categoryId, {
                ...data,
                orden: currentCategory?.orden || 0
            });
            
            if (result.success) {
                toast.success(result.message || 'Categoria actualizada exitosamente');
                this.eventEmitter.emit(EVENTS.ADMIN.CATEGORY_UPDATED, { id: categoryId, ...data });
                this.closeCategoryForm();
                this.refreshCategories();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error('Error al actualizar categoría: ' + error.message);
            console.error('Error updating category:', error);
        }
    }

    resetCategoryForm() {
        this.editingCategoryId = null;
        if (this.elements.formCategory) this.elements.formCategory.reset();
        const btnCreate = this.elements.btnCreateCategory;
        const btnCancel = this.elements.btnCancelCategoryEdit;
        if (btnCreate) btnCreate.textContent = 'Crear Categoria';
        if (btnCancel) btnCancel.style.display = 'none';
        if (this.elements.categoryFormTitle) {
            this.elements.categoryFormTitle.textContent = 'Crear Nueva Categoría';
        }
    }

    /**
     * Switch between admin tabs
     * @param {string} tabId - The tab ID to switch to
     */
    switchTab(tabId) {
        // Remove active class from all tabs and panels
        this.elements.tabButtons.forEach(btn => btn.classList.remove('active'));
        this.elements.tabPanels.forEach(panel => panel.classList.remove('active'));

        // Add active class to selected tab and panel
        const selectedBtn = document.querySelector(`.admin-tab-btn[data-tab="${tabId}"]`);
        const selectedPanel = document.getElementById(`tab-${tabId}`);

        if (selectedBtn) selectedBtn.classList.add('active');
        if (selectedPanel) selectedPanel.classList.add('active');

        // Auto-load content when switching tabs
        if (tabId === 'productos-pendientes' && this.elements.pendingProductsList) {
            const hasContent = this.elements.pendingProductsList.querySelector('.admin-product-item');
            if (!hasContent) this.loadPendingProducts();
        } else if (tabId === 'gestion-categorias' && this.elements.categoriesList) {
            const hasContent = this.elements.categoriesList.querySelector('.admin-category-item');
            if (!hasContent) this.loadCategories();
        } else if (tabId === 'gestion-usuarios' && this.elements.usersList) {
            const hasContent = this.elements.usersList.querySelector('.admin-user-item');
            if (!hasContent) this.loadUsers();
        }
    }

    /**
     * Filter users by email
     * @param {string} searchTerm - The search term to filter by
     */
    filterUsers(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.renderUsers(this.allUsers);
            return;
        }

        const filtered = this.allUsers.filter(user => {
            const email = (user.email || '').toLowerCase();
            return email.includes(term);
        });

        this.renderUsers(filtered);
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
