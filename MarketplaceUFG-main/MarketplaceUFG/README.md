# Marketplace UFG

**Conectando emprendedores universitarios**

Una aplicación web para que los estudiantes de la Universidad Francisco Gavidia puedan comprar y vender productos entre ellos.

## ¿Qué es Marketplace UFG?

Marketplace UFG es una plataforma diseñada exclusivamente para la comunidad universitaria de la UFG, donde los estudiantes pueden:

- **Publicar productos** para vender (libros, electrónicos, materiales de estudio, etc.)
- **Buscar y comprar** productos de otros estudiantes
- **Chatear** directamente con vendedores/compradores
- **Acceder desde cualquier dispositivo** (computadora, tablet o celular)

## Cómo ejecutar la aplicación

### Opción 1: Con Python (Recomendado)

1. Abre la terminal o símbolo del sistema
2. Navega hasta la carpeta del proyecto:
   ```bash
   cd "/MarketplaceUFG"
   ```
3. Ejecuta el servidor:
   ```bash
   python -m http.server 8080
   ```
4. Abre tu navegador y ve a: `http://localhost:8080`

### Opción 2: Con Node.js

```bash
cd "/MarketplaceUFG"
npx serve .
```

### Opción 3: Extensión de VS Code

Instala la extensión **"Live Server"** y haz clic derecho en `index.html` → "Open with Live Server"

---

## Guía de uso

### 1. Crear una cuenta

Para comenzar a usar Marketplace UFG necesitas crear una cuenta de usuario. Sigue estos pasos:

#### Paso a paso para registrarte:

1. **En la pantalla de inicio**, haz clic en el enlace **"Regístrate aquí"** debajo del formulario de login

2. **Completa el formulario de registro** con la siguiente información:
   - **Nombre completo**: Tu nombre real (ej: "Juan Pérez")
   - **Correo electrónico**: Tu email institucional (ej: "juan.perez@ufg.edu.sv")
   - **Contraseña**: Mínimo 6 caracteres (ej: "MiPass123")
   - **Confirmar contraseña**: Escribe la misma contraseña nuevamente

3. **Haz clic en "Crear Cuenta"**

4. **Si todo está correcto**, verás un mensaje de éxito: *"¡Cuenta creada con éxito! Ahora puedes iniciar sesión"*

5. **Automáticamente** serás redirigido al formulario de inicio de sesión

6. **Inicia sesión** con tu correo y contraseña recién creados

#### Importante:
- **El correo debe ser único**: No puedes usar un email que ya esté registrado
- **Las contraseñas deben coincidir**: Si no coinciden, aparecerá un mensaje de error
- **Contraseña segura**: Usa al menos 6 caracteres (letras y números recomendados)
- **Datos reales**: Usa tu nombre real para que otros estudiantes puedan identificarte

#### Consejos de seguridad:
- No compartas tu contraseña con nadie
- Usa una contraseña diferente a la de tu correo institucional
- Recuerda que los datos se guardan localmente en tu navegador

#### ¿Problemas para registrarte?
- **"Este correo ya está registrado"**: Usa otro email o recupera tu cuenta si ya te habías registrado
- **"Las contraseñas no coinciden"**: Verifica que escribiste exactamente lo mismo en ambos campos
- **El botón no funciona**: Asegúrate de llenar todos los campos obligatorios (marcados con *)

### 2. Ver productos
- En la página principal verás todos los productos publicados
- Usa la barra de búsqueda para encontrar algo específico
- Haz clic en cualquier producto para ver más detalles

### 3. Publicar un producto
- Ve a la pestaña "Vender"
- Completa el formulario con:
  - Nombre del producto
  - Precio en dólares
  - Descripción detallada
  - Foto (opcional pero recomendada)
- Haz clic en "Publicar Producto"

### 4. Contactar a un vendedor
- Haz clic en un producto que te interese
- Escribe tu mensaje en el formulario de contacto
- El vendedor recibirá tu mensaje y podrán chatear

### 5. Chats y mensajes
- Ve a la pestaña "Chats"
- Verás todas tus conversaciones activas
- El número en rojo indica mensajes nuevos
- Haz clic en una conversación para responder

### 6. Gestionar mis productos
- En la pestaña "Vender" verás tus productos publicados
- Puedes eliminar productos que ya no quieras vender

---

## Estructura del Proyecto

```
MarketplaceUFG/
│
├── index.html              ← Página principal (abre esta)
├── styles.css              ← Estilos visuales
├── README.md               ← Este archivo
│
├── src/                    ← Código fuente
│   │
│   ├── config/            ← Configuración
│   │   ├── config.js
│   │   ├── events.js
│   │   └── messages.js
│   │
│   ├── core/              ← Lógica principal
│   │   │
│   │   ├── domain/        ← Modelos de datos
│   │   │   ├── User.js      (Usuarios)
│   │   │   ├── Product.js   (Productos)
│   │   │   ├── Message.js   (Mensajes)
│   │   │   └── Conversation.js (Conversaciones)
│   │   │
│   │   ├── repositories/  ← Almacenamiento de datos
│   │   │   ├── UserRepository.js
│   │   │   ├── ProductRepository.js
│   │   │   ├── ConversationRepository.js
│   │   │   └── SessionRepository.js
│   │   │
│   │   ├── services/      ← Funcionalidades principales
│   │   │   ├── AuthService.js    (Login/Registro)
│   │   │   ├── ProductService.js (Gestión de productos)
│   │   │   └── ChatService.js    (Sistema de chat)
│   │   │
│   │   └── utils/         ← Herramientas auxiliares
│   │       ├── EventEmitter.js
│   │       ├── ImageUtils.js
│   │       ├── Validator.js
│   │       ├── UIUtils.js
│   │       └── ToastService.js
│   │
│   ├── features/          ← Funcionalidades de la interfaz
│   │   ├── auth/
│   │   │   └── AuthController.js
│   │   ├── products/
│   │   │   └── ProductController.js
│   │   └── chat/
│   │       └── ChatController.js
│   │
│   └── app.js             ← Archivo principal que inicia todo
│
└── assets/                ← Imágenes y recursos
    ├── images/
    └── icons/
```

---

## Datos y Privacidad

- Los datos se guardan **localmente** en tu navegador
- Ninguna información se envía a servidores externos
- Para borrar todos los datos, abre la consola del navegador (F12) y ejecuta:
  ```javascript
  limpiarTodosDatos()
  ```

---

## Requisitos técnicos

- **Navegador**: Chrome, Firefox, Safari, Edge (últimas versiones)
- **JavaScript**: Debe estar habilitado
- **LocalStorage**: Necesario para guardar datos

---

## Notas importantes

- Los datos se almacenan en el navegador. Si borras el historial/caché, perderás:
  - Tu cuenta de usuario
  - Productos publicados
  - Conversaciones de chat
- Usa un servidor local para ejecutar la aplicación (no abras directamente el archivo HTML)

---

## Créditos

**Proyecto académico**
- Universidad: Universidad Francisco Gavidia (UFG)
- Asignatura: Aplicación de metodologías ágiles de desarrollo de software
- Fecha: 15 de febrero 2026
- Integrantes:
  1. Damaris Nicole Pérez Nolasco - PN100224
  2. Alejandro José González Escobar - GE100124
  3. Jenny Alejandra Vargas Alfaro - VA100624
  4. Gabriel Isaac Sorto Rivas - SR100224
  5. Kevin René Flores Martínez - FM100224
