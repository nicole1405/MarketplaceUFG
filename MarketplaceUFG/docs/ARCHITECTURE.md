# Arquitectura del Sistema Marketplace UFG

## 1. Visión General del Proyecto

### 1.1 Descripción del Sistema

**Marketplace UFG** es una aplicación web de tipo Single Page Application (SPA) desarrollada en vanilla JavaScript que funciona como una plataforma de comercio electrónico entre estudiantes de la Universidad Francisco Gavidia. El sistema permite a los usuarios registrar productos en venta, explorar el catálogo disponible, y comunicarse entre compradores y vendedores mediante un sistema de mensajería integrado.

La arquitectura del sistema está diseñada siguiendo los principios de **Clean Architecture**, lo que garantiza una separación clara de responsabilidades entre las distintas capas del sistema. Esta separación facilita el mantenimiento del código, permite realizar pruebas de manera más sencilla, y permite que el sistema sea extensible sin necesidad de modificar componentes existentes.

El sistema utiliza **Supabase** como backend, proporcionando:
- Base de datos PostgreSQL
- Autenticación de usuarios
- Storage para imágenes
- Realtime para mensajes

### 1.2 Objetivos de Arquitectura

La arquitectura de Marketplace UFG persigue varios objetivos fundamentales:

- **Separación de responsabilidades**: Cada componente tiene una única responsabilidad bien definida
- **Bajo acoplamiento**: Los módulos se comunican mediante interfaces bien definidas
- **Mantenibilidad**: Código fácil de comprender, modificar y extender

---

## 2. Estructura del Proyecto

```
MarketplaceUFG/
├── index.html                 # Punto de entrada de la aplicación
├── styles.css                # Estilos globales de la aplicación
├── src/
│   ├── app.js                # Clase Application (contenedor de dependencias)
│   ├── config/
│   │   ├── config.js         # Configuración centralizada
│   │   ├── events.js        # Definición de eventos del sistema
│   │   └── messages.js      # Mensajes de la aplicación
│   ├── core/
│   │   └── utils/           # Utilidades reutilizables
│   │       ├── EventEmitter.js
│   │       ├── UIUtils.js
│   │       └── ToastService.js
│   ├── features/
│   │   ├── auth/
│   │   │   └── AuthController.js
│   │   ├── products/
│   │   │   └── ProductController.js
│   │   └── chat/
│   │       └── ChatController.js
│   └── lib/
│       ├── supabase.js      # Cliente Supabase
│       ├── supabase-repositories/
│       │   ├── ProductRepository.js
│       │   ├── ConversationRepository.js
│       │   ├── MessageRepository.js
│       │   ├── ProfileRepository.js
│       │   ├── CategoryRepository.js
│       │   └── SessionRepository.js
│       └── supabase-services/
│           ├── AuthService.js
│           ├── ProductService.js
│           ├── ChatService.js
│           ├── CategoryService.js
│           └── StorageService.js
└── docs/
    └── ARCHITECTURE.md
```

---

## 3. Capas de Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN                         │
│         (Controladores - AuthController, etc.)          │
├─────────────────────────────────────────────────────────┤
│                    APLICACIÓN                           │
│              (Servicios - AuthService, etc.)           │
├─────────────────────────────────────────────────────────┤
│                  INFRAESTRUCTURA                        │
│         (Repositorios + Supabase Client)                │
├─────────────────────────────────────────────────────────┤
│                     SUPABASE                            │
│         (Database, Auth, Storage, Realtime)            │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Modelo de Datos (Supabase)

### Tablas

| Tabla | Descripción |
|-------|-------------|
| profiles | Perfiles de usuarios |
| products | Productos publicados |
| categories | Categorías de productos |
| conversations | Conversaciones entre usuarios |
| messages | Mensajes individuales |

### Storage

- **fotos_anuncios**: Imágenes de productos
- **fotos_perfil**: Avatares de usuarios

### Seguridad

- RLS (Row Level Security) habilitado en todas las tablas
- Políticas de acceso para usuarios autenticados

---

## 5. Flujo de Datos

```
┌────────────┐    ┌──────────────┐    ┌────────────┐    ┌────────────┐
│   USUARIO  │───▶│ CONTROLADOR  │───▶│  SERVICIO  │───▶│ REPOSITORY│
│   (DOM)    │    │ (Feature)    │    │  (Core)    │    │ (Supabase)│
└────────────┘    └──────────────┘    └────────────┘    └────────────┘
```

---

## 6. Patrones de Diseño

### Dependency Injection
La clase `Application` actúa como contenedor de dependencias, inyectando repositorios y servicios en los controladores.

### Pub-Sub
El `eventBus` permite comunicación desacoplada entre componentes mediante eventos.

### Repository Pattern
Los repositorios abstraen el acceso a datos de Supabase, proporcionando una interfaz limpia.

---

## 7. Configuración del Sistema

### Eventos del Sistema
- `auth:login` / `auth:logout` - Autenticación
- `products:created` / `products:updated` - Productos
- `chat:message:sent` - Mensajería
- `ui:view:changed` - Navegación

### Mensajes
Todos los mensajes de la interfaz están centralizados en `messages.js`.

---

## 8. Características Implementadas

### Autenticación
- Registro con email institucional
- Login con email y contraseña
- Sesión persistente con Supabase Auth

### Productos
- Publicación de productos con múltiples imágenes (máx 5)
- Categorías predefinidas
- Búsqueda y filtrado
- Sistema de carrusel en detalles

### Chat
- Conversaciones entre compradores y vendedores
- Mensajería en tiempo real (Realtime)
- Notificaciones de mensajes no leídos

### Perfil
- Edición de nombre
- Avatar de perfil
- Cambio de foto

---

## 9. Glosario

- **Supabase**: Plataforma open-source de backend
- **RLS**: Row Level Security - Seguridad a nivel de filas
- **SPA**: Single Page Application
- **ES Modules**: Sistema de módulos de JavaScript

---

## 10. Referencias

- [Supabase Docs](https://supabase.com/docs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
