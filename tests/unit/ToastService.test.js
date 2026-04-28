/**
 * Pruebas Unitarias - ToastService
 * Tests individuales para el sistema de notificaciones
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock de CONFIG
const mockConfig = {
    UI: {
        TOAST_DURATION: 3000
    }
};

vi.mock('../../src/config/config.js', () => ({
    CONFIG: mockConfig
}));

// Setup de DOM mock
const setupMockDOM = () => {
    document.body.innerHTML = `
        <div id="toast-container"></div>
    `;
};

describe('ToastService - Pruebas Unitarias', () => {
    let ToastService;
    let toastInstance;

    beforeEach(async () => {
        setupMockDOM();
        document.body.innerHTML = '';
        
        const { ToastService: TS } = await import('../../src/core/utils/ToastService.js');
        ToastService = TS;
        
        toastInstance = new ToastService();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Método show', () => {
        it('debe mostrar toast con mensaje', () => {
            const mockContainer = document.createElement('div');
            document.body.appendChild(mockContainer);
            
            toastInstance.container = mockContainer;
            const result = toastInstance.show('Test message');
            
            expect(result).toBeTruthy();
            expect(mockContainer.children.length).toBeGreaterThan(0);
        });

        it('debe usar tipo por defecto (success)', () => {
            const mockContainer = document.createElement('div');
            document.body.appendChild(mockContainer);
            
            toastInstance.container = mockContainer;
            const result = toastInstance.show('Message');
            
            expect(result.className).toContain('success');
        });

        it('debe aceptar tipo personalizado', () => {
            const mockContainer = document.createElement('div');
            document.body.appendChild(mockContainer);
            
            toastInstance.container = mockContainer;
            const result = toastInstance.show('Error message', 'error');
            
            expect(result.className).toContain('error');
        });

        it('debe aceptar tipo warning', () => {
            const mockContainer = document.createElement('div');
            document.body.appendChild(mockContainer);
            
            toastInstance.container = mockContainer;
            const result = toastInstance.show('Warning', 'warning');
            
            expect(result.className).toContain('warning');
        });

        it('debe aceptar tipo info', () => {
            const mockContainer = document.createElement('div');
            document.body.appendChild(mockContainer);
            
            toastInstance.container = mockContainer;
            const result = toastInstance.show('Info', 'info');
            
            expect(result.className).toContain('info');
        });
    });

    describe('Métodos rápidos', () => {
        it('debe tener método success', () => {
            expect(typeof toastInstance.success).toBe('function');
        });

        it('debe tener método error', () => {
            expect(typeof toastInstance.error).toBe('function');
        });

        it('debe tener método warning', () => {
            expect(typeof toastInstance.warning).toBe('function');
        });

        it('debe tener método info', () => {
            expect(typeof toastInstance.info).toBe('function');
        });
    });

    describe('Creación de elemento toast', () => {
        it('debe crear elemento con mensaje', () => {
            const toastEl = toastInstance.createToastElement('Test', 'success');
            
            expect(toastEl.textContent).toContain('Test');
        });

        it('debe incluir icono para success', () => {
            const toastEl = toastInstance.createToastElement('Test', 'success');
            
            expect(toastEl.innerHTML).toContain('OK');
        });

        it('debe incluir icono para error', () => {
            const toastEl = toastInstance.createToastElement('Test', 'error');
            
            expect(toastEl.innerHTML).toContain('X');
        });

        it('debe incluir icono para warning', () => {
            const toastEl = toastInstance.createToastElement('Test', 'warning');
            
            expect(toastEl.innerHTML).toContain('!');
        });
    });

    describe('Ocultar toast', () => {
        it('debe remover clase show', () => {
            const toastEl = document.createElement('div');
            toastEl.className = 'toast show';
            
            toastInstance.hide(toastEl);
            
            expect(toastEl.className).toContain('hide');
        });

        it('debe programar eliminación del DOM', async () => {
            const toastEl = document.createElement('div');
            document.body.appendChild(toastEl);
            
            toastInstance.hide(toastEl);
            
            // Esperar por el timeout
            await new Promise(resolve => setTimeout(resolve, 350));
            
            expect(document.body.contains(toastEl)).toBe(false);
        });

        it('debe manejar toast sin padre', () => {
            const toastEl = document.createElement('div');
            
            expect(() => toastInstance.hide(toastEl)).not.toThrow();
        });
    });

    describe('Inicialización', () => {
        it('debe crear contenedor si no existe', () => {
            document.body.innerHTML = '';
            
            const newInstance = new ToastService();
            
            const container = document.getElementById('toast-container');
            expect(container).toBeTruthy();
        });

        it('debe reutilizar contenedor existente', () => {
            document.body.innerHTML = '<div id="toast-container" class="existing"></div>';
            
            const newInstance = new ToastService();
            
            expect(newInstance.container.className).toContain('existing');
        });

        it('debe tener id correcto', () => {
            document.body.innerHTML = '';
            
            const newInstance = new ToastService();
            
            expect(newInstance.container.id).toBe('toast-container');
        });

        it('debe tener clase de contenedor', () => {
            document.body.innerHTML = '';
            
            const newInstance = new ToastService();
            
            expect(newInstance.container.className).toContain('toast-container');
        });
    });
});