# Marketplace UFG - Estado del Proyecto

> Universidad Francisco Gavidia - Proyecto de Marketplace

---

## Estado General del Proyecto

| Módulo | Estado |
|--------|--------|
| Autenticación (Login/Registro) | ✅ Completado |
| Listado de Productos | ✅ Completado |
| Tarjetas de Producto | ✅ Completado |
| Vista de Detalle (Modal) | ✅ Completado |
| Formulario de Publicación | ✅ Completado |
| Sistema de Mensajería/Chat | ✅ Completado |
| Sistema de Categorías | ✅ Completado |
| Diseño Responsivo | ✅ Completado |
| Base de Datos (Supabase) | ❌ Pendiente - No conectado al frontend |

---

## Funcionalidades Implementadas

### 1. Autenticación (HU - Original)
- Login con email y contraseña
- Registro de nuevos usuarios
- Validación de datos
- Sesión persistente con localStorage

### 2. Tarjetas de Producto (HU01)
- Imagen del producto
- Título del producto
- Precio formateado
- Nombre del vendedor
- Descripción truncada
- **NUEVO:** Badge de categoría
- **NUEVO:** Botones de acción visibles (Ver Detalle, Contactar)

### 3. Vista de Detalle del Producto (HU03)
- Imagen ampliada
- Descripción completa
- Precio
- Información del vendedor
- **NUEVO:** Categoría del producto
- Botón para contactar al vendedor
- Modal con animación

### 4. Formulario de Publicación (HU02)
- Nombre del producto (obligatorio)
- Descripción (obligatorio)
- Precio (obligatorio, solo números)
- **NUEVO:** Selector de categoría (obligatorio)
- Imagen (opcional, con preview)
- Validación frontend
- Botones de Publicar y Cancelar/Limpiar

### 5. Sistema de Categorías (NUEVO)
- 7 categorías predefinidas:
  - 💻 Electrónica
  - 📚 Libros
  - 👕 Ropa y Accesorios
  - 🔧 Servicios
  - 🏠 Hogar
  - ⚽ Deportes
  - 📦 Otros
- Filtro de categorías en listado de productos
- Selector de categoría en formulario
- Mostrar categoría en tarjetas y detalles

### 6. Diseño Responsivo (HU04)
- Grid adaptativo de productos
- Media queries para móviles (< 768px, < 480px)
- Navegación adaptativa
- Chat responsivo

### 7. Estética e Interfaz (HU05)
- Paleta de colores definida (CSS variables)
- Tipografía uniforme (Segoe UI)
- Iconos consistentes
- Animaciones y transiciones
- Toast notifications

---

## Modelo de Datos (Supabase) - PENDIENTE

```sql
-- Esquema a crear en Supabase (PENDIENTE)

usuarios
  - id_usuario: INT, PK
  - nombre: VARCHAR(100)
  - correo: VARCHAR(150)
  - tipo: ENUM('Comprador', 'Vendedor')
  - auth_id: UUID
  - created_at: TIMESTAMP

categorias
  - id_categoria: INT, PK
  - nombre: VARCHAR(80)
  - created_at: TIMESTAMP

productos
  - id_producto: INT, PK
  - nombre: VARCHAR(100)
  - descripcion: TEXT
  - precio: DECIMAL(10,2)
  - imagen: VARCHAR(255)
  - id_usuario: INT, FK → usuarios
  - id_categoria: INT, FK → categorias
  - created_at: TIMESTAMP

conversaciones
  - id_conversacion: INT, PK
  - id_producto: INT, FK
  - id_comprador: INT, FK
  - id_vendedor: INT, FK
  - created_at: TIMESTAMP

mensajes
  - id_mensaje: INT, PK
  - id_conversacion: INT, FK
  - id_remitente: INT, FK
  - contenido: TEXT
  - leido: BOOLEAN
  - created_at: TIMESTAMP
```

**Nota:** El proyecto actualmente usa **localStorage** para almacenar datos. Las tablas de Supabase están PENDIENTES por crear.

---

## Reglas de Negocio Implementadas

- ✅ Un usuario puede publicar múltiples productos
- ✅ Cada producto pertenece a una categoría
- ✅ Solo un usuario puede eliminar sus propios productos
- ✅ Validación de campos obligatorios en frontend
- ✅ Un comprador puede contactar a un vendedor

---

## Archivos del Proyecto

```
MarketplaceUFG/
├── index.html                 # Estructura HTML principal
├── styles.css                 # Todos los estilos
├── src/
│   ├── app.js                 # Punto de entrada
│   ├── config/
│   │   ├── config.js         # Configuración
│   │   ├── events.js        # Eventos del sistema
│   │   └── messages.js      # Mensajes
│   ├── core/
│   │   ├── domain/
│   │   │   ├── Product.js   # Entidad Producto
│   │   │   ├── User.js      # Entidad Usuario
│   │   │   └── ...
│   │   ├── repositories/   # Repositorios (localStorage)
│   │   ├── services/
│   │   │   ├── ProductService.js
│   │   │   ├── CategoryService.js  # NUEVO
│   │   │   └── ...
│   │   └── utils/           # Utilidades
│   └── features/
│       ├── auth/            # Controlador de Auth
│       ├── products/        # Controlador de Productos
│       └── chat/            # Controlador de Chat
```

---

## Pendientes / Mejoras Futuras

1. **Integración con Supabase** - Conectar el frontend con la base de datos real (PENDIENTE)
2. **Crear tablas en Supabase** - Ejecutar scripts DDL para crear las tablas
3. **Mejora de validación** - Añadir más validaciones (tamaño de imagen, etc.)
4. **Subida de imágenes** - Integrar Storage de Supabase para guardar imágenes
5. **Perfil de usuario** - Gestión de perfil y productos publicados
6. **Notificaciones en tiempo real** - WebSockets para chat en tiempo real
7. **Tests unitarios** - Cobertura de tests
8. **Optimización** - Lazy loading, cache, etc.

---

## Cómo Ejecutar

1. Abrir `index.html` en un navegador
2. Registrarse como nuevo usuario
3. Explorar el marketplace

---

*Última actualización: 15/03/2026*
