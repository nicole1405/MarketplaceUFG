/**
 * Entidad Mensaje
 * Representa un mensaje en una conversación
 */

export class Message {
    constructor({ id, remitente, remitenteNombre, texto, fecha }) {
        this.id = id || Date.now();
        this.remitente = remitente;
        this.remitenteNombre = remitenteNombre;
        this.texto = texto?.trim();
        this.fecha = fecha || new Date().toISOString();
    }

    static create(data) {
        return new Message(data);
    }

    validate() {
        const errors = [];
        
        if (!this.texto || this.texto.length === 0) {
            errors.push('El mensaje no puede estar vacío');
        }
        
        if (!this.remitente) {
            errors.push('El mensaje debe tener un remitente');
        }
        
        return errors;
    }

    isFrom(email) {
        return this.remitente === email;
    }

    getFormattedTime() {
        const date = new Date(this.fecha);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    toJSON() {
        return {
            id: this.id,
            remitente: this.remitente,
            remitenteNombre: this.remitenteNombre,
            texto: this.texto,
            fecha: this.fecha
        };
    }

    static fromJSON(json) {
        return new Message(json);
    }
}

export default Message;
