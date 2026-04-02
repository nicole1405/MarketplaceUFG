/**
 * Sistema de Eventos personalizado
 * Permite comunicación desacoplada entre componentes
 * (Patrón Observer)
 */

export class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        // Retornar función para desuscribirse
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.events[event]) return;
        
        if (callback) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        } else {
            delete this.events[event];
        }
    }

    emit(event, data) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${event}:`, error);
            }
        });
    }

    once(event, callback) {
        const onceCallback = (data) => {
            this.off(event, onceCallback);
            callback(data);
        };
        return this.on(event, onceCallback);
    }
}

// Instancia global
export const eventBus = new EventEmitter();

export default EventEmitter;
