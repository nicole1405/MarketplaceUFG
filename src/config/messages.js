/**
 * Mensajes de la aplicación
 * Facilita internacionalización futura y mantiene consistencia
 */

export const MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: (name) => `Bienvenido ${name}!`,
        LOGIN_ERROR: 'Correo o contrasena incorrectos',
        LOGIN_EMAIL_NOT_CONFIRMED: 'Debes confirmar tu correo antes de iniciar sesion. Revisa tu bandeja de entrada.',
        REGISTER_SUCCESS: 'Cuenta creada con exito! Ahora puedes iniciar sesion',
        REGISTER_NEEDS_CONFIRMATION: 'Te enviamos un correo de confirmacion. Revisa tu bandeja de entrada y spam para activar tu cuenta.',
        REGISTER_ERROR_EMAIL_EXISTS: 'Este correo ya esta registrado',
        PASSWORD_MISMATCH: 'Las contrasenas no coinciden',
        LOGOUT_SUCCESS: 'Sesion cerrada',
        REQUIRED_LOGIN: 'Debes iniciar sesion para realizar esta accion',
        RESEND_CONFIRMATION_SUCCESS: 'Correo de confirmacion reenviado. Revisa tu bandeja de entrada.',
        RESEND_CONFIRMATION_ERROR: 'Error al reenviar el correo. Intenta de nuevo mas tarde.',
        FORGOT_PASSWORD_SUCCESS: 'Te enviamos un link de recuperacion. Revisa tu correo.',
        FORGOT_PASSWORD_ERROR: 'Error al enviar el correo de recuperacion. Verifica que el correo sea correcto.',
        FORGOT_PASSWORD_RATE_LIMIT: 'Esperá un momento antes de solicitar otro correo. Supabase limita los envios para evitar spam.',
        RESET_PASSWORD_SUCCESS: 'Contrasena actualizada exitosamente. Ahora podes iniciar sesion.',
        RESET_PASSWORD_ERROR: 'Error al actualizar la contrasena. El link puede haber expirado.',
        RESET_PASSWORD_MISMATCH: 'Las contrasenas no coinciden'
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
    },
    
    ADMIN: {
        PRODUCT_APPROVED: 'Producto aprobado exitosamente',
        PRODUCT_REJECTED: 'Producto rechazado',
        REJECTION_REASON_REQUIRED: 'El motivo de rechazo es obligatorio',
        ROLE_CHANGED: 'Rol de usuario actualizado',
        CATEGORY_CREATED: 'Categoria creada exitosamente',
        CATEGORY_UPDATED: 'Categoria actualizada exitosamente',
        CATEGORY_DELETED: 'Categoria eliminada exitosamente',
        CATEGORY_DELETE_CONFIRM: 'Estas seguro de que deseas eliminar esta categoria?',
        CATEGORY_NAME_REQUIRED: 'El nombre de la categoria es obligatorio',
        ROLE_CHANGE_CONFIRM: 'Estas seguro de que deseas cambiar el rol de este usuario?',
        ACCESS_DENIED: 'Solo los administradores pueden realizar esta accion'
    }
};

export default MESSAGES;
