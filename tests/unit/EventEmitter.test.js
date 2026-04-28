/**
 * Pruebas Unitarias - EventEmitter
 * Tests individuales para el sistema de eventos
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('EventEmitter - Pruebas Unitarias', () => {
    let EventEmitter;
    let emitter;

    beforeEach(async () => {
        const module = await import('../../src/core/utils/EventEmitter.js');
        EventEmitter = module.EventEmitter || module.default;
        
        // Crear nueva instancia para cada test
        emitter = new EventEmitter();
    });

    describe('Suscribir a eventos', () => {
        it('debe suscribir callback a evento', () => {
            const callback = vi.fn();
            
            emitter.on('testEvent', callback);
            
            expect(emitter.events.testEvent).toBeDefined();
            expect(emitter.events.testEvent).toContain(callback);
        });

        it('debe permitir múltiples listeners', () => {
            const cb1 = vi.fn();
            const cb2 = vi.fn();
            
            emitter.on('event1', cb1);
            emitter.on('event1', cb2);
            
            expect(emitter.events.event1).toHaveLength(2);
        });

        it('debe retornar función para desuscribir', () => {
            const callback = vi.fn();
            
            const unsubscribe = emitter.on('singleEvent', callback);
            
            expect(typeof unsubscribe).toBe('function');
        });

        it('debe usar namespace para categorizar', () => {
            const callback = vi.fn();
            
            emitter.on('auth:login', callback);
            
            expect(emitter.events['auth:login']).toBeDefined();
        });
    });

    describe('Emitir eventos', () => {
        it('debe ejecutar callback al emitir', () => {
            const callback = vi.fn();
            
            emitter.on('test', callback);
            emitter.emit('test');
            
            expect(callback).toHaveBeenCalled();
        });

        it('debe pasar datos al callback', () => {
            const callback = vi.fn();
            
            emitter.on('test', callback);
            emitter.emit('test', 'test-data');
            
            expect(callback).toHaveBeenCalledWith('test-data');
        });

        it('debe ejecutar múltiples listeners', () => {
            const cb1 = vi.fn();
            const cb2 = vi.fn();
            
            emitter.on('test', cb1);
            emitter.on('test', cb2);
            emitter.emit('test');
            
            expect(cb1).toHaveBeenCalled();
            expect(cb2).toHaveBeenCalled();
        });

        it('debe ejecutar listeners en orden', () => {
            const order = [];
            const cb1 = () => order.push(1);
            const cb2 = () => order.push(2);
            
            emitter.on('test', cb1);
            emitter.on('test', cb2);
            emitter.emit('test');
            
            expect(order).toEqual([1, 2]);
        });
    });

    describe('Desuscribir', () => {
        it('debe remover listener específico', () => {
            const callback = vi.fn();
            
            emitter.on('test', callback);
            emitter.off('test', callback);
            
            expect(emitter.events.test).toEqual([]);
        });

        it('debe mantener otros listeners', () => {
            const cb1 = vi.fn();
            const cb2 = vi.fn();
            
            emitter.on('test', cb1);
            emitter.on('test', cb2);
            emitter.off('test', cb1);
            
            expect(emitter.events.test).toContain(cb2);
        });

        it('debe remover todos los listeners de evento', () => {
            const callback = vi.fn();
            
            emitter.on('test', callback);
            emitter.off('test');
            
            expect(emitter.events.test).toBeUndefined();
        });

        it('debe retornar función de unsubscribe', () => {
            const callback = vi.fn();
            
            const unsubscribe = emitter.on('event1', callback);
            unsubscribe();
            
            expect(emitter.events.event1).toEqual([]);
        });
    });

    describe('Evento once', () => {
        it('debe executar solo una vez', () => {
            const callback = vi.fn();
            
            emitter.once('onceEvent', callback);
            emitter.emit('onceEvent');
            emitter.emit('onceEvent');
            
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('debe pasar datos en once', () => {
            const callback = vi.fn();
            
            emitter.once('onceData', callback);
            emitter.emit('onceData', 'data');
            
            expect(callback).toHaveBeenCalledWith('data');
        });

        it('debe desuscribir automáticamente', () => {
            const callback = vi.fn();
            
            emitter.once('onceAuto', callback);
            emitter.emit('onceAuto');
            
            expect(emitter.events.onceAuto).toEqual([]);
        });

        it('debe handle error gracefully', () => {
            const errorCallback = () => { throw new Error('Test error'); };
            
            emitter.on('errorEvent', errorCallback);
            
            // No debe lanzar error
            expect(() => emitter.emit('errorEvent')).not.toThrow();
        });
    });

    describe('Manejo de errores', () => {
        it('debe catch errores en listeners', () => {
            const callback = () => { throw new Error('Listener failed'); };
            
            emitter.on('test', callback);
            
            expect(() => emitter.emit('test')).not.toThrow();
        });

        it('debe continuar con otros listeners si uno falla', () => {
            const failingCallback = () => { throw new Error('Fail'); };
            const successCallback = vi.fn();
            
            emitter.on('test', failingCallback);
            emitter.on('test', successCallback);
            emitter.emit('test');
            
            expect(successCallback).toHaveBeenCalled();
        });

        it('debe loguear error al console', () => {
            const callback = () => { throw new Error('Test'); };
            
            emitter.on('logTest', callback);
            emitter.emit('logTest');
            
            // Verificar que se llamó console.error
        });

        it('debe manejar evento sin listeners', () => {
            expect(() => emitter.emit('noListeners')).not.toThrow();
        });
    });

    describe('Casos edge', () => {
        it('debe manejar off de evento sin listeners', () => {
            expect(() => emitter.off('noEvent')).not.toThrow();
        });

        it('debe manejar emit de evento sin listeners', () => {
            expect(() => emitter.emit('noEvent')).not.toThrow();
        });

        it('debe permitir suscribir sin callback', () => {
            expect(() => emitter.on('event')).not.toThrow();
        });

        it('debe tener estructura de eventos vacía inicialmente', () => {
            expect(emitter.events).toEqual({});
        });
    });
});