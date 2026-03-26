/**
 * Utilidades para manipulación de imágenes
 */

import { CONFIG } from '../../config/config.js';
import { MESSAGES } from '../../config/messages.js';

export class ImageUtils {
    static readFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            
            reader.readAsDataURL(file);
        });
    }

    static validateFile(file) {
        const errors = [];
        
        // Validar tipo
        if (!CONFIG.VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            errors.push(MESSAGES.VALIDATION.INVALID_IMAGE_TYPE);
        }
        
        // Validar tamaño
        const maxSizeBytes = CONFIG.VALIDATION.MAX_IMAGE_SIZE_MB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            errors.push(MESSAGES.VALIDATION.INVALID_IMAGE_SIZE(CONFIG.VALIDATION.MAX_IMAGE_SIZE_MB));
        }
        
        return errors;
    }

    static async processFile(file) {
        const errors = this.validateFile(file);
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        return await this.readFile(file);
    }

    static createPlaceholder(width = 300, height = 200, text = 'Sin imagen') {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);
        
        ctx.fillStyle = '#999';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, width / 2, height / 2);
        
        return canvas.toDataURL();
    }
}

export default ImageUtils;
