/**
 * Entidad Producto
 * Representa un producto en el marketplace
 */

export class Product {
    constructor({ id, nombre, precio, descripcion, vendedor, vendedorNombre, imagen, fecha, id_categoria, categoriaNombre }) {
        this.id = id || Date.now();
        this.nombre = nombre?.trim();
        this.precio = parseFloat(precio);
        this.descripcion = descripcion?.trim();
        this.vendedor = vendedor;
        this.vendedorNombre = vendedorNombre;
        this.imagen = imagen || null;
        this.fecha = fecha || new Date().toISOString();
        this.id_categoria = id_categoria || null;
        this.categoriaNombre = categoriaNombre || null;
    }

    static create(data) {
        return new Product(data);
    }

    validate() {
        const errors = [];
        
        if (!this.nombre || this.nombre.length === 0) {
            errors.push('El nombre del producto es obligatorio');
        }
        
        if (isNaN(this.precio) || this.precio <= 0) {
            errors.push('El precio debe ser mayor a 0');
        }
        
        if (!this.descripcion || this.descripcion.length === 0) {
            errors.push('La descripción es obligatoria');
        }
        
        if (!this.id_categoria) {
            errors.push('Debes seleccionar una categoría');
        }
        
        if (!this.vendedor) {
            errors.push('El producto debe tener un vendedor');
        }
        
        return errors;
    }

    matchesSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        return this.nombre.toLowerCase().includes(searchTerm) ||
               this.descripcion.toLowerCase().includes(searchTerm);
    }

    belongsTo(email) {
        return this.vendedor === email;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            precio: this.precio,
            descripcion: this.descripcion,
            vendedor: this.vendedor,
            vendedorNombre: this.vendedorNombre,
            imagen: this.imagen,
            fecha: this.fecha,
            id_categoria: this.id_categoria,
            categoriaNombre: this.categoriaNombre
        };
    }

    static fromJSON(json) {
        return new Product(json);
    }
}

export default Product;
