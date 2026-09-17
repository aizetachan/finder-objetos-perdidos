---
title: Flujo de trabajo
nav_order: 3
---

# Flujo de trabajo

El ciclo es **siempre el mismo**. Si lo sigues, es casi imposible romper nada.

```
actualizar main → crear rama → trabajar → commits pequeños → push → abrir PR
→ revisar en la preview → aprueba el lead → merge → borrar rama
```

**Ramas cortas: 2-3 días como máximo.** Mejor tres PR pequeñas que una enorme: se revisan antes y
dan menos conflictos.

---

## Paso a paso (con GitHub Desktop)

### 1. Actualiza `main`

En GitHub Desktop: arriba, **Current Branch → main**. Luego **Fetch origin** y, si aparece, **Pull origin**.
Así empiezas desde la última versión de todos.

### 2. Crea tu rama

**Current Branch → New Branch**. Nombre: `feature/` + algo corto y en minúsculas con guiones.

- ✅ `feature/filtro-ciudad`, `feature/formulario-publicar`
- ❌ `cambios`, `Rama de Ana`, `feature/todo-el-buscador`

### 3. Trabaja

`pnpm dev`, y a construir (con tu IA) dentro de tu carpeta de `features/`. Mira siempre el resultado
en el navegador.

### 4. Commits pequeños

Cada vez que algo funcione, en GitHub Desktop: escribe abajo a la izquierda una frase que diga qué
has hecho (en español, empezando por un verbo: "Añado…", "Corrijo…", "Cambio…") y pulsa **Commit**.

### 5. Comprueba y sube

En la terminal: `pnpm check`. Si pasa, en GitHub Desktop: **Push origin** (la primera vez dirá *Publish branch*).

### 6. Abre la PR

GitHub Desktop te ofrece **Create Pull Request**: se abre el navegador con una plantilla.
Rellénala (qué has hecho, capturas, la lista de comprobación) y pulsa **Create pull request**.

### 7. Revisa tu preview

A los pocos minutos aparecen en la PR:

- **Comprobaciones** ✅ / ❌. Si sale ❌, entra en "Details", copia el error y arréglalo (tu IA te ayuda). Sube el arreglo con otro commit + push: la PR se actualiza sola.
- **Un comentario con el enlace de preview.** Ábrelo y prueba tu cambio ahí, como lo haría otra persona. El enlace es siempre el mismo para esa PR, se actualiza con cada push y se borra al cerrarla.

### 8. Revisión y merge

- El lead revisa y aprueba (o pide cambios: se hacen en la misma rama, commit + push).
- **Sin la aprobación del lead no se puede fusionar.** Con ella, puede pulsar **Squash and merge** cualquiera del equipo.
- Si subes cambios después de la aprobación, hay que volver a aprobar. Es a propósito.
- La documentación (`docs/`) la puede aprobar cualquier compañero.

Al fusionar, la web se publica sola en producción y la rama se borra en GitHub.

### 9. Vuelve a empezar

Vuelve al paso 1. En GitHub Desktop puedes borrar tu rama vieja (**Branch → Delete**).

---

## Qué hago si…

### …GitHub Desktop dice que hay conflictos

Un conflicto es que otra persona y tú habéis cambiado las mismas líneas. No es grave.

1. **No pulses nada a lo loco.** GitHub Desktop muestra qué archivos están en conflicto.
2. Si es en **tu carpeta de `features/`**: abre el archivo en VS Code. Verás marcas `<<<<<<<` y `>>>>>>>` con las dos versiones; VS Code ofrece botones para quedarte con una, con otra o con las dos. Si no lo ves claro, pídeselo a tu IA: *"resuelve este conflicto conservando mis cambios y los de main"*.
3. Si es en **`pnpm-lock.yaml`** o en cualquier archivo de la zona protegida: **para y avisa al lead.**
4. Después: `pnpm check`, commit y push.

Para evitarlos: ramas cortas, y actualiza tu rama con `main` a menudo (**Branch → Update from main**).

### …he empezado a trabajar en `main` sin crear rama

Tranquilidad: `main` está protegida y no vas a poder subirlo. En GitHub Desktop: **Current Branch →
New Branch**, ponle nombre, y cuando pregunte qué hacer con tus cambios elige **Bring my changes to…**
la rama nueva.

### …quiero deshacer mi último commit

Si **no** has hecho push: en GitHub Desktop, pestaña **History**, clic derecho en el commit → **Undo commit**.
Si **ya** has hecho push: clic derecho → **Revert changes in commit** (crea un commit que lo deshace) y push.

### …quiero descartar todo lo que he tocado desde el último commit

GitHub Desktop, pestaña **Changes**: clic derecho sobre los archivos → **Discard changes**. No se puede deshacer.

### …las comprobaciones de mi PR salen en rojo

Entra en **Details**, copia el mensaje de error y pásaselo a tu IA. Casi siempre es lo mismo que
habría dicho `pnpm check` en tu ordenador. **Nunca** se arregla desactivando la regla que protesta.

### …el enlace de preview no aparece

- ¿Tu PR solo cambia documentación? Entonces no hay preview, es normal.
- Mira si la comprobación "Preview" está en rojo; si lo está, avisa al lead (es zona protegida).

### …necesito un componente que no está en `/guia-de-estilos`, un paquete nuevo, o cambiar algo protegido

No lo hagas tú ni tu IA. Abre una issue con la plantilla **"Cambio en zona protegida"** y cuéntale
al lead qué necesitas y para qué.

### …necesito un dato que `services` no da todavía

Se añade la operación en tres sitios: `services/types.ts`, `services/mock/index.ts` y
`services/firebase/index.ts`. Tu IA sabe hacerlo (está en `AGENTS.md`). Si la parte de Firebase se
complica, se deja marcada como pendiente y **se dice en la PR**. Más contexto en [Entornos](ENTORNOS).

### …no sé por dónde empezar mi funcionalidad

1. Lee tu parte en [Producto](PRODUCTO).
2. Abre `/ejemplo` en la web y el archivo `features/example/README.md`.
3. Pídele a tu IA que te explique la pantalla de ejemplo, y que sustituya la pantalla provisional de tu carpeta por una primera versión sencilla. Primera PR: pequeña.

### …tengo una duda que no está aquí

[Discussions](https://github.com/aizetachan/finder-objetos-perdidos/discussions). Si la respuesta
le sirve a más gente, se añade a esta página.

---

## Compromisos del equipo

- **Revisión:** el lead revisa las PR en menos de 24 h laborables. Si no puede, lo dice en la PR.
- **PR pequeñas:** si una PR toca más de ~10 archivos o lleva más de 3 días, se parte.
- **Una persona por funcionalidad.** Si necesitas tocar la carpeta de otro, habladlo antes.
- **Bitácora:** tras cada sesión de equipo, alguien (rotando) añade una entrada en [Bitácora](bitacora/).
