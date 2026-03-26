/**
 * Entidad Usuario
 * Representa un usuario del sistema
 */

export class User {
    constructor({ id, nombre, email, password, fechaRegistro }) {
        this.id = id || Date.now();
        this.nombre = nombre;
        this.email = email.toLowerCase().trim();
        this.password = password; // En producción: hash
        this.fechaRegistro = fechaRegistro || new Date().toISOString();
    }

    static create(data) {
        return new User(data);
    }

    validate() {
        const errors = [];
        
        if (!this.nombre?.trim()) {
            errors.push('El nombre es obligatorio');
        }
        
        if (!this.email?.trim() || !this.isValidEmail()) {
            errors.push('El correo electrónico es inválido');
        }
        
        if (!this.password || this.password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }
        
        return errors;
    }

    isValidEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.email);
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            email: this.email,
            password: this.password,
            fechaRegistro: this.fechaRegistro
        };
    }

    static fromJSON(json) {
        return new User(json);
    }
}

export default User;
