/**
 * Interface/Contrato para Repositories
 * Define el contrato que deben implementar todos los repositorios
 * DIP: Depender de abstracciones, no de implementaciones
 */

export class IRepository {
    async getAll() {
        throw new Error('Method getAll() must be implemented');
    }

    async getById(id) {
        throw new Error('Method getById() must be implemented');
    }

    async create(entity) {
        throw new Error('Method create() must be implemented');
    }

    async update(id, entity) {
        throw new Error('Method update() must be implemented');
    }

    async delete(id) {
        throw new Error('Method delete() must be implemented');
    }

    async saveAll(entities) {
        throw new Error('Method saveAll() must be implemented');
    }

    async clear() {
        throw new Error('Method clear() must be implemented');
    }
}

export default IRepository;
