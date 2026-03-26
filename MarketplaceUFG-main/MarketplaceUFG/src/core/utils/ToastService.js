/**
 * Sistema de notificaciones Toast
 */

import { CONFIG } from '../../config/config.js';

export class ToastService {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Crear contenedor si no existe
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'success', duration = CONFIG.UI.TOAST_DURATION) {
        const toast = this.createToastElement(message, type);
        this.container.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remover
        setTimeout(() => {
            this.hide(toast);
        }, duration);

        return toast;
    }

    createToastElement(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Icono según tipo
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span> ${message}`;
        
        return toast;
    }

    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    success(message) {
        return this.show(message, 'success');
    }

    error(message) {
        return this.show(message, 'error');
    }

    warning(message) {
        return this.show(message, 'warning');
    }

    info(message) {
        return this.show(message, 'info');
    }
}

// Instancia singleton
export const toast = new ToastService();

export default ToastService;
