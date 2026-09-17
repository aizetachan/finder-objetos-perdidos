---
title: Entornos
nav_order: 5
---

# Entornos: con qué datos trabaja la web

| | Datos de ejemplo | Firebase real |
|---|---|---|
| **Qué es** | Personas y objetos inventados, guardados en tu navegador | Los datos de verdad, de usuarios de verdad |
| **Quién lo usa** | **Todo el equipo, siempre.** Es la forma de trabajar | Nadie desde su ordenador. Solo la web publicada, cuando llegue la fase 2 |
| **Qué hay que instalar** | Node y pnpm | Nada |
| **Cómo se arranca** | `pnpm dev` | No se arranca: lo publica GitHub al hacer merge a `main` |
| **¿Puedo romper algo?** | No. "Restaurar datos de ejemplo" en el menú de cuenta lo deja como nuevo | Sí. Por eso nadie trabaja aquí |

## La idea clave: las pantallas no saben de dónde vienen los datos

Las pantallas piden los datos a `services` (`services.getItems()`, `services.createClaim()`…).
Detrás hay dos implementaciones que hacen exactamente lo mismo:

- `services/mock/` → datos de ejemplo (la que se usa ahora, en local, en las previews y en producción)
- `services/firebase/` → Firebase real (escrita, desactivada)

Un interruptor (`VITE_USE_MOCKS`) elige cuál se usa. **Las pantallas no cambian.** Por eso se puede
diseñar y construir toda la web con datos de ejemplo y conectar los datos reales después.

## Cuando llegue la información real (fase 2)

Para el equipo **no cambia nada**: se sigue trabajando con `pnpm dev` y datos de ejemplo, sin
instalar nada más. Los datos de ejemplo no son provisionales; son la forma permanente de trabajar
en pantallas.

Lo que cambia lo hace el lead, una vez:

1. **Probar antes de abrir.** `services/firebase/` y las reglas de seguridad (`firestore.rules`)
   están escritas pero sin probar. Antes de tener usuarios reales hay que comprobar que funcionan y,
   sobre todo, que las reglas no dejan ver a nadie lo que no debe (detalles ocultos, emails).
   La forma segura de probarlo es con los emuladores de Firebase (una copia de Firebase en el
   ordenador, que necesita Java): solo le hace falta a quien haga esa prueba, no al equipo.
2. Cambiar la variable `VITE_USE_MOCKS` del repositorio de GitHub a `false`.
3. La web publicada empieza a usar Firebase real. **Las previews de las PR siguen con datos de
   ejemplo**: una preview nunca toca datos reales.

Seguridad incorporada: aunque alguien ponga `VITE_USE_MOCKS=false` en su ordenador, en local la web
**nunca** se conecta al proyecto real (busca los emuladores y, si no están, simplemente no carga datos).

## La regla para que esto escale

> **Toda operación de datos nueva se escribe en los tres sitios:** el contrato (`services/types.ts`),
> los datos de ejemplo (`services/mock/`) y Firebase (`services/firebase/`).

TypeScript no deja compilar si falta alguna. Quien no sepa escribir la parte de Firebase escribe la
de ejemplo, deja la de Firebase marcada como pendiente (`throw new Error('Pendiente de implementar')`)
y lo dice en su PR; el lead la completa.

Lo mismo con los datos: si se añade un campo o una colección, se actualiza el tipo en
`packages/shared/src/types/`, los datos de ejemplo en `packages/shared/src/seed/seed.ts` y, si
afecta a permisos, se avisa al lead para que actualice `firestore.rules` (zona protegida).

## Previews y producción

- **Preview:** cada PR se publica sola en una dirección de prueba y el enlace aparece en un
  comentario de la PR. Siempre con datos de ejemplo. El enlace **vive mientras la PR esté abierta**
  y se borra al cerrarla o fusionarla.
- **Producción:** al hacer merge a `main`, GitHub publica la web. Nadie despliega a mano.
