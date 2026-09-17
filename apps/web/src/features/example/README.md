# features/example — la referencia para copiar

> **Carpeta temporal** (ver `docs/DECISIONES.md`). No es parte del producto: es el modelo de cómo se
> construye una funcionalidad en Finder. Se ve en `/ejemplo`.

Una funcionalidad completa tiene estas piezas, y cada una va en su archivo:

| Archivo | Qué hace | Regla |
|---|---|---|
| `example-page.tsx` | La pantalla. Junta las piezas y decide qué se ve en cada estado: **cargando**, **error**, **vacío** y **con datos**. | Toda pantalla que pide datos contempla los 4 estados. |
| `use-example-items.ts` | Pide y modifica datos. Es el único sitio que habla con `services`. | Las pantallas no llaman a `services` directamente: usan estos hooks. |
| `item-card.tsx` | Una pieza visual hecha con componentes de `components/ui/`. | Solo shadcn/ui y colores del tema. |
| `quick-publish-dialog.tsx` | Un formulario con validación dentro de una ventana. | Formularios = react-hook-form + zod + `Field`. Los mensajes de error, en español. |

## Para crear una funcionalidad nueva

1. Trabaja en tu carpeta de `features/`. Copia de aquí los archivos que se parezcan a lo que necesitas.
2. ¿Necesitas un dato que ningún servicio da todavía? Añade la operación en `services/types.ts`
   y después en `services/mock/` (y en `services/firebase/`, o pide ayuda al lead).
3. ¿Pantalla nueva? Añade su URL en `routes/paths.ts` y la pantalla en `routes/index.tsx`.
4. ¿Falta un componente visual? No lo inventes: mira `/guia-de-estilos` y, si no está, pídelo.
