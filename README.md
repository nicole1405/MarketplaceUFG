# Marketplace UFG

**Conectando emprendedores universitarios**

Una aplicación web para que los estudiantes de la Universidad Francisco Gavidia puedan comprar y vender productos entre ellos.

## ¿Qué es Marketplace UFG?

Marketplace UFG es una plataforma diseñada exclusivamente para la comunidad universitaria de la UFG, donde los estudiantes pueden:

- **Publicar productos** para vender (libros, electrónicos, materiales de estudio, etc.)
- **Buscar y comprar** productos de otros estudiantes
- **Chatear** directamente con vendedores/compradores
- **Gestionar su perfil** con foto y nombre
- **Acceder desde cualquier dispositivo** (computadora, tablet o celular)

## Cómo ejecutar la aplicación

### Opción 1: Con Python (Recomendado)

1. Abre la terminal
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

1. En la pantalla de inicio, haz clic en **"Regístrate aquí"**
2. Completa el formulario:
   - **Nombre completo**
   - **Correo electrónico** institucional
   - **Contraseña** (mínimo 6 caracteres)
   - **Confirmar contraseña**
3. Haz clic en **"Crear Cuenta"**
4. Inicia sesión con tus credenciales

### 2. Ver productos

- En la página principal verás todos los productos publicados
- Usa la barra de búsqueda o los filtros de categoría
- Haz clic en cualquier producto para ver más detalles

### 3. Publicar un producto

1. Ve a la pestaña **"Vender"**
2. Haz clic en **"Publicar Nuevo Producto"**
3. Completa el formulario:
   - Nombre del producto
   - Categoría
   - Precio en dólares
   - Descripción
   - Imágenes (hasta 5)
4. Haz clic en **"Publicar Producto"**

### 4. Contactar a un vendedor

1. Haz clic en un producto que te interese
2. Escribe tu mensaje en el formulario de contacto
3. El vendedor recibirá tu mensaje y podrán chatear

### 5. Chats y mensajes

- Ve a la pestaña **"Chats"**
- Verás todas tus conversaciones
- El número en rojo indica mensajes nuevos
- Haz clic en una conversación para responder

### 6. Gestionar tu perfil

- Haz clic en tu nombre/avatar en el header
- Puedes cambiar tu nombre y foto de perfil

---

## Estructura del Proyecto

```
├── index.html              ← Página principal
├── styles.css              ← Estilos globales
├── README.md               ← Este archivo
├── src/
│   ├── app.js             ← Punto de entrada
│   ├── config/            ← Configuración
│   │   ├── config.js
│   │   ├── events.js
│   │   └── messages.js
│   ├── core/utils/        ← Utilidades
│   │   ├── EventEmitter.js
│   │   ├── UIUtils.js
│   │   └── ToastService.js
│   ├── features/          ← Controladores
│   │   ├── auth/AuthController.js
│   │   ├── products/ProductController.js
│   │   └── chat/ChatController.js
│   └── lib/
│       ├── supabase.js
│       ├── supabase-repositories/
│       └── supabase-services/
└── docs/
    └── ARCHITECTURE.md
```

---

## Tecnologías

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Arquitectura**: Clean Architecture con Dependency Injection

---

## Requisitos técnicos

- **Navegador**: Chrome, Firefox, Safari, Edge (últimas versiones)
- **JavaScript**: Debe estar habilitado
- **Conexión a internet**: Necesario para Supabase

---

## Créditos

**Proyecto académico**
- Universidad: Universidad Francisco Gavidia (UFG)
- Asignatura: Aplicación de metodologías ágiles de desarrollo de software
- Fecha: Marzo 2026
- Integrantes:
  1. Damaris Nicole Pérez Nolasco - PN100224
  2. Alejandro José González Escobar - GE100124
  3. Jenny Alejandra Vargas Alfaro - VA100624
  4. Gabriel Isaac Sorto Rivas - SR100224
  5. Kevin René Flores Martínez - FM100224
