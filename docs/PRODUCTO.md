---
title: Producto
nav_order: 4
---

# Finder — Definición del producto

> **Estado: punto de partida aprobado (2026-09-17).** Es un esqueleto: cada persona lo irá ampliando en su rama a medida que defina su funcionalidad. Lo marcado con ❓ son decisiones abiertas que se tomarán sobre la marcha.
> De este documento salen los tipos de datos, los datos de ejemplo y el reparto de trabajo. Si algo cambia aquí, se cambia aquí primero y luego en el código.

## 1. Qué es Finder

Finder es una web para que los objetos perdidos vuelvan a su dueño. Funciona como un buscador tipo tienda online:

1. **Alguien encuentra un objeto** y lo publica (foto, descripción, dónde y cuándo lo encontró).
2. **Alguien que ha perdido algo** entra, busca y filtra hasta dar con su objeto.
3. **Lo reclama** demostrando que es suyo.
4. Quien lo publicó **acepta la reclamación** y se ponen en contacto para devolverlo.

Más adelante (no en la fase 1) también se podrán publicar avisos de "he perdido X". El modelo de datos ya está preparado para ello.

## 2. La regla de oro del producto: detalles ocultos

Si la ficha pública lo cuenta todo, cualquiera puede decir "es mío". Por eso cada objeto tiene dos partes:

- **Parte pública:** lo que ve todo el mundo. Suficiente para reconocerlo ("cartera marrón de piel, encontrada en el parque del Retiro").
- **Detalles ocultos:** solo los ve quien lo publicó ("dentro hay un carnet de biblioteca a nombre de M. y una foto de un perro"). Sirven para comprobar que quien reclama es el dueño de verdad.

Quien reclama tiene que describir algo que **no** aparece en la ficha pública. Quien publicó compara y decide.

## 3. Quién usa Finder

| Tipo | Qué puede hacer |
|---|---|
| Visitante (sin cuenta) | Buscar y ver fichas públicas |
| Usuario con cuenta | Todo lo anterior + publicar objetos, reclamar, gestionar sus publicaciones y reclamaciones |

❓ En la fase 1 no hay administradores ni moderación.

## 4. Funcionalidades de la fase 1 y reparto

Una persona por funcionalidad. Cada una vive en su carpeta dentro de `apps/web/src/features/`, así nadie pisa el trabajo de otro.

| # | Funcionalidad | Carpeta | Qué incluye | Responsable |
|---|---|---|---|---|
| 1 | Buscador | `features/search/` | Portada, buscador por texto, filtros (categoría, ciudad, fecha), listado de resultados en tarjetas, estado vacío | _por asignar_ |
| 2 | Ficha y reclamación | `features/item-detail/` | Ficha pública del objeto, galería de fotos, botón "Es mío", formulario de reclamación | _por asignar_ |
| 3 | Publicar objeto | `features/publish-item/` | Formulario para publicar (parte pública + detalles ocultos), subida de fotos, confirmación | _por asignar_ |
| 4 | Cuenta | `features/account/` | Registro, inicio de sesión, perfil, "Mis publicaciones" (con las reclamaciones recibidas: aceptar / rechazar), "Mis reclamaciones" | _por asignar_ |

La estructura general (cabecera, menú, pie, página 404) la deja hecha el lead en la base del proyecto.

## 5. Pantallas y rutas

| Ruta | Pantalla | Necesita cuenta | Funcionalidad |
|---|---|---|---|
| `/` | Portada con buscador y últimos objetos publicados | No | 1 |
| `/objetos` | Resultados con filtros | No | 1 |
| `/objetos/:id` | Ficha del objeto | No | 2 |
| `/objetos/:id/reclamar` | Formulario de reclamación | Sí | 2 |
| `/publicar` | Publicar un objeto encontrado | Sí | 3 |
| `/login` y `/registro` | Entrar / crear cuenta | No | 4 |
| `/perfil` | Mis datos | Sí | 4 |
| `/mis-publicaciones` | Mis objetos publicados y sus reclamaciones | Sí | 4 |
| `/mis-reclamaciones` | Lo que he reclamado y en qué estado está | Sí | 4 |

