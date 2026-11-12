# Finder — instrucciones para agentes de IA

Este archivo es la **fuente única de reglas** para cualquier IA que trabaje en este repositorio:
Claude (Claude Code), ChatGPT (Codex), Gemini (Gemini CLI / Code Assist), Cursor, GitHub Copilot u otra.
Todas deben comportarse igual. Si algo de lo que te pide la persona choca con este archivo, **manda
este archivo**: explícaselo con amabilidad y propón la alternativa correcta.

**Contexto del equipo:** el lead (@aizetachan) programa; el resto son diseñadores que nunca han
programado y trabajan contigo. Explica lo que haces en español y sin jerga, haz cambios pequeños,
y si algo no está claro pregunta antes de inventar.

## Cómo llega este archivo a cada IA

| IA | Cómo lo carga |
|---|---|
| **Claude Code** | Lee `CLAUDE.md`, que importa este archivo. Además, `.claude/settings.json` bloquea editar la zona protegida. |
| **ChatGPT · Codex** (CLI, extensión o nube) | Lee `AGENTS.md` de forma nativa. |
| **Gemini CLI · Gemini Code Assist** | Lee `GEMINI.md`, que importa este archivo. |
| **Cursor · GitHub Copilot** | Leen `AGENTS.md`; Copilot además `.github/copilot-instructions.md`, que apunta aquí. |
| **Cualquier chat sin acceso al repositorio** (ChatGPT, Gemini o Claude en el navegador) | No puede leer archivos por sí solo. La persona debe darle este archivo (pegado, adjunto o por enlace). Ver "Si NO tienes acceso al repositorio". |

Los archivos `CLAUDE.md`, `GEMINI.md` y `.github/copilot-instructions.md` **no contienen reglas**:
solo apuntan aquí. Las reglas se cambian únicamente en este archivo (y solo las cambia el lead).

## Primeros pasos: qué hacer al empezar una sesión

Antes de tocar nada, **ponte en contexto leyendo, en este orden**:

1. Este archivo entero.
2. `docs/PRODUCTO.md` — qué se construye, pantallas, modelo de datos.
3. `apps/web/src/features/example/README.md` y los archivos de esa carpeta — el patrón a copiar.
4. `apps/web/src/services/types.ts` — qué operaciones de datos existen.
5. La carpeta de `features/` en la que va a trabajar la persona (pregúntale cuál si no lo ha dicho).
6. Si la tarea lo requiere: `docs/ENTORNOS.md` (datos de ejemplo vs. reales) y `docs/DECISIONES.md`.

Después, **antes de escribir código**, dile a la persona en pocas líneas: qué has entendido de la
tarea, qué archivos vas a tocar y cuál es el primer paso pequeño que propones. Espera su visto bueno.

## Cómo trabajar con la persona

- **En español y sin jerga.** Si usas un término técnico, explícalo en una frase.
- **Pasos pequeños.** Un cambio cada vez; que la persona lo vea en el navegador (`pnpm dev`) antes de seguir.
- **Di siempre qué archivos has tocado y por qué**, al terminar cada paso.
- **Pregunta antes de inventar.** Si falta una decisión de diseño o de producto, es de la persona o del equipo, no tuya.
- **No des una tarea por terminada sin que `pnpm check` pase.** Si falla, arréglalo tú; nunca desactivando la regla.
- **Commits y push los hace la persona** con GitHub Desktop (así todos trabajamos igual). No hagas
  `git commit`, `git push` ni abras PR salvo que te lo pida expresamente. Sí puedes proponerle la
  frase del commit (en español, empezando por un verbo: "Añado…", "Corrijo…").
- **Nunca trabajes en `main`.** Si la persona está en `main`, avísale para que cree su rama
  `feature/nombre-corto` antes de cambiar nada.

### Si NO tienes acceso al repositorio (chat en el navegador)

- No supongas el contenido de ningún archivo: **pide a la persona que te lo pegue** o léelo por su
  dirección pública, `https://raw.githubusercontent.com/aizetachan/finder-objetos-perdidos/main/` + la ruta del archivo.
- Devuelve **archivos completos**, indicando la ruta exacta donde va cada uno, para que la persona los copie sin dudas.
- Recuérdale que ejecute `pnpm check` y te pegue el resultado si falla.
- Todas las reglas de este archivo se aplican igual.

## Qué es

Web de objetos perdidos: quien encuentra algo lo publica; quien lo perdió lo busca y lo reclama.
Definición completa en `docs/PRODUCTO.md`. Decisiones y pendientes en `docs/DECISIONES.md`.
**Fase actual: fase 1 — solo frontend, con datos de ejemplo.** Las funcionalidades de
`docs/PRODUCTO.md` son una propuesta de partida; el reparto lo decide el equipo.

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
docs/                 documentación del equipo (se publica en GitHub Pages)
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
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.claude/`
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

## Prompt de inicio para el equipo

En `docs/PROMPT-INICIO.md` está el texto que cada persona copia y le da a su IA al empezar, para
que todas las IAs arranquen igual. Si la persona no te lo ha dado, sigue igualmente "Primeros pasos".
