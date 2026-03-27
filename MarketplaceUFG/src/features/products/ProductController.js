/**
 * Product Controller
 * Manages product UI with Supabase backend
 */

import { EVENTS } from '../../config/events.js';
import { MESSAGES } from '../../config/messages.js';
import { eventBus, toast, UIUtils } from '../../core/utils/index.js';

export class ProductController {
    constructor(productService, categoryService, storageService, authService) {
        this.productService = productService;
        this.categoryService = categoryService;
        this.storageService = storageService;
        this.authService = authService;
        this.elements = {};
        this.currentImageFile = null;
        this.currentImagePath = null;
        this.currentCategory = '';
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderCategoryFilters();
        this.renderCategorySelect();
    }

    updateCategories(categories) {
        window.categories = categories;
        this.renderCategoryFilters();
        this.renderCategorySelect();
    }

    cacheElements() {
        this.elements = {
            productosGrid: document.getElementById('productos-grid'),
            emptyState: document.getElementById('empty-state'),
            resultsCount: document.getElementById('results-count'),
            buscarProducto: document.getElementById('buscar-producto'),
            categoryFilters: document.getElementById('category-filters'),
            
            formProducto: document.getElementById('form-producto'),
            nombreProducto: document.getElementById('nombre-producto'),
            categoriaProducto: document.getElementById('categoria-producto'),
            precioProducto: document.getElementById('precio-producto'),
            descripcionProducto: document.getElementById('descripcion-producto'),
            imagenProducto: document.getElementById('imagen-producto'),
            previewContainer: document.getElementById('preview-container'),
            previewImagen: document.getElementById('preview-imagen'),
            listaMisProductos: document.getElementById('lista-mis-productos'),
            
            modalDetalle: document.getElementById('modal-detalle'),
            detalleProducto: document.getElementById('detalle-producto'),
            
            vendedorInicio: document.getElementById('vendedor-inicio'),
            vendedorFormulario: document.getElementById('vendedor-formulario'),
            btnNuevoProducto: document.getElementById('btn-nuevo-producto'),
            btnVolverProductos: document.getElementById('btn-volver-productos')
        };
    }

