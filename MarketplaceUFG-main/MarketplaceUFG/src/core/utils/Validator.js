/**
 * Utilidades de validación
 */

import { CONFIG } from '../../config/config.js';

export class Validator {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        return password && password.length >= CONFIG.VALIDATION.MIN_PASSWORD_LENGTH;
    }

    static isValidPrice(price) {
        const numPrice = parseFloat(price);
        return !isNaN(numPrice) && numPrice > 0;
    }

    static isNotEmpty(value) {
        return value !== null && value !== undefined && String(value).trim().length > 0;
    }

    static validateForm(fields) {
        const errors = {};
        
        for (const [fieldName, rules] of Object.entries(fields)) {
            const fieldErrors = [];
            
            for (const rule of rules) {
                const { validator, message } = rule;
                if (!validator()) {
                    fieldErrors.push(message);
                }
            }
            
            if (fieldErrors.length > 0) {
                errors[fieldName] = fieldErrors;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}

export default Validator;
