/**
 * Servicio de Categorías
 * Maneja las categorías disponibles en el marketplace
 */

const CATEGORIES = [
    { id: 1, nombre: 'Electrónica', icono: '💻' },
    { id: 2, nombre: 'Libros', icono: '📚' },
    { id: 3, nombre: 'Ropa y Accesorios', icono: '👕' },
    { id: 4, nombre: 'Servicios', icono: '🔧' },
    { id: 5, nombre: 'Hogar', icono: '🏠' },
    { id: 6, nombre: 'Deportes', icono: '⚽' },
    { id: 7, nombre: 'Otros', icono: '📦' }
];

export class CategoryService {
    constructor() {
        this.categories = CATEGORIES;
    }

    getAll() {
        return this.categories;
    }

    getById(id) {
        return this.categories.find(cat => cat.id === parseInt(id)) || null;
    }

    getByName(nombre) {
        return this.categories.find(cat => cat.nombre.toLowerCase() === nombre.toLowerCase()) || null;
    }

    getOptionsHTML(selectedId = null) {
        let html = '<option value="">Selecciona una categoría</option>';
        this.categories.forEach(cat => {
            const selected = selectedId === cat.id ? 'selected' : '';
            html += `<option value="${cat.id}" ${selected}>${cat.icono} ${cat.nombre}</option>`;
        });
        return html;
    }

    getFilterHTML(selectedId = null) {
        let html = `<button class="filter-btn active" data-category="">Todas</button>`;
        this.categories.forEach(cat => {
            const activeClass = selectedId === cat.id ? 'active' : '';
            html += `<button class="filter-btn ${activeClass}" data-category="${cat.id}">${cat.icono} ${cat.nombre}</button>`;
        });
        return html;
    }
}

export default CategoryService;
