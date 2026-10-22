---
title: Producto
nav_order: 4
---

# Finder — Definición del producto

> **Estado: punto de partida aprobado (2026-09-17) · Actualizado con Donaciones (2026-10-22).** Es un documento vivo: cada persona lo irá ampliando en su rama a medida que defina su funcionalidad. Lo marcado con ❓ son decisiones abiertas que se tomarán sobre la marcha.
> De este documento salen los tipos de datos, los datos de ejemplo y el reparto de trabajo. Si algo cambia aquí, se cambia aquí primero y luego en el código.

## 1. Qué es Finder

Finder es una web comunitaria construida sobre dos pilares complementarios:

1. **Objetos perdidos y encontrados:** facilitar que las pertenencias extraviadas vuelvan a manos de su legítimo dueño.
2. **Donaciones solidarias:** dar una segunda vida útil y gratuita a objetos que sus propietarios ya no necesitan o a objetos encontrados que nadie ha reclamado tras un tiempo prudencial, fomentando la economía circular y la generosidad vecinal.

### ¿Cómo funciona la parte de objetos perdidos?
Funciona como un buscador tipo tienda online:
1. **Alguien encuentra un objeto** y lo publica (foto, descripción, dónde y cuándo lo encontró).
2. **Alguien que ha perdido algo** entra, busca y filtra hasta dar con su objeto.
3. **Lo reclama** demostrando que es suyo.
4. Quien lo publicó **acepta la reclamación** y se ponen en contacto para devolverlo.

Más adelante (no en la fase 1) también se podrán publicar avisos de "he perdido X". El modelo de datos ya está preparado para ello.

### ¿Cómo funciona la parte de donaciones?
Una persona puede regalar desinteresadamente un objeto propio que ya no utiliza, o bien, si un objeto encontrado cumple el periodo estipulado sin haber sido reclamado, la persona que lo encontró puede decidir voluntariamente ofrecerlo como donación (Finder nunca lo convierte de forma automática). Las personas interesadas solicitan el objeto explicando brevemente su motivo, y el donante elige a quién entregárselo.

**Regla fundamental:** Las donaciones en Finder son **siempre gratuitas**. Finder **no** es una plataforma de compraventa ni admite precios, pujas ni ningún tipo de transacción económica.

## 2. La regla de oro del producto: detalles ocultos

Si la ficha pública lo cuenta todo, cualquiera puede decir "es mío". Por eso cada objeto encontrado que busca a su dueño tiene dos partes:

- **Parte pública:** lo que ve todo el mundo. Suficiente para reconocerlo ("cartera marrón de piel, encontrada en el parque del Retiro").
- **Detalles ocultos:** solo los ve quien lo publicó ("dentro hay un carnet de biblioteca a nombre de M. y una foto de un perro"). Sirven para comprobar que quien reclama es el dueño de verdad.

Quien reclama tiene que describir algo que **no** aparece en la ficha pública. Quien publicó compara y decide.

> **Ámbito de aplicación:** Esta regla aplica estrictamente a los **objetos encontrados que buscan dueño**. En el caso de las **donaciones**, toda la información del objeto es 100% pública y transparente (fotos, descripción, estado) para que cualquier persona interesada pueda valorarlo y solicitarlo; no existen detalles ocultos en las donaciones.

## 3. Quién usa Finder

| Tipo | Qué puede hacer |
|---|---|
| Visitante (sin cuenta) | Buscar y ver fichas públicas de objetos perdidos; explorar el catálogo de donaciones y ver sus detalles. |
| Usuario con cuenta | Todo lo anterior + publicar objetos encontrados, publicar donaciones directas, reclamar objetos perdidos, solicitar donaciones disponibles y gestionar todas sus publicaciones, reclamaciones y solicitudes recibidas o enviadas. |

❓ En la fase 1 no hay administradores ni moderación.

## 4. Funcionalidades de la fase 1 y reparto

Una persona por funcionalidad. Cada una vive en su carpeta dentro de `apps/web/src/features/`, así nadie pisa el trabajo de otro.