## 6. Modelo de datos

Los nombres de campos van en inglés (convención de código). Un archivo por colección en `packages/shared/src/types/`.

### `users` — perfil público de las personas con cuenta

El email **no** está aquí: es privado y vive solo en la cuenta (Firebase Auth).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | texto | El mismo que da Firebase Auth |
| `displayName` | texto | Nombre visible |
| `photoURL` | texto, opcional | |
| `city` | texto, opcional | |
| `createdAt` | fecha | |

### `items` — objetos publicados

| Campo | Tipo | Notas |
|---|---|---|
| `id` | texto | |
| `type` | `'found'` \| `'lost'` | En la fase 1 siempre `'found'` |
| `title` | texto | "Cartera marrón de piel" |
| `description` | texto | Descripción **pública** |
| `category` | una de la lista del punto 7 | |
| `photos` | lista de URLs | En la fase 1, imágenes de ejemplo |
| `city` | texto | Para filtrar |
| `locationText` | texto | Zona aproximada: "Parque del Retiro, cerca del estanque". ❓ Sin mapas en la fase 1 |
| `date` | fecha | Cuándo se encontró |
| `status` | `'published'` \| `'claimed'` \| `'returned'` | Publicado → con reclamación aceptada → devuelto |
| `createdBy`, `createdByName` | id y nombre de usuario | Quien lo publicó |
| `createdAt`, `updatedAt` | fecha | |

**Detalles ocultos:** van en un documento aparte, `items/{id}/private/details`, con un campo `hiddenDetails` (texto). Motivo técnico: las reglas de seguridad de Firestore protegen documentos enteros, no campos sueltos; si estuviera en el mismo documento, sería público.

### `claims` — reclamaciones

| Campo | Tipo | Notas |
|---|---|---|
| `id` | texto | |
| `itemId`, `itemTitle` | id y título del objeto | |
| `itemOwnerId` | id de usuario | Quien publicó el objeto (para que pueda ver sus reclamaciones) |
| `claimantId` | id de usuario | Quien reclama |
| `claimantContact` | nombre + email | Quien reclama comparte su contacto **desde el principio** con quien publicó |
| `ownerContact` | nombre + email, opcional | Quien publicó solo comparte el suyo **cuando acepta** |
| `proof` | texto | La descripción del detalle que demuestra que es suyo |
| `status` | `'pending'` \| `'accepted'` \| `'rejected'` | |
| `createdAt` | fecha | |
| `resolvedAt` | fecha, opcional | |

**Contacto:** quien reclama comparte su nombre y email con quien publicó desde el momento de reclamar. Quien publicó solo comparte los suyos al **aceptar**. Una reclamación solo la pueden ver esas dos personas. Una persona solo puede reclamar un mismo objeto una vez. No hay chat dentro de Finder en la fase 1.

Las fechas se guardan como texto en formato ISO (`2026-09-17T10:00:00.000Z`).

## 7. Categorías

❓ Lista fija en el código (no es una colección): Electrónica · Documentos · Llaves · Carteras y bolsos · Ropa y complementos · Joyas y relojes · Gafas · Juguetes · Deporte · Otros.

## 8. Fuera de la fase 1

- Avisos de "he perdido X" (`type: 'lost'`).
- Chat entre usuarios y notificaciones.
- Mapas y búsqueda por cercanía.
- Moderación, denuncias y administradores.
- Fotos reales subidas a la nube (requiere decidir almacenamiento; ver `DECISIONES.md`).
- Rediseño visual completo: se abrirá una issue específica. Hasta entonces, tema por defecto de shadcn/ui.

## 9. Idioma

Interfaz y documentación en español. Código (nombres de archivos, variables, campos) en inglés.
