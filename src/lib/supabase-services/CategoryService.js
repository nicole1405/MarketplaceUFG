/**
 * Category Service for Supabase
 * Manages product categories
 */

import { supabase } from '../supabase.js';

export class CategoryService {
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    async getAll() {
        return await this.categoryRepository.getAll();
    }

    async getById(id) {
        return await this.categoryRepository.getById(id);
    }

    async getByName(nombre) {
        return await this.categoryRepository.getByName(nombre);
    }
}

export default CategoryService;
