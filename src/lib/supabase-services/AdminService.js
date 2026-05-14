/**
 * Admin Service for Supabase
 * Manages admin operations: product moderation, user management, category CRUD
 * Security: 
 *   - requireModerador() → moderators and admins (approve, categories)
 *   - requireAdmin() → admins only (user management, full product CRUD)
 */

export class AdminService {
    constructor(authService, productRepository, profileRepository, categoryRepository) {
        this.authService = authService;
        this.productRepository = productRepository;
        this.profileRepository = profileRepository;
        this.categoryRepository = categoryRepository;
    }

    async getPendingProducts() {
        this.authService.requireModerador();
        const allProducts = await this.productRepository.getAllForAdmin();
        return allProducts.filter(p => p.estado_revision === 'pendiente');
    }

    async approveProduct(id) {
        const admin = this.authService.requireModerador();
        const approved = await this.productRepository.approve(id, admin.id);
        return {
            success: true,
            product: approved,
            message: 'Producto aprobado exitosamente'
        };
    }

    async rejectProduct(id, motivo) {
        if (!motivo || motivo.trim() === '') {
            return {
                success: false,
                error: 'El motivo de rechazo es obligatorio'
            };
        }

        const admin = this.authService.requireModerador();
        const rejected = await this.productRepository.reject(id, admin.id, motivo.trim());
        return {
            success: true,
            product: rejected,
            message: 'Producto rechazado'
        };
    }

    async getAllUsers() {
        this.authService.requireAdmin();
        return await this.profileRepository.getAll();
    }

    async changeUserRole(userId, newRol) {
        this.authService.requireAdmin();

        if (newRol !== 'admin' && newRol !== 'moderador' && newRol !== 'anunciante') {
            return {
                success: false,
                error: 'Rol invalido. Debe ser "admin", "moderador" o "anunciante"'
            };
        }

        const result = await this.authService.updateUserRole(userId, newRol);
        return result;
    }

    async createCategory(data) {
        this.authService.requireModerador();

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

    async updateCategory(id, data) {
        this.authService.requireModerador();

        try {
            const category = await this.categoryRepository.update(id, {
                nombre: data.nombre?.trim(),
                descripcion: data.descripcion,
                icono: data.icono
            });

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

    async deleteCategory(id) {
        this.authService.requireModerador();

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

    // ─── Admin Product CRUD ───────────────────────────

    async getAllProducts() {
        this.authService.requireModerador();
        return await this.productRepository.getAllForAdmin();
    }

    async adminCreateProduct(data) {
        this.authService.requireAdmin();
        try {
            const product = await this.productRepository.create({
                nombre: data.nombre,
                precio: parseFloat(data.precio),
                descripcion: data.descripcion,
                imagenes_urls: data.imagenes_urls || [],
                imagenes_paths: data.imagenes_paths || [],
                vendedor_id: data.vendedor_id,
                categoria_id: data.categoria_id || null,
                estado: data.estado || 'disponible',
                estado_revision: data.estado_revision || 'pendiente'
            });
            return {
                success: true,
                product,
                message: 'Producto creado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async adminUpdateProduct(id, data) {
        this.authService.requireAdmin();
        try {
            const updated = await this.productRepository.adminUpdate(id, {
                nombre: data.nombre,
                precio: parseFloat(data.precio),
                descripcion: data.descripcion,
                imagenes_urls: data.imagenes_urls || [],
                imagenes_paths: data.imagenes_paths || [],
                categoria_id: data.categoria_id || null,
                estado: data.estado || 'disponible',
                estado_revision: data.estado_revision,
                vendedor_id: data.vendedor_id
            });
            return {
                success: true,
                product: updated,
                message: 'Producto actualizado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async adminDeleteProduct(id) {
        this.authService.requireAdmin();
        try {
            await this.productRepository.delete(id);
            return {
                success: true,
                message: 'Producto eliminado exitosamente'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default AdminService;
