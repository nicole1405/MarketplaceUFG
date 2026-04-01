/**
 * Controlador de Productos
 * Maneja la UI relacionada con productos
 * Carga prodctos, crea muestra borra filtra e la imagen y el formulario de publicación
 */

import { EVENTS } from '../../config/events.js';
import { MESSAGES } from '../../config/messages.js';
import { CONFIG } from '../../config/config.js';
import { eventBus, toast, UIUtils } from '../../core/utils/index.js';
import { ImageUtils } from '../../core/utils/ImageUtils.js';
import { CategoryService } from '../../core/services/CategoryService.js';

export class ProductController {
    constructor(productService, authService) {
        this.productService = productService;
        this.authService = authService;
        this.categoryService = new CategoryService();
        this.elements = {};
        this.imagePreview = [];
        this.currentCategory = '';
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.renderCategoryFilters();
        this.renderCategorySelect();
        this.renderProducts();
    }

    cacheElements() {
        this.elements = {
            productosGrid: document.getElementById('productos-grid'),
            emptyState: document.getElementById('empty-state'),
            resultsCount: document.getElementById('results-count'),
            buscarProducto: document.getElementById('buscar-producto'),
            categoryFilters: document.getElementById('category-filters'),
            
            formProducto: document.getElementById('form-producto'),
            botonPublicarProducto: document.getElementById('btn-publicar-producto'),
            nombreProducto: document.getElementById('nombre-producto'),
            categoriaProducto: document.getElementById('categoria-producto'),
            precioProducto: document.getElementById('precio-producto'),
            descripcionProducto: document.getElementById('descripcion-producto'),
            imagenProducto: document.getElementById('imagen-producto'),
            previewContainer: document.getElementById('preview-container'),
            previewImagen: document.getElementById('preview-imagen'),
            previewInfo: document.getElementById('preview-info'),
            listaMisProductos: document.getElementById('lista-mis-productos'),
            btnClearNoImage: document.getElementById('btn-clear-no-image'),
            
            modalDetalle: document.getElementById('modal-detalle'),
            detalleProducto: document.getElementById('detalle-producto')
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

        if (this.elements.botonPublicarProducto) {
            this.elements.botonPublicarProducto.addEventListener('click', (e) => {
                if (!this.elements.formProducto) return;

                // Si hay validación nativa del formulario, mostrarla
                if (!this.elements.formProducto.checkValidity()) {
                    this.elements.formProducto.reportValidity();
                    e.preventDefault();
                    return;
                }

                // El envíal submit ya está manejado en handleCreate
                // Aquí solo diagnosticamos si el botón está funcional.
                console.log('Click en Publicar Producto');
            });
        }

        if (this.elements.categoryFilters) {
            this.elements.categoryFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-btn')) {
                    this.handleCategoryFilter(e.target.dataset.category);
                }
            });
        }

        if (this.elements.btnClearNoImage) {
            this.elements.btnClearNoImage.addEventListener('click', () => this.handleDeleteNoImage());
        }

        if (this.elements.modalDetalle) {
            this.elements.modalDetalle.addEventListener('click', (e) => {
                if (e.target === this.elements.modalDetalle) {
                    this.closeModal();
                }
            });
        }
    }

    renderCategoryFilters() {
        if (!this.elements.categoryFilters) return;
        this.elements.categoryFilters.innerHTML = this.categoryService.getFilterHTML();
    }

    renderCategorySelect() {
        if (!this.elements.categoriaProducto) return;
        this.elements.categoriaProducto.innerHTML = this.categoryService.getOptionsHTML();
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
        const allProducts = products || await this.productService.getAll();
        const productList = allProducts.filter(product => Array.isArray(product.imagenes) && product.imagenes.length > 0);
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

        this.updateResultsCount(productList.length, '');
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'producto-card';

        const imageUrl = Array.isArray(product.imagenes) && product.imagenes.length > 0
            ? product.imagenes[0]
            : null;

        const imagenHTML = imageUrl
            ? `<img src="${imageUrl}" alt="${UIUtils.escapeHtml(product.nombre)}">`
            : '📦';

        const categoriaHTML = product.categoriaNombre 
            ? `<span class="producto-categoria">${UIUtils.escapeHtml(product.categoriaNombre)}</span>`
            : '';

        const currentUser = this.authService.getCurrentUser();
        const isOwner = currentUser && product.belongsTo(currentUser.email);

        card.innerHTML = `
            <div class="producto-imagen">${imagenHTML}</div>
            <div class="producto-info">
                ${categoriaHTML}
                <h3 class="producto-nombre">${UIUtils.escapeHtml(product.nombre)}</h3>
                <p class="producto-precio">${UIUtils.formatCurrency(product.precio)}</p>
                <p class="producto-vendedor">👤 ${UIUtils.escapeHtml(product.vendedorNombre)}</p>
                <p class="producto-descripcion">${UIUtils.escapeHtml(product.descripcion)}</p>
                <div class="producto-acciones">
                    <button class="btn-action btn-detalle" data-action="detalle">Ver Detalle</button>
                    ${!isOwner ? `<button class="btn-action btn-contactar" data-action="contactar">Contactar</button>` : ''}
                </div>
            </div>
        `;

        const imageElement = card.querySelector('.producto-imagen img');
        let carouselIndex = 0;
        let carouselInterval = null;

        const startCarousel = () => {
            if (!imageElement || !Array.isArray(product.imagenes) || product.imagenes.length <= 1) {
                return;
            }
            carouselIndex = 0;
            carouselInterval = setInterval(() => {
                carouselIndex = (carouselIndex + 1) % product.imagenes.length;
                imageElement.classList.add('fade');
                setTimeout(() => {
                    imageElement.src = product.imagenes[carouselIndex];
                    imageElement.classList.remove('fade');
                }, 150);
            }, 900);
        };

        const stopCarousel = () => {
            if (carouselInterval) {
                clearInterval(carouselInterval);
                carouselInterval = null;
            }
            if (imageElement && product.imagenes && product.imagenes.length > 0) {
                imageElement.src = product.imagenes[0];
            }
        };

        card.addEventListener('mouseenter', () => startCarousel());
        card.addEventListener('mouseleave', () => stopCarousel());

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

        const categoryText = this.currentCategory 
            ? ` en ${this.categoryService.getById(this.currentCategory)?.nombre || 'esta categoría'}`
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

        // Validación básica de campos requeridos
        if (!nombre || nombre.length === 0) {
            toast.error('El nombre del producto es obligatorio');
            this.elements.nombreProducto?.focus();
            return;
        }

        if (nombre.length > CONFIG.VALIDATION.MAX_PRODUCT_NAME_LENGTH) {
            toast.error(`El nombre no puede tener más de ${CONFIG.VALIDATION.MAX_PRODUCT_NAME_LENGTH} caracteres`);
            this.elements.nombreProducto?.focus();
            return;
        }

        if (!categoriaId || categoriaId === '') {
            toast.error('Debes seleccionar una categoría');
            this.elements.categoriaProducto?.focus();
            return;
        }

        if (!precio || precio === '' || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) {
            toast.error('El precio debe ser un número mayor a 0');
            this.elements.precioProducto?.focus();
            return;
        }

        const precioFloat = parseFloat(precio);
        if (precioFloat < 0.01) {
            toast.error('El precio mínimo es $0.01');
            this.elements.precioProducto?.focus();
            return;
        }

        if (!descripcion || descripcion.length === 0) {
            toast.error('La descripción del producto es obligatoria');
            this.elements.descripcionProducto?.focus();
            return;
        }

        if (descripcion.length > CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH) {
            toast.error(`La descripción no puede tener más de ${CONFIG.VALIDATION.MAX_DESCRIPTION_LENGTH} caracteres`);
            this.elements.descripcionProducto?.focus();
            return;
        }

        if (!Array.isArray(this.imagePreview) || this.imagePreview.length === 0) {
            toast.error('Debes subir al menos una imagen del producto');
            if (this.elements.imagenProducto) this.elements.imagenProducto.focus();
            return;
        }

        if (this.imagePreview.length > 5) {
            toast.error('No puedes subir más de 5 imágenes');
            if (this.elements.imagenProducto) this.elements.imagenProducto.focus();
            return;
        }

        const categoria = this.categoryService.getById(categoriaId);

        const result = await this.productService.create({
            nombre,
            precio: precioFloat,
            descripcion,
            imagenes: this.imagePreview,
            id_categoria: categoriaId ? parseInt(categoriaId) : null,
            categoriaNombre: categoria?.nombre || null
        });

        if (result.success) {
            toast.success(result.message);
            this.clearForm();
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
        const files = Array.from(event.target.files || []);
        if (files.length === 0) {
            this.clearImage();
            return;
        }

        if (files.length > 5) {
            toast.error('Selecciona máximo 5 imágenes');
            this.clearImage();
            return;
        }

        const processedImages = [];

        try {
            for (const file of files) {
                const imageData = await ImageUtils.processFile(file);
                processedImages.push(imageData);
            }

            this.imagePreview = processedImages;

            if (this.elements.previewImagen) {
                this.elements.previewImagen.src = this.imagePreview[0];
            }

            if (this.elements.previewContainer) {
                this.elements.previewContainer.style.display = 'block';
            }

            if (this.elements.previewInfo) {
                this.elements.previewInfo.textContent = `${this.imagePreview.length} imagen(es) cargada(s)`;
            }
        } catch (error) {
            toast.error(error.message);
            this.clearImage();
        }
    }

    clearImage() {
        this.imagePreview = [];
        if (this.elements.imagenProducto) {
            this.elements.imagenProducto.value = '';
        }
        if (this.elements.previewContainer) {
            this.elements.previewContainer.style.display = 'none';
        }
        if (this.elements.previewInfo) {
            this.elements.previewInfo.textContent = '';
        }
    }

    clearForm() {
        if (this.elements.formProducto) {
            this.elements.formProducto.reset();
        }
        if (this.elements.categoriaProducto) {
            this.elements.categoriaProducto.innerHTML = this.categoryService.getOptionsHTML();
        }
        this.clearImage();
    }

    async renderMyProducts() {
        const container = this.elements.listaMisProductos;
        if (!container) return;

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
    }

    createMyProductItem(product) {
        const item = document.createElement('div');
        item.className = 'producto-item';

        const imageUrl = Array.isArray(product.imagenes) && product.imagenes.length > 0
            ? product.imagenes[0]
            : null;

        const imagenHTML = imageUrl
            ? `<img src="${imageUrl}" alt="${UIUtils.escapeHtml(product.nombre)}">`
            : '📦';

        const categoriaHTML = product.categoriaNombre 
            ? `<span style="font-size: 0.85rem; color: var(--primary-color);">${product.categoriaNombre}</span>`
            : '';

        item.innerHTML = `
            <div class="producto-item-imagen">${imagenHTML}</div>
            <div class="producto-item-info">
                <h4>${UIUtils.escapeHtml(product.nombre)}</h4>
                <p>Precio: ${UIUtils.formatCurrency(product.precio)}</p>
                ${categoriaHTML}
            </div>
            <div class="producto-item-actions">
                <button class="btn-small btn-delete" data-product-id="${product.id}">
                    Eliminar
                </button>
            </div>
        `;

        const imageElement = item.querySelector('.producto-item-imagen img');
        let carouselIndex = 0;
        let carouselInterval = null;

        const startCarousel = () => {
            if (!imageElement || !Array.isArray(product.imagenes) || product.imagenes.length <= 1) return;

            carouselIndex = 0;
            carouselInterval = setInterval(() => {
                carouselIndex = (carouselIndex + 1) % product.imagenes.length;
                imageElement.classList.add('fade');
                setTimeout(() => {
                    imageElement.src = product.imagenes[carouselIndex];
                    imageElement.classList.remove('fade');
                }, 150);
            }, 900);
        };

        const stopCarousel = () => {
            if (carouselInterval) {
                clearInterval(carouselInterval);
                carouselInterval = null;
            }
            if (imageElement && product.imagenes && product.imagenes.length > 0) {
                imageElement.src = product.imagenes[0];
            }
        };

        item.addEventListener('mouseenter', startCarousel);
        item.addEventListener('mouseleave', stopCarousel);

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

    async handleDeleteNoImage() {
        if (!confirm('¿Eliminar todos tus productos sin imagen? Esta acción no se puede deshacer.')) {
            return;
        }

        const products = await this.productService.getByCurrentUser();
        const productsWithoutImage = products.filter(p => !Array.isArray(p.imagenes) || p.imagenes.length === 0);

        if (productsWithoutImage.length === 0) {
            toast.info('No tienes productos sin imagen.');
            return;
        }

        let deleted = 0;
        let failed = 0;

        for (const product of productsWithoutImage) {
            const result = await this.productService.delete(product.id);
            if (result.success) {
                deleted += 1;
            } else {
                failed += 1;
            }
        }

        if (deleted > 0) {
            toast.success(`Se eliminaron ${deleted} producto(s) sin imagen.`);
        }

        if (failed > 0) {
            toast.error(`No se pudieron eliminar ${failed} producto(s).`);
        }

        this.renderProducts();
        this.renderMyProducts();
    }

    showProductDetail(product) {
        const modal = this.elements.modalDetalle;
        const detalle = this.elements.detalleProducto;

        if (!modal || !detalle) return;

        const currentUser = this.authService.getCurrentUser();
        const isOwner = currentUser && product.belongsTo(currentUser.email);

        // Crear carrusel de imágenes
        const imagenes = Array.isArray(product.imagenes) && product.imagenes.length > 0
            ? product.imagenes
            : [];

        let currentImageIndex = 0;

        const createCarouselHTML = () => {
            if (imagenes.length === 0) {
                return '<div class="detalle-imagen">📦</div>';
            }

            const indicators = imagenes.map((_, index) =>
                `<span class="carousel-indicator ${index === currentImageIndex ? 'active' : ''}" data-index="${index}"></span>`
            ).join('');

            const controls = imagenes.length > 1 ? `
                <button class="carousel-control carousel-prev" data-action="prev">‹</button>
                <button class="carousel-control carousel-next" data-action="next">›</button>
            ` : '';

            return `
                <div class="detalle-imagen-container">
                    <div class="detalle-imagen">
                        <img src="${imagenes[currentImageIndex]}" alt="${UIUtils.escapeHtml(product.nombre)} - Imagen ${currentImageIndex + 1}">
                    </div>
                    ${controls}
                    <div class="carousel-indicators">
                        ${indicators}
                    </div>
                </div>
            `;
        };

        const updateCarousel = () => {
            const img = detalle.querySelector('.detalle-imagen img');
            const indicators = detalle.querySelectorAll('.carousel-indicator');

            if (img) {
                img.classList.add('fade');
                setTimeout(() => {
                    img.src = imagenes[currentImageIndex];
                    img.alt = `${UIUtils.escapeHtml(product.nombre)} - Imagen ${currentImageIndex + 1}`;
                    img.classList.remove('fade');
                }, 150);
            }

            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentImageIndex);
            });
        };

        const nextImage = () => {
            currentImageIndex = (currentImageIndex + 1) % imagenes.length;
            updateCarousel();
        };

        const prevImage = () => {
            currentImageIndex = currentImageIndex === 0 ? imagenes.length - 1 : currentImageIndex - 1;
            updateCarousel();
        };

        const goToImage = (index) => {
            currentImageIndex = index;
            updateCarousel();
        };

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

        const categoriaHTML = product.categoriaNombre
            ? `<p class="detalle-categoria"><strong>Categoría:</strong> ${UIUtils.escapeHtml(product.categoriaNombre)}</p>`
            : '';

        detalle.innerHTML = `
            ${createCarouselHTML()}
            <div class="detalle-info">
                <h2 class="detalle-nombre">${UIUtils.escapeHtml(product.nombre)}</h2>
                <p class="detalle-precio">${UIUtils.formatCurrency(product.precio)}</p>
                <p class="detalle-vendedor">👤 Vendedor: ${UIUtils.escapeHtml(product.vendedorNombre)}</p>
                ${categoriaHTML}
                <p class="detalle-descripcion">${UIUtils.escapeHtml(product.descripcion)}</p>
                ${contactoHTML}
            </div>
        `;

        // Agregar event listeners para el carrusel
        if (imagenes.length > 1) {
            const prevBtn = detalle.querySelector('.carousel-prev');
            const nextBtn = detalle.querySelector('.carousel-next');
            const indicators = detalle.querySelectorAll('.carousel-indicator');

            if (prevBtn) prevBtn.addEventListener('click', prevImage);
            if (nextBtn) nextBtn.addEventListener('click', nextImage);

            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => goToImage(index));
            });
        }

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

    closeModal() {
        if (this.elements.modalDetalle) {
            this.elements.modalDetalle.style.display = 'none';
        }
        eventBus.emit(EVENTS.UI.MODAL_CLOSED);
    }
}

export default ProductController;
