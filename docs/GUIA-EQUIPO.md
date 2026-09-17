---
title: Guía del equipo
nav_order: 2
---

# Guía del equipo

Para quien nunca ha programado. Sigue los pasos en orden y, si algo no sale como dice aquí, para y
pregunta: es más rápido que intentar arreglarlo a ciegas.

**Tiempo aproximado:** 45 minutos la primera vez.

---

## 1. Qué vamos a usar

| Herramienta | Para qué sirve |
|---|---|
| **GitHub** | Donde vive el proyecto en internet. Guarda todas las versiones y quién cambió qué |
| **GitHub Desktop** | Programa para traer el proyecto a tu ordenador y subir tus cambios, con botones |
| **VS Code** | El editor donde se ve y se cambia el proyecto |
| **Node y pnpm** | Lo que hace que el proyecto funcione en tu ordenador. Se instalan una vez y te olvidas |
| **Tu asistente de IA** | Claude Code u otro. Escribe el código contigo. Las reglas que sigue están en `AGENTS.md` |

Solo usaremos **tres comandos** escritos a mano:

| Comando | Cuándo |
|---|---|
| `pnpm install` | La primera vez, y cuando alguien avise de que han cambiado las dependencias |
| `pnpm dev` | Cada vez que quieras ver la web en tu ordenador |
| `pnpm check` | Antes de pedir que revisen tu trabajo |

---

## 2. Instalación (una sola vez)

### 2.1 Cuenta de GitHub

