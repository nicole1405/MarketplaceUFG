/**
 * Category Service for Supabase
 * Manages product categories
 */

import { MESSAGES } from '../../config/messages.js';

export class CategoryService {
    constructor(categoryRepository, authService) {
        this.categoryRepository = categoryRepository;
        this.authService = authService;
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

    async create(data) {
        this.authService.requireAdmin();

        if (!data.nombre || data.nombre.trim() === '') {
            return {
                success: false,
                error: 'El nombre de la categoria es obligatorio'
            };
        }

        try {
            const category = await this.categoryRepository.create({
                nombre: data.nombre.trim(),
                descripcion: data.descripcion || null,
                icono: data.icono || null
            });

            return {
                success: true,
                category,
                message: 'Categoria creada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async update(id, data) {
        this.authService.requireModerador();

        try {
            const updateData = {
                nombre: data.nombre?.trim(),
                descripcion: data.descripcion,
                icono: data.icono
            };
            
            // Include orden if provided
            if (data.orden !== undefined && data.orden !== null) {
                updateData.orden = Number(data.orden);
            }
            
            console.log('[CategoryService.update] Calling repository with:', updateData);
            
            const category = await this.categoryRepository.update(id, updateData);

            return {
                success: true,
                category,
                message: 'Categoria actualizada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async delete(id) {
        this.authService.requireAdmin();

        try {
            await this.categoryRepository.delete(id);
            return {
                success: true,
                message: 'Categoria eliminada exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default CategoryService;
