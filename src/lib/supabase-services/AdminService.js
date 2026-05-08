/**
 * Admin Service for Supabase
 * Manages admin-only operations: product moderation, user management, category CRUD
 * Security: All methods require admin role via authService.requireAdmin()
 */

export class AdminService {
    constructor(authService, productRepository, profileRepository, categoryRepository) {
        this.authService = authService;
        this.productRepository = productRepository;
        this.profileRepository = profileRepository;
        this.categoryRepository = categoryRepository;
    }

    async getPendingProducts() {
        this.authService.requireAdmin();
        const allProducts = await this.productRepository.getAllForAdmin();
        return allProducts.filter(p => p.estado_revision === 'pendiente');
    }

    async approveProduct(id) {
        const admin = this.authService.requireAdmin();
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

        const admin = this.authService.requireAdmin();
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

        if (newRol !== 'admin' && newRol !== 'anunciante') {
            return {
                success: false,
                error: 'Rol invalido. Debe ser "admin" o "anunciante"'
            };
        }

        const result = await this.authService.updateUserRole(userId, newRol);
        return result;
    }

    async createCategory(data) {
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

    async updateCategory(id, data) {
        this.authService.requireAdmin();

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

export default AdminService;