1. Crea una cuenta en [github.com](https://github.com) si no tienes.
2. Dile tu nombre de usuario al lead. Te llegará una invitación por email: **acéptala**.

### 2.2 Programas

Instala estos tres, con las opciones que vienen por defecto:

1. **GitHub Desktop** — [desktop.github.com](https://desktop.github.com). Al abrirlo, inicia sesión con tu cuenta de GitHub.
2. **VS Code** — [code.visualstudio.com](https://code.visualstudio.com)
3. **Node** — [nodejs.org](https://nodejs.org). Descarga la versión **LTS** (la recomendada).

### 2.3 pnpm

1. Abre VS Code.
2. Menú **Terminal → New Terminal**. Se abre un panel abajo: eso es la terminal.
3. Escribe esto y pulsa Intro:

   ```
   npm install -g pnpm
   ```

4. Para comprobar que ha ido bien, escribe `pnpm -v`. Debe salir un número (por ejemplo `11.22.0`).

> **En Mac**, si sale un error de permisos (`EACCES`), escribe `sudo npm install -g pnpm` y pon la
> contraseña de tu ordenador (no se ve mientras la escribes; es normal).
>
> **En Windows**, si dice que `pnpm` "no se reconoce", cierra VS Code del todo y vuelve a abrirlo.

---

## 3. Traer el proyecto a tu ordenador

1. Abre **GitHub Desktop**.
2. **File → Clone repository**. En la lista, elige `aizetachan/finder-objetos-perdidos`.
3. Elige una carpeta fácil de encontrar (por ejemplo, `Documentos/Proyectos`) y pulsa **Clone**.
4. Cuando termine, pulsa **Open in Visual Studio Code**.
5. VS Code preguntará si confías en los autores: **Sí**. Si ofrece instalar las extensiones recomendadas: **Instalar**.

---

## 4. Arrancar el proyecto

En la terminal de VS Code (Terminal → New Terminal):

```
pnpm install
```

Tarda uno o dos minutos. Cuando termine:

```
pnpm dev
```

Aparecerá una dirección: **http://localhost:5173**. Ábrela en el navegador. **Esa es la web de
Finder funcionando en tu ordenador.**

- Mientras `pnpm dev` esté en marcha, cada cambio que guardes se ve al momento en el navegador.
- Para pararlo: haz clic en la terminal y pulsa `Ctrl + C`.
- Cada día que vayas a trabajar: abrir VS Code → `pnpm dev`.

### Qué estás viendo

La web funciona con **datos de ejemplo** que se guardan en tu navegador. Puedes publicar objetos,
reclamar, y cambiar de persona desde el círculo con iniciales de arriba a la derecha ("Entrar como…").
**No puedes romper nada:** "Restaurar datos de ejemplo" lo deja todo como al principio.

Dos páginas que te van a servir mucho:

- **/guia-de-estilos** — todos los componentes y colores que puedes usar.
- **/ejemplo** — una pantalla completa hecha "como hay que hacerlas". Es el modelo a copiar.

---

## 5. Cinco palabras que vas a oír todo el rato

**Repositorio (repo).** La carpeta del proyecto, con toda su historia. Hay una copia en GitHub (la
oficial) y una en tu ordenador.

**Rama (branch).** Una copia paralela del proyecto donde trabajas sin molestar a nadie. La rama
oficial se llama `main` y **nadie trabaja directamente en ella**. Tú creas tu rama, haces tus
cambios ahí y, cuando están bien, se juntan con `main`.

**Commit.** Un "guardar" con nombre. Cada commit es una foto del proyecto con una frase que dice qué
has cambiado ("Añado el filtro por ciudad"). Muchos commits pequeños son mejor que uno enorme.

**Push.** Subir tus commits a GitHub. Hasta que no haces push, tus cambios solo están en tu ordenador.

**Pull request (PR).** Pedir que tu rama se junte con `main`. Alguien la revisa, se comenta y,
cuando está aprobada, se fusiona (**merge**). Al abrir una PR pasan dos cosas solas:

- unas **comprobaciones** automáticas (✅ o ❌), y
- aparece un comentario con un **enlace de preview**: tu versión de la web publicada en internet,
  para que cualquiera la pruebe sin instalar nada.

El día a día, paso a paso, está en [Flujo de trabajo](FLUJO-DE-TRABAJO).

---

## 6. Trabajar con tu asistente de IA

- La IA ya sabe cómo se trabaja aquí: lee el archivo `AGENTS.md` del proyecto. No hace falta que se lo expliques.
- **Pídele cosas pequeñas y concretas**, de una en una, y mira el resultado en el navegador antes de pedir la siguiente.
- Si la IA te dice que **no puede tocar algo y que avises al lead**, no insistas ni busques otro camino: es la zona protegida. Abre una issue "Cambio en zona protegida" y pega lo que te ha dicho.
- Antes de subir tu trabajo, pídele: *"ejecuta pnpm check y arregla lo que falle"*.

Peticiones que funcionan bien:

> "Voy a trabajar en la funcionalidad de publicar objeto (`features/publish-item`). Lee `features/example/README.md` y explícame en pocas palabras cómo está hecha la pantalla de ejemplo."

> "En `features/publish-item`, sustituye la pantalla provisional por un formulario para publicar un objeto, siguiendo el patrón de `features/example/quick-publish-dialog.tsx`. Campos: los de `NewItemInput`."

> "Esta pantalla no contempla el estado de error. Añádelo como en `features/example/example-page.tsx`."

---

## 7. Las cinco reglas de oro

1. **Solo componentes de shadcn/ui.** Lo que hay se ve en `/guia-de-estilos`. Si falta algo, se pide.
2. **Nada de colores a mano.** Solo los del tema. Así el rediseño futuro será cambiar un archivo.
3. **Los datos pasan por `services`.** Las pantallas no hablan con Firebase.
4. **Cada uno en su carpeta de `features/`.**
5. **La zona protegida no se toca** (workflows, Firebase, `AGENTS.md`, `components/ui/`, el tema, las dependencias).

---

## 8. Si algo va mal

| Qué pasa | Qué hacer |
|---|---|
| `pnpm` "no se reconoce" / "command not found" | Cierra VS Code del todo y ábrelo otra vez. Si sigue, repite el paso 2.3 |
| Al hacer `pnpm dev` dice que el puerto está ocupado | Ya tienes otro `pnpm dev` abierto. Usa la dirección nueva que te muestra, o cierra las otras terminales |
| La web se queda en blanco o salen errores raros después de actualizar `main` | Para `pnpm dev` (`Ctrl + C`), ejecuta `pnpm install` y vuelve a `pnpm dev` |
| He liado los datos de ejemplo | Menú de cuenta (arriba a la derecha) → "Restaurar datos de ejemplo" |
| `pnpm check` falla | Copia el error y pásaselo a tu IA: "pnpm check falla con esto, arréglalo sin desactivar reglas" |
| Cualquier otra cosa | Pregunta en [Discussions](https://github.com/aizetachan/finder-objetos-perdidos/discussions), con una captura del error |

Más situaciones (conflictos, rama equivocada…) en [Flujo de trabajo](FLUJO-DE-TRABAJO#qué-hago-si).
