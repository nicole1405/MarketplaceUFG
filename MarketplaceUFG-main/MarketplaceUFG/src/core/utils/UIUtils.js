/**
 * Utilidades de UI
 */

import { CONFIG } from '../../config/config.js';

export class UIUtils {
    static debounce(func, wait = CONFIG.UI.DEBOUNCE_DELAY) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static formatCurrency(amount) {
        return `$${parseFloat(amount).toFixed(2)}`;
    }

    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    static formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    static scrollToBottom(element) {
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }

    static setElementVisibility(element, visible) {
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
    }

    static toggleElement(element, force) {
        if (element) {
            if (force !== undefined) {
                element.classList.toggle('hidden', !force);
            } else {
                element.classList.toggle('hidden');
            }
        }
    }
}

export default UIUtils;
