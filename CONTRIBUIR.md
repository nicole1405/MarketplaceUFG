# Guía de Contribución - Marketplace UFG

> Guía completa para contribuir al proyecto de manera correcta y ordenada.

---

## 📋 Índice

1. [Configuración Inicial](#-configuración-inicial)
2. [Flujo de Trabajo](#-flujo-de-trabajo)
3. [Crear una Rama](#-crear-una-rama)
4. [Hacer Commits](#-hacer-commits)
5. [Subir Cambios](#-subir-cambios)
6. [Crear un Pull Request](#-crear-un-pull-request)
7. [Buenas Prácticas](#-buenas-prácticas)
8. [Errores Comunes](#-errores-comunes)
9. [¿Necesitas Ayuda?](#-necesitas-ayuda)

---

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio

```bash
# Clona el repositorio (solo la primera vez)
git clone https://github.com/nicole1405/MarketplaceUFG.git

# Entra a la carpeta del proyecto
cd MarketplaceUFG
```

### 2. Verificar que estás en la rama correcta

```bash
# Debería mostrar: main
git branch

# Si no estás en main, cámbiate
git checkout main
```

### 3. Asegúrate de tener la última versión

```bash
# Descarga los últimos cambios del repositorio
git pull origin main
```

---

## 🔄 Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO CORRECTO DE TRABAJO                    │
└─────────────────────────────────────────────────────────────────┘

  1. CLONAR          2. CREAR RAMA        3. TRABAJAR
     ┌───┐              ┌───┐                ┌───┐
     │ 📥 │  ───────▶   │ 🌿 │  ───────▶     │ 💻 │
     └───┘              └───┘                └───┘
   git clone          git checkout -b      Hacer cambios
                      feat/mi-cambio

  4. COMMIT           5. PUSH              6. PULL REQUEST
     ┌───┐              ┌───┐                ┌───┐
     │ 💾 │  ───────▶   │ ⬆️ │  ───────▶     │ 🔀 │
     └───┘              └───┘                └───┘
   git commit         git push origin      Crear PR en
                     feat/mi-cambio       GitHub
```

---

## 🌿 Crear una Rama

**⚠️ NUNCA trabajes directamente en `main`.**

Siempre crea una rama nueva para cada cambio o funcionalidad.

### Nomenclatura de ramas

```
feat/nombre-del-cambio      ← Nuevas funcionalidades
fix/nombre-del-fix          ← Corrección de bugs
docs/nombre-del-doc         ← Documentación
style/nombre-del-cambio     ← Estilos CSS, formato
refactor/nombre-del-cambio  ← Refactorización de código
test/nombre-del-test        ← Agregar o corregir tests
```

### Ejemplos

```bash
# Nueva funcionalidad: agregar carrito de compras
git checkout -b feat/carrito-de-compras

# Corrección de bug: arreglar login
git checkout -b fix/error-en-login

# Documentación: actualizar README
git checkout -b docs/actualizar-readme

# Refactor: limpiar código de AuthController
git checkout -b refactor/limpiar-auth-controller
```

### Verificar que la rama se creó

```bash
git branch
# Debería mostrar tu nueva rama con un * al lado
```

---

## 💾 Hacer Commits

### Reglas de Oro

| ✅ Hacer | ❌ No Hacer |
|----------|-------------|
| Commits pequeños y enfocados | Un solo commit con todo |
| Mensajes descriptivos | "fix", "update", "cambios" |
| Un cambio lógico por commit | Mezclar múltiples cambios |
| Commitear frecuentemente | Esperar horas para commitear |

### Antes de commitear, verifica qué cambió

```bash
# Ver los archivos modificados
git status

# Ver los cambios línea por línea
git diff

# Ver solo los archivos modificados
git diff --name-only
```

### Estructura del mensaje de commit

```
<tipo>: <descripción corta en presente>

[opcional: cuerpo explicativo]

[opcional: footer con notas]
```

### Tipos de commit

| Tipo | Cuándo usarlo |
|------|---------------|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Solo documentación |
| `style` | Cambios de formato/estilos |
| `refactor` | Reestructurar código sin cambiar funcionalidad |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento |
| `perf` | Mejoras de rendimiento |

### Ejemplos de buenos commits

```bash
# ✅ Bueno - Específico y claro
git commit -m "feat: agregar botón de favoritos en tarjeta de producto"

# ✅ Bueno - Incluye contexto
git commit -m "fix: corregir validación de email en formulario de registro

- Ahora acepta emails con subdominios
- Agregué test para el caso edge case"

# ✅ Bueno - Cambio pequeño y enfocado
git commit -m "docs: agregar sección de instalación en README"

# ❌ Malo - Muy vago
git commit -m "update"

# ❌ Malo - Sin contexto
git commit -m "fix"

# ❌ Malo - Demasiado grande
git commit -m "cambios varios del proyecto"
```

### Ejecutar el commit

```bash
# Agregar archivos específicos
git add src/features/auth/AuthController.js
git add src/styles/login.css

# O agregar todos los cambios (solo si están relacionados)
git add .

# Hacer el commit
git commit -m "feat: agregar validación de contraseña en registro"
```

---

## ⬆️ Subir Cambios

### Primera vez subiendo la rama

```bash
# Sube la rama y establece el seguimiento
git push -u origin feat/nombre-de-tu-rama
```

### Subidas posteriores

```bash
# Simplemente push (ya tiene seguimiento)
git push
```

### Si hay conflictos con main

```bash
# 1. Trae los cambios de main a tu rama
git fetch origin
git merge origin/main

# 2. Resuelve los conflictos (si los hay)
# 3. Commitea la resolución
git commit -m "merge: resolver conflictos con main"

# 4. Sube los cambios
git push
```

---

## 🔀 Crear un Pull Request (PR)

### ¿Qué es un Pull Request?

Un PR es una propuesta de cambios que其他人 pueden revisar antes de fusionar al código principal. **Nunca** hagas push directo a `main`.

### Pasos para crear un PR

1. **Ve a GitHub**
   - Abre: https://github.com/nicole1405/MarketplaceUFG

2. **Busca el mensaje de comparación**
   - Después de hacer `push`, Git normalmente muestra un enlace
   - O ve a la pestaña "Pull requests" → "New pull request"

3. **Selecciona las ramas**
   ```
   base: main  ← (hacia dónde va)
   compare: feat/tu-nombre-de-rama  ← (de dónde viene)
   ```

4. **Llena el formulario**

   ```markdown
   ## ¿Qué hace este cambio?
   Explica brevemente qué agregaste o corregiste
   
   ## ¿Por qué es necesario?
   Explica el problema que resuelve
   
   ## Cómo probarlo
   - Paso 1: Abrir la aplicación
   - Paso 2: Ir a...
   - Paso 3: Verificar que...
   
   ## Capturas de pantalla (si aplica)
   [Agrega imágenes si hay cambios visuales]
   
   ## Checklist
   - [ ] Probé los cambios localmente
   - [ ] No hay errores en la consola
   - [ ] Los estilos se ven bien
   ```

5. **Crea el PR**
   - Click en "Create pull request"
   - Espera la revisión de alguien del equipo

### Si no sabes hacer un PR

**No te preocupes.** Simplemente avisa al grupo:

> "Hola, ya subí mis cambios a la rama `feat/nombre-del-cambio`, ¿alguien puede ayudarme a crear el Pull Request?"

Alguien del equipo lo hará por ti. **Es mejor preguntar que hacerlo mal.**

---

## ✅ Buenas Prácticas

### Antes de commitear

```bash
# 1. Revisa tus cambios
git diff

# 2. Prueba que todo funciona
#    - Abre la app en el navegador
#    - Prueba las funcionalidades que cambiaste
#    - Revisa la consola del navegador (F12)

# 3. Verifica que no hay errores
#    - No debe haber errores en la consola
#    - Los estilos deben verse bien
```

### Tamaño de los commits

```
✅ BUENO: Commits pequeños y frecuentes
┌─────────────────────────────────────┐
│ feat: agregar input de búsqueda     │  ← Commit 1
│ feat: agregar filtro por categoría  │  ← Commit 2
│ style: ajustar espaciado de cards   │  ← Commit 3
│ fix: corregir alineación del footer │  ← Commit 4
└─────────────────────────────────────┘

❌ MALO: Un commit gigante
┌─────────────────────────────────────┐
│ cambios varios                      │  ← Commit único
│ - agregué búsqueda                  │
│ - agregué filtros                   │
│ - arreglé estilos                   │
│ - corregí footer                    │
│ - agregué imagenes                  │
│ - cambié colores                    │
└─────────────────────────────────────┘
```

### Mensajes descriptivos

```
✅ BUENO: El mensaje describe QUÉ y POR QUÉ
┌─────────────────────────────────────────────────────┐
│ feat: agregar modal de confirmación al eliminar     │
│                                                     │
│ Previene eliminaciones accidentales de productos.   │
│ El usuario debe confirmar antes de eliminar.        │
└─────────────────────────────────────────────────────┘

❌ MALO: Mensajes sin información útil
┌─────────────────────────────────────────────────────┐
│ fix                                                  │
│ update                                               │
│ cambios                                              │
│ listo                                                │
│ ya quedó                                             │
└─────────────────────────────────────────────────────┘
```

---

## ❌ Errores Comunes

### 1. Trabajar directamente en main

```bash
# ❌ MALO
git checkout main
# ... hacer cambios ...
git add .
git commit -m "mis cambios"
git push origin main  # ¡NO HACER ESTO!
```

```bash
# ✅ CORRECTO
git checkout -b feat/mis-cambios
# ... hacer cambios ...
git add .
git commit -m "feat: descripción del cambio"
git push -u origin feat/mis-cambios
# Luego crear PR
```

### 2. Commits gigantes con mensajes vagos

```bash
# ❌ MALO
git commit -m "update"
git commit -m "cambios"
git commit -m "listo"
```

```bash
# ✅ CORRECTO
git commit -m "feat: agregar formulario de contacto en perfil"
git commit -m "fix: corregir validación de contraseña"
git commit -m "style: ajustar márgenes de tarjetas"
```

### 3. Hacer push sin hacer pull primero

```bash
# ❌ Puede causar conflictos
git push origin main

# ✅ Primero actualiza
git pull origin main
# ... resolver conflictos si los hay ...
git push origin main
```

### 4. No verificar antes de commitear

```bash
# ❌ Commitear sin revisar
git add .
git commit -m "cambios"

# ✅ Siempre revisa primero
git status          # ¿Qué archivos cambiaron?
git diff            # ¿Qué líneas cambiaron?
git diff --stat     # Resumen de cambios
```

---

## 🆘 ¿Necesitas Ayuda?

### Si no sabes hacer un commit

Pregunta al grupo:
> "¿Cómo hago un commit? Modifiqué el archivo X pero no sé cómo subirlo"

### Si no sabes hacer un PR

Pregunta al grupo:
> "Ya subí mis cambios a la rama Y, ¿alguien me ayuda a hacer el Pull Request?"

### Si tienes conflictos

Pregunta al grupo:
> "Me aparece un error de merge conflict, ¿qué hago?"

### Si rompiste algo

No te preocupes, Git tiene solución para todo:
> "Creo que cometí un error, ¿alguien me puede ayudar a arreglarlo?"

**Nunca te quedes callado.** Es mejor preguntar y aprender que romper el proyecto.

---

## 📝 Resumen Rápido

```bash
# 1. Clonar (primera vez)
git clone https://github.com/nicole1405/MarketplaceUFG.git
cd MarketplaceUFG

# 2. Crear rama
git checkout -b feat/tu-cambio

# 3. Trabajar y guardar cambios
git add .
git commit -m "feat: descripción clara del cambio"

# 4. Subir rama
git push -u origin feat/tu-cambio

# 5. Crear PR en GitHub
# Ir a https://github.com/nicole1405/MarketplaceUFG
# Click en "Pull requests" → "New pull request"
```

---

## 🎯 Checklist antes de Crear el PR

- [ ] ¿Trabajé en una rama aparte de `main`?
- [ ] ¿Los commits son pequeños y específicos?
- [ ] ¿Los mensajes de commit son descriptivos?
- [ ] ¿Probé los cambios localmente?
- [ ] ¿No hay errores en la consola?
- [ ] ¿Los estilos se ven correctos?
- [ ] ¿El PR tiene una descripción clara?

---

> **Recuerda:** El trabajo en equipo requiere comunicación. Si algo no entiendes, pregunta. Si cometes un error, avisa. El objetivo es que todos aprendamos y el proyecto salga adelante. 🚀

