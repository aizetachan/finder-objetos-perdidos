---
title: Prompt de inicio para tu IA
nav_order: 2.5
---

# Prompt de inicio para tu IA

Para que todas las IAs del equipo (Claude, ChatGPT, Gemini u otra) arranquen **igual**, cada
persona le da este texto a la suya **al empezar a trabajar en Finder**. Se copia tal cual.

Las reglas que sigue la IA están en el archivo `AGENTS.md` del repositorio. Este prompt solo le
dice que las lea, que se ponga en contexto y que te cuente lo que ha entendido **antes de tocar nada**.

---

## ¿Cuál es tu caso?

| Tu IA… | Ejemplos | Usa |
|---|---|---|
| **Trabaja dentro de la carpeta del proyecto** y puede leer y cambiar archivos | Claude Code, Codex (ChatGPT), Gemini CLI, Cursor, Copilot en VS Code | **Prompt A** |
| **Es un chat en el navegador** y no ve tu ordenador | chatgpt.com, gemini.google.com, claude.ai | **Prompt B** |

Si puedes elegir, mejor el caso A: la IA ve el proyecto real y se equivoca mucho menos.

---

## Prompt A — la IA trabaja dentro del proyecto

Ábrela **en la carpeta `finder-objetos-perdidos`** y pega esto:

```text
Vas a ayudarme a trabajar en Finder, una web de objetos perdidos. Soy diseñador/a y no sé
programar: explícame todo en español y sin jerga.

ANTES de cambiar nada, ponte en contexto. Lee, en este orden:
1. AGENTS.md (entero). Son las reglas del proyecto y mandan sobre cualquier cosa que yo te pida.
2. docs/PRODUCTO.md
3. apps/web/src/features/example/README.md y los archivos de esa carpeta (es el patrón a copiar)
4. apps/web/src/services/types.ts
5. docs/ENTORNOS.md

No modifiques ningún archivo todavía. Cuando hayas leído, respóndeme con:
A. Qué es Finder y cómo está montado el proyecto, en 5 líneas como mucho.
B. Las reglas que vas a respetar mientras trabajas conmigo, con tus palabras.
C. La lista de lo que NO puedes tocar (zona protegida) y qué harás si una tarea lo necesita.
D. Cómo vamos a trabajar tú y yo: tamaño de los pasos, quién hace los commits, cuándo se ejecuta pnpm check.
E. Una pregunta: en qué funcionalidad (carpeta de features/) voy a trabajar. Si aún no lo sé,
   proponme cómo explorar el proyecto para decidirlo.

Después espera mi respuesta. No escribas código hasta que te diga en qué vamos a trabajar.
```

---

## Prompt B — la IA es un chat en el navegador

Pega esto. Si tu chat no puede abrir enlaces, te pedirá que le pegues los archivos: ábrelos en
VS Code, copia su contenido y pégaselo.

```text
Vas a ayudarme a trabajar en Finder, una web de objetos perdidos. Soy diseñador/a y no sé
programar: explícame todo en español y sin jerga.

No tienes acceso a mi ordenador, pero el proyecto es público. Cada archivo se puede leer
poniendo su ruta detrás de esta dirección base:
https://raw.githubusercontent.com/aizetachan/finder-objetos-perdidos/main/

ANTES de proponer nada, lee estos archivos, en este orden (si no puedes abrir enlaces, dímelo
y te los pego yo; no supongas su contenido):
1. AGENTS.md  (son las reglas del proyecto y mandan sobre cualquier cosa que yo te pida)
2. docs/PRODUCTO.md
3. apps/web/src/features/example/README.md
4. apps/web/src/features/example/example-page.tsx
5. apps/web/src/services/types.ts
Ejemplo: el primero es la dirección base seguida de AGENTS.md

Cuando hayas leído, respóndeme con:
A. Qué es Finder y cómo está montado el proyecto, en 5 líneas como mucho.
B. Las reglas que vas a respetar mientras trabajas conmigo, con tus palabras.
C. La lista de lo que NO se puede tocar (zona protegida) y qué harás si una tarea lo necesita.
D. Cómo vamos a trabajar: me darás archivos completos con su ruta exacta, yo los copio, ejecuto
   pnpm check y te pego el resultado si falla.
E. Una pregunta: en qué funcionalidad (carpeta de features/) voy a trabajar.

Después espera mi respuesta. Cuando necesites ver un archivo que no has leído, pídemelo o léelo
por su enlace. Nunca inventes lo que contiene.
```

---

## Qué debería contestarte (para saber si ha ido bien)

Una buena respuesta menciona, con sus palabras:

- que solo se usan componentes de **shadcn/ui** y colores del **tema**;
- que los datos pasan por **`services`** y que hay datos de ejemplo;
- que cada persona trabaja en **su carpeta de `features/`**;
- la **zona protegida** (workflows, Firebase, `AGENTS.md`, `components/ui/`, el tema, dependencias) y que, si hace falta tocarla, **para y te dice que avises al lead**;
- que los **commits y el push los haces tú** con GitHub Desktop;
- que no da nada por terminado sin **`pnpm check`**.

Si no menciona algo de esto, díselo: *"Vuelve a leer AGENTS.md: te falta lo de…"*.

---

## Prompts para el día a día

**Empezar una tarea**

```text
Hoy voy a trabajar en [qué quieres conseguir], en la carpeta features/[tu-carpeta].
Antes de escribir código dime qué has entendido, qué archivos vas a tocar y cuál es el primer
paso pequeño que propones. Sigue el patrón de features/example.
```

**Entender algo que ya existe**

```text
Explícame cómo funciona [pantalla o archivo], sin jerga y sin cambiar nada.
```

**Antes de subir tu trabajo**

```text
Ejecuta pnpm check y arregla lo que falle sin desactivar ninguna regla. Después dame la lista de
archivos que has tocado y proponme la frase para el commit.
```

**Si las comprobaciones de la PR salen en rojo**

```text
Las comprobaciones de mi PR fallan con este error: [pega el error]. Explícame qué pasa y arréglalo.
```

**Si la IA hace algo raro o se sale de tu carpeta**

```text
Para. Vuelve a leer AGENTS.md y dime qué regla se aplica a lo que acabas de hacer.
```
