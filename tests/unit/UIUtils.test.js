/**
 * Pruebas Unitarias - UIUtils
 * Tests individuales para funciones de utilidad de UI
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock de CONFIG
const mockConfig = {
    UI: {
        TOAST_DURATION: 3000,
        DEBOUNCE_DELAY: 300,
        ANIMATION_DURATION: 300
    }
};

vi.mock('../../src/config/config.js', () => ({
    CONFIG: mockConfig
}));

describe('UIUtils - Pruebas Unitarias', () => {
    let UIUtils;

    beforeEach(async () => {
        const module = await import('../../src/core/utils/UIUtils.js');
        UIUtils = module.UIUtils;
    });

    describe('formatCurrency', () => {
        it('debe formatear número positivo correctamente', () => {
            expect(UIUtils.formatCurrency(100)).toBe('$100.00');
        });

        it('debe formatear decimal correctamente', () => {
            expect(UIUtils.formatCurrency(99.99)).toBe('$99.99');
        });

        it('debe manejar string numérico', () => {
            expect(UIUtils.formatCurrency('50.50')).toBe('$50.50');
        });

        it('debe manejar cero', () => {
            expect(UIUtils.formatCurrency(0)).toBe('$0.00');
        });
    });

    describe('formatDate', () => {
        it('debe formatear fecha correctamente', () => {
            const result = UIUtils.formatDate('2024-01-15');
            expect(result).toContain('2024');
        });

        it('debe formatear fecha con hora', () => {
            const result = UIUtils.formatDate('2024-06-20T10:30:00');
            expect(result).toContain('2024');
        });

        it('debe formatear fecha ISO', () => {
            const result = UIUtils.formatDate('2024-12-25');
            expect(result).toContain('dic');
        });

        it('debe manejar fecha inválida gracefully', () => {
            const result = UIUtils.formatDate('invalid-date');
            expect(result).toContain('Invalid');
        });
    });

    describe('escapeHtml', () => {
        it('debe escapar HTML básico', () => {
            expect(UIUtils.escapeHtml('<script>')).toBe('&lt;script&gt;');
        });

        it('debe escapar comillas', () => {
            expect(UIUtils.escapeHtml('"test"')).toBe('"test"');
        });

        it('debe mantener texto sin HTML', () => {
            expect(UIUtils.escapeHtml('texto normal')).toBe('texto normal');
        });

        it('debe escapar símbolos', () => {
            expect(UIUtils.escapeHtml('a & b')).toContain('&amp;');
        });
    });

    describe('setElementVisibility', () => {
        it('debe mostrar elemento', () => {
            const mockEl = { style: {} };
            UIUtils.setElementVisibility(mockEl, true);
            expect(mockEl.style.display).toBe('block');
        });

        it('debe ocultar elemento', () => {
            const mockEl = { style: {} };
            UIUtils.setElementVisibility(mockEl, false);
            expect(mockEl.style.display).toBe('none');
        });

        it('debe manejar elemento null', () => {
            expect(() => UIUtils.setElementVisibility(null, true)).not.toThrow();
        });

        it('debe manejar cadena vacía', () => {
            const mockEl = { style: {} };
            UIUtils.setElementVisibility(mockEl, '');
            expect(mockEl.style.display).toBe('none');
        });
    });

    describe('scrollToBottom', () => {
        it('debe hacer scroll al fondo', () => {
            const mockEl = { 
                scrollTop: 0, 
                scrollHeight: 500 
            };
            UIUtils.scrollToBottom(mockEl);
            expect(mockEl.scrollTop).toBe(500);
        });

        it('debe manejar elemento null', () => {
            expect(() => UIUtils.scrollToBottom(null)).not.toThrow();
        });

        it('debe manejar elemento undefined', () => {
            expect(() => UIUtils.scrollToBottom(undefined)).not.toThrow();
        });

        it('debe mantener scroll si ya está al fondo', () => {
            const mockEl = { scrollTop: 100, scrollHeight: 100 };
            UIUtils.scrollToBottom(mockEl);
            expect(mockEl.scrollTop).toBe(100);
        });
    });
});