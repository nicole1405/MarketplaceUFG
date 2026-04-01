/**
 * Servicio de Categorías
 * Maneja las categorías disponibles en el marketplace
 */

const CATEGORIES = [
    { id: 1, nombre: 'Electrónica' },
    { id: 2, nombre: 'Libros' },
    { id: 3, nombre: 'Ropa y Accesorios' },
    { id: 4, nombre: 'Servicios' },
    { id: 5, nombre: 'Hogar' },
    { id: 6, nombre: 'Deportes' },
    { id: 7, nombre: 'Otros' }
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
            html += `<option value="${cat.id}" ${selected}>${cat.nombre}</option>`;
        });
        return html;
    }

    getFilterHTML(selectedId = null) {
        let html = `<button class="filter-btn active" data-category="">Todas</button>`;
        this.categories.forEach(cat => {
            const activeClass = selectedId === cat.id ? 'active' : '';
            html += `<button class="filter-btn ${activeClass}" data-category="${cat.id}">${cat.nombre}</button>`;
        });
        return html;
    }
}

export default CategoryService;
