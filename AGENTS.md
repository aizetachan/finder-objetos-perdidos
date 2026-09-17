# Finder — instrucciones para agentes de IA

Este archivo es la **fuente única de reglas** para cualquier IA que trabaje en este repositorio
(Claude Code, Cursor, Copilot, Codex, Gemini…). `CLAUDE.md` solo importa este archivo.

**Contexto del equipo:** el lead (@aizetachan) programa; el resto son diseñadores que nunca han
programado y trabajan contigo. Explica lo que haces en español y sin jerga, haz cambios pequeños,
y si algo no está claro pregunta antes de inventar.

## Qué es

Web de objetos perdidos: quien encuentra algo lo publica; quien lo perdió lo busca y lo reclama.
Definición completa en `docs/PRODUCTO.md`. Decisiones y pendientes en `docs/DECISIONES.md`.
**Fase actual: fase 1 — solo frontend, con datos de ejemplo.**

## Stack (decidido, no se cambia)

React 19 · TypeScript · Vite · Tailwind v4 · shadcn/ui (estilo Nova, Radix) · React Router ·
TanStack Query · react-hook-form + zod · sonner · Firebase (Hosting, Firestore, Auth) · pnpm workspaces.

## Comandos

```bash
pnpm install   # instalar dependencias
pnpm dev       # arrancar la web en http://localhost:5173
pnpm check     # lint + tipos + build. OBLIGATORIO que pase antes de dar una tarea por terminada.
```

## Estructura

```
apps/web/src/
  components/ui/      componentes de shadcn/ui (generados; no se editan)
  components/layout/  cabecera, pie, estructura común
  components/         composiciones propias hechas SOLO con piezas de ui/
  features/<nombre>/  una carpeta por funcionalidad: pantallas + hooks + piezas propias
  services/           acceso a datos: types.ts (contrato), mock/, firebase/
  routes/             paths.ts (URLs) e index.tsx (mapa de pantallas)
  hooks/ lib/         compartidos
  index.css           EL TEMA (variables CSS)
packages/shared/src/  tipos (types/, un archivo por colección), categories.ts, seed/ (datos de ejemplo)
```

`features/example/` es **la referencia**: antes de crear algo, lee su `README.md` y copia su patrón.

## Reglas obligatorias

1. **Solo shadcn/ui.** Las pantallas se construyen con `components/ui/`. No crees componentes
   visuales desde cero ni instales otras librerías de UI. Si falta un componente de shadcn, no lo
   añadas tú: díselo a la persona para que lo pida al lead.
2. **Solo colores y estilos del tema.** Usa las clases semánticas (`bg-primary`, `text-muted-foreground`,
   `border`, `rounded-lg`…). Prohibido: colores a mano (`#fff`, `rgb()`, `bg-red-500`, `text-[#123456]`),
   fuentes nuevas, y editar `index.css`. Habrá un rediseño global: debe bastar con cambiar el tema.
3. **Los datos pasan por `services`.** Las pantallas usan hooks de su feature que llaman a
   `services.*` (`import { services } from '@/services'`). Nunca importes `firebase/*`,
   `@/lib/firebase`, `@/services/mock` ni `@/services/firebase` fuera de `services/` (el lint lo bloquea).
4. **Operación de datos nueva = 3 sitios:** `services/types.ts` → `services/mock/index.ts` →
   `services/firebase/index.ts`. Si no sabes escribir la de Firebase, implementa la de mock,
   deja la de Firebase lanzando `new Error('Pendiente de implementar')` y **dilo en la PR**.
   Tipos nuevos en `packages/shared/src/types/`; sus datos de ejemplo en `seed/seed.ts`.
5. **Toda pantalla que pide datos contempla 4 estados:** cargando (Skeleton), error (Alert con
   reintentar), vacío (Empty) y con datos.
6. **Formularios:** react-hook-form + zod + `Field`, con mensajes de error en español.
7. **Cada persona trabaja en su carpeta de `features/`.** No toques las features de otros.
   Si necesitas cambiar algo compartido (`components/`, `services/`, `routes/`, `packages/shared`),
   haz el cambio mínimo y explícalo en la PR.
8. **Idioma:** interfaz, documentación, comentarios y mensajes de commit en español. Código
   (archivos, variables, tipos, campos) en inglés. Archivos en `kebab-case`, componentes en `PascalCase`.
9. **Rutas:** las URLs solo se escriben en `routes/paths.ts`. Para enlazar se usa `paths.*`.
   Pantalla nueva: `paths.ts` → página en su feature → `routes/index.tsx` (con `<RequireAuth>` si necesita cuenta).

## 🚫 Archivos protegidos — NO TOCAR

No modifiques, crees ni borres nada de esto, aunque la tarea parezca pedirlo:

- `.github/` **(workflows, CODEOWNERS, plantillas)**
- `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`, `functions/`
- `AGENTS.md`, `CLAUDE.md`, `.claude/`
- `pnpm-workspace.yaml`, `pnpm-lock.yaml` a mano, y las dependencias de cualquier `package.json`
  (no instales paquetes)
- `apps/web/src/components/ui/`, `apps/web/src/index.css`, `apps/web/components.json`
- configuración de herramientas: `vite.config.ts`, `tsconfig*.json`, `.oxlintrc.json`

**Si la tarea necesita cambiar algo de esta lista: PARA.** No lo hagas. Explica a la persona qué
haría falta cambiar y por qué, y dile que **avise al lead (@aizetachan)** abriendo una issue con la
plantilla "Cambio en zona protegida" o mencionándolo en su PR. El lead decide y hace el cambio.

## Nunca

- `firebase deploy` ni ningún comando que toque el proyecto real de Firebase. Despliega GitHub, solo.
- Leer, crear o subir archivos `.env` ni credenciales.
- `git push` a `main`, `--force`, ni saltarse comprobaciones (`--no-verify`).
- Desactivar reglas del lint o errores de TypeScript (`// oxlint-disable`, `@ts-ignore`, `any`) para que "pase".

## Flujo de trabajo (detalle en `docs/FLUJO-DE-TRABAJO.md`)

Actualizar `main` → rama `feature/nombre-corto` → commits pequeños en español → `pnpm check` →
PR con la plantilla → revisar en el enlace de preview → aprueba el lead → merge. Ramas de 2-3 días como máximo.