    bindEvents() {
        if (this.elements.buscarProducto) {
            this.elements.buscarProducto.addEventListener(
                'input', 
                UIUtils.debounce(() => this.handleSearch())
            );
        }

        if (this.elements.formProducto) {
            this.elements.formProducto.addEventListener('submit', (e) => this.handleCreate(e));
        }

        if (this.elements.imagenProducto) {
            this.elements.imagenProducto.addEventListener('change', (e) => this.handleImageSelect(e));
        }

        if (this.elements.categoryFilters) {
            this.elements.categoryFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    this.handleCategoryFilter(e.target.dataset.category);
                }
            });
        }

        if (this.elements.modalDetalle) {
            this.elements.modalDetalle.addEventListener('click', (e) => {
                if (e.target === this.elements.modalDetalle) {
                    this.closeModal();
                }
            });
        }

        if (this.elements.btnNuevoProducto) {
            this.elements.btnNuevoProducto.addEventListener('click', () => this.showVendedorFormulario());
        }

        if (this.elements.btnVolverProductos) {
            this.elements.btnVolverProductos.addEventListener('click', () => this.showVendedorInicio());
        }
    }

    showVendedorInicio() {
        if (this.elements.vendedorInicio) {
            this.elements.vendedorInicio.style.display = 'block';
        }
        if (this.elements.vendedorFormulario) {
            this.elements.vendedorFormulario.style.display = 'none';
        }
    }

    showVendedorFormulario() {
        if (this.elements.vendedorInicio) {
            this.elements.vendedorInicio.style.display = 'none';
        }
        if (this.elements.vendedorFormulario) {
            this.elements.vendedorFormulario.style.display = 'block';
        }
        this.renderMyProducts();
    }

    renderCategoryFilters() {
        if (!this.elements.categoryFilters || !window.categories) return;
        
        this.elements.categoryFilters.innerHTML = `
            <button class="filter-btn active" data-category="">Todos</button>
            ${window.categories.map(cat => `
                <button class="filter-btn" data-category="${cat.id}">${cat.icono} ${cat.nombre}</button>
            `).join('')}
        `;
    }

    renderCategorySelect() {
        if (!this.elements.categoriaProducto || !window.categories) return;
        
        this.elements.categoriaProducto.innerHTML = `
            <option value="">Selecciona una categoría</option>
            ${window.categories.map(cat => `
                <option value="${cat.id}">${cat.icono} ${cat.nombre}</option>
            `).join('')}
        `;
    }

    async handleCategoryFilter(categoryId) {
        this.currentCategory = categoryId || '';
        
        const buttons = this.elements.categoryFilters?.querySelectorAll('.filter-btn');
        buttons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === this.currentCategory);
        });

        await this.handleSearch();
    }

    async renderProducts(products = null) {
        const productList = products || await this.productService.getAll();
        const grid = this.elements.productosGrid;
        const emptyState = this.elements.emptyState;

        if (!grid) return;

        if (productList.length === 0) {
            grid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        grid.innerHTML = '';
        productList.forEach(product => {
            const card = this.createProductCard(product);
            grid.appendChild(card);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'producto-card';

        let imagenUrl = product.imagenes_urls && product.imagenes_urls.length > 0 ? product.imagenes_urls[0] : null;
        if (!imagenUrl && product.imagen) {
            imagenUrl = product.imagen;
        }
        
        const imagenHTML = imagenUrl 
            ? `<img src="${imagenUrl}" alt="${UIUtils.escapeHtml(product.nombre)}">`
            : 'IMG';

        const categoriaNombre = product.categorias?.nombre || product.categoriaNombre;
        const categoriaHTML = categoriaNombre 
            ? `<span class="producto-categoria">${UIUtils.escapeHtml(categoriaNombre)}</span>`
            : '';

        const currentUser = this.authService.getCurrentUser();
        const isOwner = currentUser && product.vendedor_id === currentUser.id;

        const vendedorNombre = product.vendedor?.nombre || product.vendedorNombre || 'Usuario';

        const hasMultipleImages = product.imagenes_urls && product.imagenes_urls.length > 1;
        const imageCountBadge = hasMultipleImages 
            ? `<span class="image-count-badge">${product.imagenes_urls.length} imágenes</span>` 
            : '';

        card.innerHTML = `
            <div class="producto-imagen">${imagenHTML}${imageCountBadge}</div>
            <div class="producto-info">
                ${categoriaHTML}
                <h3 class="producto-nombre">${UIUtils.escapeHtml(product.nombre)}</h3>
                <p class="producto-precio">$${parseFloat(product.precio).toFixed(2)}</p>
                <p class="producto-vendedor">Vendedor: ${UIUtils.escapeHtml(vendedorNombre)}</p>
                <p class="producto-descripcion">${UIUtils.escapeHtml(product.descripcion)}</p>
                <div class="producto-acciones">
                    <button class="btn-action btn-detalle" data-action="detalle">Ver Detalle</button>
                    ${!isOwner ? `<button class="btn-action btn-contactar" data-action="contactar">Contactar</button>` : ''}
                </div>
            </div>
        `;

        const btnDetalle = card.querySelector('[data-action="detalle"]');
        const btnContactar = card.querySelector('[data-action="contactar"]');

        if (btnDetalle) {
            btnDetalle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showProductDetail(product);
            });
        }

        if (btnContactar) {
            btnContactar.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showProductDetail(product);
                setTimeout(() => {
                    const textarea = document.getElementById('mensaje-texto');
                    if (textarea) textarea.focus();
                }, 100);
            });
        }

        card.addEventListener('click', () => this.showProductDetail(product));

        return card;
    }

    async handleSearch() {
        const query = this.elements.buscarProducto?.value || '';
        const results = await this.productService.filterByCategoryAndSearch(this.currentCategory, query);
        
        this.renderProducts(results);
        this.updateResultsCount(results.length, query);
    }

    updateResultsCount(count, query) {
        const element = this.elements.resultsCount;
        if (!element) return;

        const category = window.categories?.find(c => c.id === parseInt(this.currentCategory));
        const categoryText = this.currentCategory 
            ? ` en ${category?.nombre || 'esta categoría'}`
            : '';

        if (!query && !this.currentCategory) {
            element.textContent = `Mostrando ${count} producto${count !== 1 ? 's' : ''}`;
        } else if (count === 0) {
            element.textContent = 'No se encontraron resultados';
        } else if (count === 1) {
            element.textContent = `1 producto encontrado${categoryText}`;
        } else {
            element.textContent = `${count} productos encontrados${categoryText}`;
        }
    }

    async handleCreate(event) {
        event.preventDefault();

        const nombre = this.elements.nombreProducto?.value.trim();
        const categoriaId = this.elements.categoriaProducto?.value;
        const precio = this.elements.precioProducto?.value;
        const descripcion = this.elements.descripcionProducto?.value.trim();

        let imagenesUrls = [];
        let imagenesPaths = [];

        const user = this.authService.getCurrentUser();
        
        if (this.currentImageFiles && this.currentImageFiles.length > 0 && user) {
            try {
                const uploadResult = await this.storageService.uploadImages(
                    this.currentImageFiles,
                    user.id
                );
                imagenesUrls = uploadResult.urls;
                imagenesPaths = uploadResult.paths;
            } catch (error) {
                toast.error('Error al subir imágenes: ' + error.message);
                return;
            }
        }

        const result = await this.productService.create({
            nombre,
            precio,
            descripcion,
            imagenes_urls: imagenesUrls,
            imagenes_paths: imagenesPaths,
            categoria_id: categoriaId ? parseInt(categoriaId) : null
        });

        if (result.success) {
            toast.success(result.message);
            this.clearForm();
            this.showVendedorInicio();
            this.renderProducts();
            this.renderMyProducts();
            
            const misProductos = document.getElementById('mis-productos');
            if (misProductos) {
                setTimeout(() => {
                    misProductos.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 300);
            }
            
            eventBus.emit(EVENTS.PRODUCTS.CREATED, result.product);
        } else {
            toast.error(result.error);
        }
    }

    async handleImageSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const maxImages = 5;
        if (files.length > maxImages) {
            toast.error(`Máximo ${maxImages} imágenes permitidas`);
            event.target.value = '';
            return;
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSizeMB = 5;

        for (const file of files) {
            if (!validTypes.includes(file.type)) {
                toast.error('Solo se permiten imágenes (JPG, PNG, GIF, WebP)');
                return;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                toast.error(`La imagen no puede exceder ${maxSizeMB}MB`);
                return;
            }
        }

        this.currentImageFiles = files;
        
        this.renderImagePreviews(files);
    }

    renderImagePreviews(files) {
        const container = this.elements.previewContainer;
        const imagesContainer = document.getElementById('preview-images');
        
        if (!container || !imagesContainer) return;

        imagesContainer.innerHTML = '';
        
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.className = 'preview-image-wrapper';
                wrapper.innerHTML = `
                    <img src="${e.target.result}" alt="Preview ${index + 1}">
                    <button type="button" class="btn-remove-preview" data-index="${index}">X</button>
                `;
                imagesContainer.appendChild(wrapper);
                
                const removeBtn = wrapper.querySelector('.btn-remove-preview');
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removePreviewImage(index);
                });
            };
            reader.readAsDataURL(file);
        });

        container.style.display = 'block';
    }

    removePreviewImage(index) {
        if (!this.currentImageFiles) return;
        
        this.currentImageFiles.splice(index, 1);
        
        if (this.currentImageFiles.length === 0) {
            this.clearImage();
        } else {
            this.renderImagePreviews(this.currentImageFiles);
        }
    }

    clearImage() {
        this.currentImageFiles = null;
        if (this.elements.imagenProducto) {
            this.elements.imagenProducto.value = '';
        }
        if (this.elements.previewContainer) {
            this.elements.previewContainer.style.display = 'none';
        }
        const imagesContainer = document.getElementById('preview-images');
        if (imagesContainer) {
            imagesContainer.innerHTML = '';
        }
    }

    clearForm() {
        if (this.elements.formProducto) {
            this.elements.formProducto.reset();
        }
        if (this.elements.categoriaProducto) {
            this.renderCategorySelect();
        }
        this.clearImage();
    }

    async renderMyProducts() {
        const container = this.elements.listaMisProductos;
        if (!container) return;

        try {
            const products = await this.productService.getByCurrentUser();

            if (products.length === 0) {
                container.innerHTML = '<p class="empty-message">Aún no has publicado ningún producto</p>';
                return;
            }

            container.innerHTML = '';
            products.forEach(product => {
                const item = this.createMyProductItem(product);
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading my products:', error);
            container.innerHTML = '<p class="empty-message">Error al cargar productos</p>';
        }
    }

    createMyProductItem(product) {
        const item = document.createElement('div');
        item.className = 'producto-item';

        let imagenUrl = product.imagenes_urls && product.imagenes_urls.length > 0 ? product.imagenes_urls[0] : null;
        if (!imagenUrl && product.imagen) {
            imagenUrl = product.imagen;
        }
        
        const imagenHTML = imagenUrl 
            ? `<img src="${imagenUrl}" alt="${UIUtils.escapeHtml(product.nombre)}">`
            : 'IMG';

        const categoriaNombre = product.categorias?.nombre || product.categoriaNombre;
        const categoriaHTML = categoriaNombre 
            ? `<span style="font-size: 0.85rem; color: var(--primary-color);">${categoriaNombre}</span>`
            : '';

        const estadoLabel = product.estado === 'vendido' ? '<span class="badge-vendido">Vendido</span>' : '';

        item.innerHTML = `
            <div class="producto-item-imagen">${imagenHTML}</div>
            <div class="producto-item-info">
                <h4>${UIUtils.escapeHtml(product.nombre)}</h4>
                <p>Precio: $${parseFloat(product.precio).toFixed(2)}</p>
                ${categoriaHTML}
                ${estadoLabel}
            </div>
            <div class="producto-item-actions">
                <button class="btn-small btn-delete" data-product-id="${product.id}">
                    Eliminar
                </button>
            </div>
        `;

        const deleteBtn = item.querySelector('[data-product-id]');
        deleteBtn.addEventListener('click', () => this.handleDelete(product.id));

        return item;
    }

    async handleDelete(productId) {
        if (!confirm(MESSAGES.PRODUCTS.DELETE_CONFIRM)) return;

        const result = await this.productService.delete(productId);

        if (result.success) {
            toast.success(result.message);
            this.renderProducts();
            this.renderMyProducts();
            eventBus.emit(EVENTS.PRODUCTS.DELETED, productId);
        } else {
            toast.error(result.error);
        }
    }

    showProductDetail(product) {
        const modal = this.elements.modalDetalle;
        const detalle = this.elements.detalleProducto;
        
        if (!modal || !detalle) return;

        const currentUser = this.authService.getCurrentUser();
        const isOwner = currentUser && product.vendedor_id === currentUser.id;

        let imagenUrl = product.imagenes_urls && product.imagenes_urls.length > 0 ? product.imagenes_urls[0] : null;
        if (!imagenUrl && product.imagen) {
            imagenUrl = product.imagen;
        }

        let imagenHTML;
        const imagenesUrls = product.imagenes_urls || [];
        
        if (imagenesUrls.length > 1) {
            const imagesList = imagenesUrls.map((url, idx) => 
                `<img src="${url}" alt="${UIUtils.escapeHtml(product.nombre)} ${idx + 1}" class="carousel-image" ${idx === 0 ? '' : 'style="display:none"'}>`
            ).join('');
            
            const prevBtn = imagenesUrls.length > 1 ? 
                `<button class="carousel-btn carousel-prev" onclick="window.app.controllers.products.prevCarouselImage()"><</button>` : '';
            const nextBtn = imagenesUrls.length > 1 ? 
                `<button class="carousel-btn carousel-next" onclick="window.app.controllers.products.nextCarouselImage()">></button>` : '';
            
            imagenHTML = `
                <div class="detalle-carousel" data-product-id="${product.id}">
                    ${imagesList}
                    ${prevBtn}
                    ${nextBtn}
                    <div class="carousel-indicators">
                        ${imagenesUrls.map((_, idx) => 
                            `<span class="carousel-indicator ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`
                        ).join('')}
                    </div>
                </div>
            `;
            window.currentCarouselIndex = 0;
            window.currentCarouselProductId = product.id;
        } else {
            imagenHTML = imagenUrl 
                ? `<img src="${imagenUrl}" alt="${UIUtils.escapeHtml(product.nombre)}">`
                : 'IMG';
        }

        const contactoHTML = isOwner 
            ? `<p style="color: var(--text-light); text-align: center; padding: 1rem;">${MESSAGES.PRODUCTS.OWN_PRODUCT}</p>`
            : `<div class="contacto-section">
                <h3>Contactar al Vendedor</h3>
                <form class="mensaje-form" id="form-contacto">
                    <textarea 
                        id="mensaje-texto" 
                        placeholder="Escribe tu mensaje al vendedor..."
                        required
                        rows="4"
                    ></textarea>
                    <button type="submit" class="btn-primary">
                        Enviar Mensaje
                    </button>
                </form>
            </div>`;

        const categoriaNombre = product.categorias?.nombre || product.categoriaNombre;
        const categoriaHTML = categoriaNombre 
            ? `<p class="detalle-categoria"><strong>Categoría:</strong> ${UIUtils.escapeHtml(categoriaNombre)}</p>`
            : '';

        const vendedorNombre = product.vendedor?.nombre || product.vendedorNombre || 'Usuario';

        detalle.innerHTML = `
            <div class="detalle-imagen">${imagenHTML}</div>
            <div class="detalle-info">
                <h2 class="detalle-nombre">${UIUtils.escapeHtml(product.nombre)}</h2>
                <p class="detalle-precio">$${parseFloat(product.precio).toFixed(2)}</p>
                <p class="detalle-vendedor">Vendedor: ${UIUtils.escapeHtml(vendedorNombre)}</p>
                ${categoriaHTML}
                <p class="detalle-descripcion">${UIUtils.escapeHtml(product.descripcion)}</p>
                ${contactoHTML}
            </div>
        `;

        if (!isOwner) {
            const form = detalle.querySelector('#form-contacto');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const mensaje = detalle.querySelector('#mensaje-texto')?.value.trim();
                    if (mensaje) {
                        eventBus.emit(EVENTS.CHAT.CONVERSATION_STARTED, { product, mensaje });
                        this.closeModal();
                    }
                });
            }
        }

        modal.style.display = 'block';
        eventBus.emit(EVENTS.UI.MODAL_OPENED, { type: 'product-detail', product });
    }

    prevCarouselImage() {
        const carousel = document.querySelector('.detalle-carousel');
        if (!carousel) return;
        
        const images = carousel.querySelectorAll('.carousel-image');
        if (images.length <= 1) return;
        
        window.currentCarouselIndex = (window.currentCarouselIndex - 1 + images.length) % images.length;
        this.updateCarouselDisplay(images);
    }

    nextCarouselImage() {
        const carousel = document.querySelector('.detalle-carousel');
        if (!carousel) return;
        
        const images = carousel.querySelectorAll('.carousel-image');
        if (images.length <= 1) return;
        
        window.currentCarouselIndex = (window.currentCarouselIndex + 1) % images.length;
        this.updateCarouselDisplay(images);
    }

    updateCarouselDisplay(images) {
        images.forEach((img, idx) => {
            img.style.display = idx === window.currentCarouselIndex ? 'block' : 'none';
        });
        
        const indicators = document.querySelectorAll('.carousel-indicator');
        indicators.forEach((ind, idx) => {
            ind.classList.toggle('active', idx === window.currentCarouselIndex);
        });
    }

    closeModal() {
        if (this.elements.modalDetalle) {
            this.elements.modalDetalle.style.display = 'none';
        }
        eventBus.emit(EVENTS.UI.MODAL_CLOSED);
    }
}

export default ProductController;
