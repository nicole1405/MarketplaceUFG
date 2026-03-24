/**
 * Entidad Conversación
 * Representa una conversación entre comprador y vendedor
 */

import { Message } from './Message.js';

export class Conversation {
    constructor({ 
        id, 
        productoId, 
        productoNombre, 
        comprador, 
        compradorNombre, 
        vendedor, 
        vendedorNombre, 
        mensajes = [], 
        fechaCreacion, 
        ultimaActualizacion 
    }) {
        this.id = id || this.generateId(productoId, comprador, vendedor);
        this.productoId = productoId;
        this.productoNombre = productoNombre;
        this.comprador = comprador;
        this.compradorNombre = compradorNombre;
        this.vendedor = vendedor;
        this.vendedorNombre = vendedorNombre;
        this.mensajes = mensajes.map(m => m instanceof Message ? m : Message.fromJSON(m));
        this.fechaCreacion = fechaCreacion || new Date().toISOString();
        this.ultimaActualizacion = ultimaActualizacion || new Date().toISOString();
    }

    static create(data) {
        return new Conversation(data);
    }

    generateId(productoId, comprador, vendedor) {
        return `${productoId}-${comprador}-${vendedor}`;
    }

    addMessage(message) {
        const newMessage = message instanceof Message ? message : Message.create(message);
        const errors = newMessage.validate();
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }
        
        this.mensajes.push(newMessage);
        this.ultimaActualizacion = new Date().toISOString();
        return this;
    }

    getLastMessage() {
        if (this.mensajes.length === 0) return null;
        return this.mensajes[this.mensajes.length - 1];
    }

    getUnreadCountFor(email) {
        return this.mensajes.filter(m => !m.isFrom(email)).length;
    }

    involvesUser(email) {
        return this.comprador === email || this.vendedor === email;
    }

    getOtherParticipant(email) {
        return this.comprador === email 
            ? { email: this.vendedor, nombre: this.vendedorNombre }
            : { email: this.comprador, nombre: this.compradorNombre };
    }

    validate() {
        const errors = [];
        
        if (!this.productoId) {
            errors.push('La conversación debe estar asociada a un producto');
        }
        
        if (!this.comprador || !this.vendedor) {
            errors.push('La conversación debe tener comprador y vendedor');
        }
        
        return errors;
    }

    toJSON() {
        return {
            id: this.id,
            productoId: this.productoId,
            productoNombre: this.productoNombre,
            comprador: this.comprador,
            compradorNombre: this.compradorNombre,
            vendedor: this.vendedor,
            vendedorNombre: this.vendedorNombre,
            mensajes: this.mensajes.map(m => m.toJSON()),
            fechaCreacion: this.fechaCreacion,
            ultimaActualizacion: this.ultimaActualizacion
        };
    }

    static fromJSON(json) {
        return new Conversation(json);
    }
}

export default Conversation;
