/**
 * Product Service for Supabase
 * Manages products using Supabase database
 * Security: RLS policies handle access control
 */

import { supabase } from '../supabase.js';
import { MESSAGES } from '../../config/messages.js';

export class ProductService {
    constructor(productRepository, profileRepository, authService) {
        this.productRepository = productRepository;
        this.profileRepository = profileRepository;
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
        return await this.productRepository.getBySeller(user.id);
    }

    async search(query) {
        return await this.productRepository.search(query);
    }

    async getByCategory(categoryId) {
        if (!categoryId || categoryId === '') {
            return this.getAll();
        }
        return await this.productRepository.getByCategory(categoryId);
    }

    async filterByCategoryAndSearch(categoryId, query) {
        let products;
        
        if (query && query.trim()) {
            products = await this.productRepository.search(query);
        } else {
            products = await this.productRepository.getAll();
        }
        
        if (categoryId && categoryId !== '') {
            products = products.filter(p => p.categoria_id === parseInt(categoryId));
        }
        
        return products;
    }

    async create(productData) {
        const user = this.authService.requireAuth();

        try {
            const product = await this.productRepository.create({
                nombre: productData.nombre,
                precio: parseFloat(productData.precio),
                descripcion: productData.descripcion,
                imagenes_urls: productData.imagenes_urls || [],
                imagenes_paths: productData.imagenes_paths || [],
                vendedor_id: user.id,
                categoria_id: productData.categoria_id || null
            });

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

    async update(productId, productData) {
        const user = this.authService.requireAuth();
        
        const product = await this.productRepository.getById(productId);
        if (!product) {
            return {
                success: false,
                error: 'Producto no encontrado'
            };
        }

        if (product.vendedor_id !== user.id) {
            return {
                success: false,
                error: 'No tienes permiso para modificar este producto'
            };
        }

        try {
            const updated = await this.productRepository.update(productId, {
                nombre: productData.nombre,
                precio: parseFloat(productData.precio),
                descripcion: productData.descripcion,
                imagenes_urls: productData.imagenes_urls,
                imagenes_paths: productData.imagenes_paths,
                categoria_id: productData.categoria_id,
                estado: productData.estado
            });

            return {
                success: true,
                product: updated,
                message: 'Producto actualizado correctamente'
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

        if (product.vendedor_id !== user.id) {
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

    async markAsSold(productId) {
        const user = this.authService.requireAuth();
        
        const product = await this.productRepository.getById(productId);
        if (!product) {
            return {
                success: false,
                error: 'Producto no encontrado'
            };
        }

        if (product.vendedor_id !== user.id) {
            return {
                success: false,
                error: 'No tienes permiso para modificar este producto'
            };
        }

        try {
            await this.productRepository.markAsSold(productId);
            return {
                success: true,
                message: 'Producto marcado como vendido'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    isOwner(product, userId) {
        return product.vendedor_id === userId;
    }
}

export default ProductService;
