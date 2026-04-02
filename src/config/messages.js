/**
 * Mensajes de la aplicación
 * Facilita internacionalización futura y mantiene consistencia
 */

export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: (name) => `Bienvenido ${name}!`,
        LOGIN_ERROR: 'Correo o contraseña incorrectos',
        REGISTER_SUCCESS: 'Cuenta creada con exito! Ahora puedes iniciar sesion',
        REGISTER_ERROR_EMAIL_EXISTS: 'Este correo ya esta registrado',
        PASSWORD_MISMATCH: 'Las contrasenas no coinciden',
        LOGOUT_SUCCESS: 'Sesion cerrada',
        REQUIRED_LOGIN: 'Debes iniciar sesion para realizar esta accion'
    },
    
    PRODUCTS: {
        CREATE_SUCCESS: 'Producto publicado con exito',
        CREATE_ERROR: 'Error al publicar el producto',
        DELETE_SUCCESS: 'Producto eliminado',
        DELETE_CONFIRM: 'Estas seguro de que deseas eliminar este producto?',
        OWN_PRODUCT: 'Este es tu producto',
        NOT_FOUND: 'No se encontraron productos'
    },
    
    CHAT: {
        MESSAGE_SENT: 'Mensaje enviado!',
        REQUIRED_LOGIN: 'Debes iniciar sesion para enviar mensajes',
        NO_CONVERSATIONS: 'No tienes conversaciones aun',
        SELECT_CONVERSATION: 'Selecciona una conversacion para comenzar a chatear'
    },
    
    VALIDATION: {
        REQUIRED_FIELD: 'Este campo es obligatorio',
        INVALID_EMAIL: 'Correo electronico invalido',
        INVALID_PRICE: 'El precio debe ser mayor a 0',
        INVALID_PASSWORD_LENGTH: (min) => `La contrasena debe tener al menos ${min} caracteres`,
        INVALID_IMAGE_TYPE: 'Tipo de imagen no soportado',
        INVALID_IMAGE_SIZE: (max) => `La imagen no debe superar los ${max}MB`
    },
    
    SYSTEM: {
        ERROR_GENERIC: 'Ha ocurrido un error. Por favor, intenta de nuevo',
        CLEAR_DATA_CONFIRM: 'Estas seguro de que deseas eliminar TODOS los datos? Esta accion no se puede deshacer.'
    }
};

export default MESSAGES;