| # | Funcionalidad | Carpeta | Qué incluye | Responsable |
|---|---|---|---|---|
| 1 | Buscador | `features/search/` | Portada, buscador por texto, filtros (categoría, ciudad, fecha), listado de resultados en tarjetas, estado vacío | _por asignar_ |
| 2 | Ficha y reclamación | `features/item-detail/` | Ficha pública del objeto, galería de fotos, botón "Es mío", formulario de reclamación | _por asignar_ |
| 3 | Publicar objeto | `features/publish-item/` | Formulario para publicar (parte pública + detalles ocultos), subida de fotos, confirmación | _por asignar_ |
| 4 | Cuenta | `features/account/` | Registro, inicio de sesión, perfil, "Mis publicaciones" (con las reclamaciones recibidas: aceptar / rechazar), "Mis reclamaciones" | _por asignar_ |
| 5 | Donaciones (Issue #23) | `features/donations/` | Catálogo diferenciado de donaciones, filtros por categoría y ciudad, ficha de donación, publicación de donación directa, solicitud con motivo explicativo, gestión de solicitudes y selección del donante | _por asignar_ |

La estructura general (cabecera, menú, pie, página 404) la deja hecha el lead en la base del proyecto.

## 5. Donaciones: concepto, reglas y experiencia

Donaciones es una funcionalidad diferenciada dentro de Finder que permite regalar y solicitar objetos de manera altruista.

### A. Los dos orígenes de una donación

1. **Donación directa:**
   Una persona publica directamente un objeto de su propiedad que ya no utiliza y que desea regalar a alguien de su comunidad.
   - *Ejemplo:* "Tengo una raqueta de tenis que ya no utilizo. No quiero venderla y prefiero regalársela a alguien."
   - Quien publica declara bajo su responsabilidad que el objeto es suyo o que está debidamente autorizado para donarlo.
   - Es siempre gratuita.

2. **Objeto encontrado que pasa a donación (decisión voluntaria):**
   Un objeto que fue encontrado y publicado originalmente en el buscador de objetos perdidos para localizar a su propietario puede, tras transcurrir un tiempo determinado sin ninguna reclamación legítima, convertirse en una donación disponible para la comunidad.
   - **Sin conversión automática:** Finder **nunca** convierte automáticamente un objeto encontrado en donación. El mero transcurso del tiempo solo hace que el objeto pase a ser **elegible para donar**, jamás provoca una conversión automática del sistema.
   - **Voluntariedad:** Una vez cumplidas las condiciones y el plazo fijado por el equipo, la persona que publicó/encontró el objeto puede **decidir voluntariamente** si desea ofrecerlo como donación o no.
   - Flujo de transición: `Encontrado` → `Buscando dueño` → `Elegible para donación (no reclamado)` → `Decisión voluntaria de donar` → `Disponible para donar` → `Donado`.
   - ❓ **Decisión abierta del equipo:** ¿Cuánto tiempo debe permanecer un objeto encontrado buscando a su propietario antes de ser elegible para que quien lo encontró pueda decidir ofrecerlo como donación?
   - ❓ **Decisión abierta del equipo:** ¿Qué categorías o tipos de objetos encontrados nunca podrán convertirse en donación? (Ejemplos evidentes a valorar y excluir: documentación personal, tarjetas bancarias o de transporte, llaves, dispositivos bloqueados con datos privados y objetos similares de carácter personal o sensible).

### B. Publicar una donación (Fase 1)

El formulario de publicación de donaciones captura la información necesaria para que la comunidad evalúe el objeto con claridad:
- **Fotografías:** imágenes claras del objeto real.
- **Título:** descriptivo y conciso (ej. "Raqueta de tenis junior Wilson").
- **Categoría:** una de las categorías oficiales de Finder.
- **Descripción:** detalles sobre el objeto, dimensiones, características y uso previo.
- **Estado físico del objeto:** clasificación declarativa de su conservación:
  - *Como nuevo* (impecable o con poquísimo uso).
  - *Buen estado* (usado pero bien cuidado).
  - *Usado pero funcional* (desgaste visible pero cumple perfectamente su función).
- **Ciudad:** municipio para filtrado geográfico.
- **Zona aproximada:** barrio o punto de referencia ("Cerca de la estación de tren").
- **Modalidad e indicaciones básicas de entrega:** notas sobre disponibilidad horaria o lugar aproximado de encuentro.

**Condiciones obligatorias en Fase 1:**
- **Entrega en persona:** En la fase 1 toda entrega se realiza de forma presencial y en mano, en lugares públicos y acordados entre ambas partes.
- **Gratuidad absoluta:** *"Las donaciones en Finder son siempre gratuitas."* No existe precio, coste de gestión ni compensación alguna.

### C. Descubrir donaciones

Donaciones cuenta con una **experiencia diferenciada** del buscador de objetos perdidos:
- Catálogo propio de donaciones disponibles.
- Exploración visual en cuadrícula de tarjetas con fotos y estado del objeto.
- Filtros específicos: por **categoría** y por **ciudad**.
- Acceso a la ficha detallada de cada donación.

*(Nota: En esta iteración de Fase 1 no se implementan rutas de código ni pantallas en React; se define aquí la experiencia conceptual).*

### D. Solicitar una donación

Cualquier persona con cuenta en Finder puede solicitar un objeto disponible:
- **Sin reserva automática:** La solicitud no bloquea ni reserva el objeto; pueden recibirse múltiples solicitudes simultáneas de distintas personas.
- **Motivación breve:** Al solicitarlo, la persona interesada puede explicar brevemente por qué le vendría bien o para qué lo necesita.
  - *Ejemplo:* "Estoy empezando clases con mi hija y nos vendría genial tener una segunda raqueta."
- **Criterio cerrado:** Finder **NO** utiliza el criterio de *"el primero que llega se lo queda"*. No hay adjudicación por velocidad ni orden de llegada.

### E. El donante elige a quién entrega el objeto (Decisión cerrada)

Esta es una regla de producto troncal y cerrada en Finder:
- **El donante tiene la potestad exclusiva de elegir:** Revisa las solicitudes recibidas, lee los motivos expuestos y selecciona a la persona que considera más adecuada.
- **Ciclo de estados del objeto donado:**
  `Disponible` (`available`) → `Reservado` (`reserved`) → `Donado` (`donated`).
- **Ciclo de estados de las solicitudes:**
  - `Pendiente` (`pending`) → `Aceptada` (`accepted`).
  - `Pendiente` (`pending`) → `No seleccionada` (`not_selected`).
- **Efecto de la selección:** Al aceptar una solicitud, el objeto pasa a estado *Reservado* y las solicitudes restantes pasan a estado *No seleccionada*.
- **Contacto y privacidad:**
  - Siguiendo los principios de privacidad de Finder, quien solicita comparte su nombre y email de contacto en el momento de emitir la solicitud.
  - El donante **solo** comparte su nombre y email de contacto cuando acepta la solicitud de la persona elegida.
  - Ambas partes reciben los datos de contacto mutuos para acordar la entrega presencial por su cuenta (por email o teléfono acordado).
  - No hay chat interno en Finder en la Fase 1.
  - Si por alguna razón la entrega no pudiera concretarse, el donante puede reabrir el objeto a *Disponible* y seleccionar otra solicitud.

## 6. Ciclos y flujos principales

### Flujo 1: Donación directa
```
Publicar donación → Seleccionar "Quiero donar algo" → Rellenar datos del objeto (fotos, estado, ciudad, entrega)
→ Publicar en catálogo → Recibir solicitudes motivadas → Donante revisa y elige persona
→ Objeto pasa a "Reservado" → Intercambio de contactos → Entrega presencial acordada → Objeto pasa a "Donado"
```

### Flujo 2: Persona que solicita una donación
```
Entrar a Donaciones → Explorar y filtrar catálogo (categoría, ciudad) → Abrir ficha del objeto
→ Pulsar "Solicitar donación" → Explicar brevemente por qué le interesa → Enviar solicitud
→ Esperar decisión del donante → [Si es aceptado: recibe contacto del donante → Acuerdan entrega presencial → Recibe el objeto]
                                [Si no es seleccionado: notificación de solicitud no seleccionada]
```

### Flujo 3: Objeto encontrado que pasa a donación (decisión voluntaria)
```
Objeto encontrado publicado → Transcurre el periodo obligatorio buscando dueño sin reclamaciones legítimas
→ El objeto pasa a ser elegible para donación (Finder nunca lo convierte de forma automática)
→ La persona que lo publicó/encontró decide voluntariamente ofrecerlo como donación
→ Entra en el catálogo de Donaciones (estado "Disponible") con fotos y descripción públicas
```

## 7. Pantallas y rutas

> **Nota:** Las rutas señaladas con `*` corresponden a la futura funcionalidad de Donaciones. En esta iteración de Fase 1 **no se construye código ni rutas**, solo se define su mapa conceptual.

| Ruta | Pantalla | Necesita cuenta | Funcionalidad |
|---|---|---|---|
| `/` | Portada con buscador y últimos objetos publicados | No | 1 |
| `/objetos` | Resultados de objetos perdidos con filtros | No | 1 |
| `/objetos/:id` | Ficha del objeto perdido | No | 2 |
| `/objetos/:id/reclamar` | Formulario de reclamación | Sí | 2 |
| `/publicar` | Publicar un objeto encontrado | Sí | 3 |
| `/donaciones`* | Catálogo de objetos disponibles para donar (filtros por categoría y ciudad) | No | 5 |
| `/donaciones/:id`* | Ficha pública de la donación con botón "Solicitar" | No | 5 |
| `/donaciones/:id/solicitar`* | Formulario de solicitud motivada | Sí | 5 |
| `/donar`* | Publicar una donación directa | Sí | 5 |
| `/login` y `/registro` | Entrar / crear cuenta | No | 4 |
| `/perfil` | Mis datos | Sí | 4 |
| `/mis-publicaciones` | Mis objetos publicados (perdidos y donaciones) y sus reclamaciones/solicitudes | Sí | 4 |
| `/mis-reclamaciones` | Lo que he reclamado y en qué estado está | Sí | 4 |
| `/mis-solicitudes`* | Donaciones que he solicitado y estado de la solicitud | Sí | 4 y 5 |

## 8. Modelo de datos

Los nombres de campos van en inglés (convención de código). Un archivo por colección en `packages/shared/src/types/`.

> **Propuesta de modelo conceptual para Donaciones:**
> Los campos y estados técnicos asociados a Donaciones en `items` (como `donationOrigin`, `condition`, `deliveryNotes`, y los estados `available`, `reserved`, `donated`) así como la entidad `donationRequests` descritos a continuación son una **propuesta de modelo conceptual** para orientar la futura implementación técnica. No constituyen una arquitectura técnica cerrada ni aprobada todavía por el equipo/Lead.

### `users` — perfil público de las personas con cuenta

El email **no** está aquí: es privado y vive solo en la cuenta (Firebase Auth).

| Campo | Tipo | Notas |
|---|---|---|
| `id` | texto | El mismo que da Firebase Auth |
| `displayName` | texto | Nombre visible |
| `photoURL` | texto, opcional | |
| `city` | texto, opcional | |
| `createdAt` | fecha | |

### `items` — objetos publicados (hallazgos y propuesta conceptual para donaciones)

| Campo | Tipo | Notas |
|---|---|---|
| `id` | texto | Identificador único |
| `type` | `'found'` \| `'lost'` \| `'donation'` | Tipo de publicación. En Fase 1 actual: `'found'`. Para donaciones se propone `'donation'` |
| `donationOrigin` | `'direct'` \| `'unclaimed_found'` \| opcional | *(Propuesta conceptual)* Origen de la donación (solo si `type === 'donation'`) |
| `title` | texto | "Raqueta de tenis junior Wilson" o "Cartera marrón de piel" |
| `description` | texto | Descripción **pública** |
| `category` | una de la lista de categorías | Categoría del objeto |
| `condition` | `'like_new'` \| `'good'` \| `'used_functional'` \| opcional | *(Propuesta conceptual)* Estado de conservación (solo donaciones: Como nuevo, Buen estado, Usado pero funcional) |
| `photos` | lista de URLs | Imágenes del objeto (en fase 1, de ejemplo) |
| `city` | texto | Ciudad para filtrado |
| `locationText` | texto | Zona o barrio aproximado. Sin mapas en fase 1 |
| `deliveryNotes` | texto, opcional | *(Propuesta conceptual)* Indicaciones y preferencias de entrega en persona |
| `date` | fecha | Cuándo se encontró (hallazgo) o cuándo se puso a disposición |
| `status` | `'published'` \| `'claimed'` \| `'returned'` \| `'available'` \| `'reserved'` \| `'donated'` | Hallazgos: `published` → `claimed` → `returned`. Donaciones (propuesta conceptual): `available` → `reserved` → `donated` |
| `createdBy`, `createdByName` | id y nombre de usuario | Quien lo publicó o donó |
| `createdAt`, `updatedAt` | fecha | Marcas de tiempo ISO |

**Detalles ocultos (solo para objetos encontrados `type === 'found'`):**
Van en el subdocumento privado `items/{id}/private/details`, con un campo `hiddenDetails` (texto). Motivo técnico: las reglas de seguridad de Firestore protegen documentos enteros; si estuviera en el mismo documento sería público. **En las donaciones no hay subdocumento de detalles ocultos.**

### `claims` — reclamaciones de objetos encontrados

| Campo | Tipo | Notas |
|---|---|---|
| `id` | texto | Identificador único |
| `itemId`, `itemTitle` | id y título del objeto | Referencia al objeto encontrado |
| `itemOwnerId` | id de usuario | Quien publicó el hallazgo |
| `claimantId` | id de usuario | Quien reclama |
| `claimantContact` | nombre + email | Quien reclama comparte su contacto **desde el principio** |
| `ownerContact` | nombre + email, opcional | Quien publicó solo comparte el suyo **cuando acepta** |
| `proof` | texto | La descripción del detalle oculto que demuestra propiedad |
| `status` | `'pending'` \| `'accepted'` \| `'rejected'` | Estado de la reclamación |
| `createdAt`, `resolvedAt` | fecha | Marcas de tiempo ISO |

### `donationRequests` — propuesta de solicitudes de donación (modelo conceptual)

> **Nota:** Esta entidad, sus campos y sus estados son una propuesta de modelo conceptual para orientar la futura implementación, no una arquitectura técnica cerrada o aprobada todavía.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | texto | Identificador único de la solicitud |
| `donationId`, `donationTitle` | id y título del objeto donado | Referencia a la donación (`items` con `type === 'donation'`) |
| `donorId` | id de usuario | Usuario que dona el objeto |
| `requesterId`, `requesterName` | id y nombre de usuario | Persona que solicita la donación |
| `message` | texto | Breve explicación motivada de por qué le vendría bien o para qué lo necesita |
| `requesterContact` | nombre + email | Quien solicita comparte su contacto con el donante al enviar la solicitud |
| `donorContact` | nombre + email, opcional | El donante solo comparte su contacto al **aceptar** la solicitud |
| `status` | `'pending'` \| `'accepted'` \| `'not_selected'` | Pendiente de revisión → Aceptada (elegida) o No seleccionada |
| `createdAt`, `resolvedAt` | fecha | Marcas de tiempo ISO |

**Contacto y privacidad en donaciones:** Quien solicita comparte su nombre y email desde el envío de la solicitud para que el donante pueda valorar con quién trata. El donante solo comparte sus datos cuando acepta una solicitud concreta. Una persona solo puede solicitar una misma donación una vez mientras esté disponible. Las solicitudes solo son visibles para el solicitante y para el donante. No hay chat dentro de Finder en la fase 1.

Las fechas se guardan siempre como texto en formato ISO (`2026-10-22T10:00:00.000Z`).

## 9. Categorías

Lista fija en el código (no es una colección):
Electrónica · Documentos · Llaves · Carteras y bolsos · Ropa y complementos · Joyas y relojes · Gafas · Juguetes · Deporte · Otros.

## 10. Fuera de la fase 1

Quedan **expresamente fuera del alcance de la fase 1**:

- **Compraventa y dinero:** Precios, cobros, pagos, comisiones, transferencias o pujas/subastas. Las donaciones son siempre 100% gratuitas.
- **Conversión automática:** Finder nunca convierte automáticamente un objeto encontrado en donación; el transcurso del tiempo solo confiere elegibilidad para que la persona que lo encontró decida voluntariamente ofrecerlo.
- **Logística y envíos integrados:** Integración de transportistas o paquetería. Las entregas se acuerdan y realizan exclusivamente en persona.
- **Chat y mensajería instantánea:** Sin comunicación en tiempo real dentro de la web; el acuerdo se realiza por correo electrónico o teléfono tras la aceptación.
- **Mapas y geolocalización avanzada:** Sin mapas interactivos ni cálculo de distancias por GPS.
- **Sistemas de reputación:** Ni valoraciones con estrellas, reseñas, puntuaciones ni recompensas ("gamificación").
- **Donaciones dinerarias:** No se gestionan donaciones económicas ni colectas de dinero.
- **Integraciones con entidades externas:** Sin convenios automáticos ni pasarelas con ONGs o instituciones.
- **Adjudicación automática:** Queda prohibida la adjudicación por velocidad o por orden de llegada ("el primero que llega se lo queda").
- **Avisos de pérdida:** Publicaciones de "he perdido X" (`type: 'lost'`).
- **Moderación activa y administradores:** Sin panel de control de administradores, gestión de denuncias ni filtrado preventivo en fase 1.
- **Fotos reales en la nube:** En fase 1 se opera con imágenes de ejemplo (los servicios de Storage en la nube se abordarán más adelante).

## 11. Decisiones abiertas del equipo

Aspectos señalados con ❓ pendientes de definición por el equipo específicos para Donaciones:

1. ❓ **Tiempo mínimo para que un objeto encontrado sea elegible para donación:** ¿Cuánto tiempo debe permanecer un objeto encontrado buscando a su propietario antes de ser elegible para que la persona que lo encontró pueda decidir voluntariamente ofrecerlo como donación?
2. ❓ **Categorías/tipos de objetos encontrados que no pueden donarse:** ¿Qué categorías o tipos específicos de objetos encontrados nunca podrán convertirse en donación? (Ejemplos a valorar y excluir: documentación personal, tarjetas bancarias o de transporte, llaves, dispositivos bloqueados con datos privados y objetos similares de carácter personal o sensible).

## 12. Idioma

Interfaz y documentación en español. Código (nombres de archivos, variables, campos) en inglés.
