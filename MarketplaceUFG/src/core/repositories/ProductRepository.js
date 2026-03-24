/**
 * Repository para Productos
 * Encapsula la lógica de persistencia de productos
 */

import { IRepository } from './IRepository.js';
import { Product } from '../domain/Product.js';
import { CONFIG } from '../../config/config.js';

export class ProductRepository extends IRepository {
    constructor(storageKey = CONFIG.STORAGE.KEYS.PRODUCTS) {
        super();
        this.storageKey = storageKey;
    }

    async getAll() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) return [];
        
        try {
            const parsed = JSON.parse(data);
            return parsed.map(p => Product.fromJSON(p));
        } catch (error) {
            console.error('Error parsing products:', error);
            return [];
        }
    }

    async getById(id) {
        const products = await this.getAll();
        return products.find(p => p.id === id) || null;
    }

    async getBySeller(email) {
        const products = await this.getAll();
        return products.filter(p => p.vendedor === email);
    }

    async search(query) {
        const products = await this.getAll();
        if (!query || query.trim() === '') {
            return products;
        }
        return products.filter(p => p.matchesSearch(query));
    }

    async create(product) {
        const products = await this.getAll();
        products.unshift(product); // Más reciente primero
        await this.saveAll(products);
        return product;
    }

    async update(id, updatedProduct) {
        const products = await this.getAll();
        const index = products.findIndex(p => p.id === id);
        
        if (index === -1) {
            throw new Error('Product not found');
        }
        
        products[index] = updatedProduct;
        await this.saveAll(products);
        return updatedProduct;
    }

    async delete(id) {
        const products = await this.getAll();
        const filtered = products.filter(p => p.id !== id);
        await this.saveAll(filtered);
        return true;
    }

    async saveAll(products) {
        localStorage.setItem(this.storageKey, JSON.stringify(products.map(p => p.toJSON())));
    }

    async clear() {
        localStorage.removeItem(this.storageKey);
    }

    async count() {
        const products = await this.getAll();
        return products.length;
    }

    // Método para inicializar datos de demo
    async initializeDemoData(demoProducts) {
        const existing = await this.getAll();
        if (existing.length === 0) {
            await this.saveAll(demoProducts);
        }
    }
}

export default ProductRepository;
