/**
 * Servicio de Productos
 * Encapsula toda la lógica de negocio relacionada con productos
 */

import { Product } from '../domain/Product.js';
import { MESSAGES } from '../../config/messages.js';

export class ProductService {
    constructor(productRepository, authService) {
        this.productRepository = productRepository;
        this.authService = authService;
    }

    async getAll() {
        return await this.productRepository.getAll();
    }

    async getById(id) {
        return await this.productRepository.getById(id);
    }

    async getByCurrentUser() {
        const user = this.authService.requireAuth();
        return await this.productRepository.getBySeller(user.email);
    }

    async search(query) {
        return await this.productRepository.search(query);
    }

    async getByCategory(categoryId) {
        const products = await this.productRepository.getAll();
        if (!categoryId || categoryId === '') return products;
        return products.filter(p => p.id_categoria === parseInt(categoryId));
    }

    async filterByCategoryAndSearch(categoryId, query) {
        let products = await this.productRepository.getAll();
        
        if (categoryId && categoryId !== '') {
            products = products.filter(p => p.id_categoria === parseInt(categoryId));
        }
        
        if (query && query.trim()) {
            const searchTerm = query.toLowerCase().trim();
            products = products.filter(p => 
                p.nombre.toLowerCase().includes(searchTerm) ||
                p.descripcion.toLowerCase().includes(searchTerm)
            );
        }
        
        return products;
    }

    async create(productData) {
        const user = this.authService.requireAuth();
        
        const product = Product.create({
            ...productData,
            vendedor: user.email,
            vendedorNombre: user.nombre
        });

        const validationErrors = product.validate();
        if (validationErrors.length > 0) {
            return {
                success: false,
                error: validationErrors.join(', ')
            };
        }

        try {
            await this.productRepository.create(product);
            return {
                success: true,
                product: product,
                message: MESSAGES.PRODUCTS.CREATE_SUCCESS
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async delete(productId) {
        const user = this.authService.requireAuth();
        
        const product = await this.productRepository.getById(productId);
        if (!product) {
            return {
                success: false,
                error: 'Producto no encontrado'
            };
        }

        if (!product.belongsTo(user.email)) {
            return {
                success: false,
                error: 'No tienes permiso para eliminar este producto'
            };
        }

        try {
            await this.productRepository.delete(productId);
            return {
                success: true,
                message: MESSAGES.PRODUCTS.DELETE_SUCCESS
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async initializeDemoData(demoProducts) {
        await this.productRepository.initializeDemoData(demoProducts);
    }

    isOwner(product, userEmail) {
        return product.belongsTo(userEmail);
    }
}

export default ProductService;
