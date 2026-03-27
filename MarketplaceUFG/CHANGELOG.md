# Marketplace UFG - Changelog

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
| Base de Datos (Supabase) | ✅ Completado |
| Storage de Imágenes | ✅ Completado |
| Perfil de Usuario | ✅ Completado |
| Realtime Chat | ✅ Completado |

---

## v2.0.0 - Migración a Supabase (2026-03-26)

### Nuevas Funcionalidades

#### Autenticación
- Login y registro con Supabase Auth
- Sesión persistente en Supabase
- Validación de email institucional

#### Productos
- Publicación de productos con múltiples imágenes (máx 5)
- Sistema de carrusel en vista de detalles
- Badge indicador de múltiples imágenes

#### Perfil de Usuario
- Avatar de perfil
- Cambio de foto de perfil
- Edición de nombre
- Foto por defecto (silueta)

#### Chat
- Mensajería en tiempo real con Supabase Realtime
- Notificaciones de mensajes no leídos
- Badge de conversaciones sin leer
- Actualización automática de conversaciones

#### Base de Datos
- Tablas: profiles, products, categories, conversations, messages
- Row Level Security (RLS) en todas las tablas
- Storage para imágenes de productos y perfiles

### Cambios Técnicos

- Migración de LocalStorage a Supabase
- Eliminación de código legacy
- Nuevo sistema de repositorios con Supabase client
- Servicios actualizados para Supabase

---

## v1.0.0 - Versión Inicial (2026-02-15)

### Funcionalidades

- Autenticación con LocalStorage
- Listado de productos
- Publicación de productos
- Sistema de categorías
- Chat básico
- Diseño responsivo

---

## Pendientes / Mejoras Futuras

1. Tests unitarios
2. Optimización de rendimiento
3. Notificaciones push
4. Pagos integrados
5. Valoraciones y reseñas
6. Lista de favoritos

---

*Última actualización: 26/03/2026*
