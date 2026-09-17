---
title: Primera sesión
nav_order: 8
---

# Guion de la primera sesión con el equipo

**Objetivo único:** que cada persona arranque el proyecto en su ordenador y complete el ciclo
entero (rama → PR → preview → merge) **antes de escribir una línea de producto**.

**Duración:** 2 horas. **Antes de la sesión:** cada uno tiene cuenta de GitHub, ha aceptado la
invitación al repo y, si puede, ha instalado GitHub Desktop, VS Code y Node (pasos 2.1 y 2.2 de la
[Guía del equipo](GUIA-EQUIPO)).

| Min | Qué | Cómo |
|---|---|---|
| 0–15 | **Qué estamos construyendo** | El lead enseña la web publicada, `/ejemplo`, `/guia-de-estilos` y el selector de persona. Se lee juntos el punto 1 y 2 de [Producto](PRODUCTO) |
| 15–50 | **Instalar y arrancar** | Todos siguen la [Guía del equipo](GUIA-EQUIPO), pasos 2 a 4, a la vez. Nadie avanza hasta que **todos** ven la web en `localhost:5173`. Los problemas que salgan se apuntan para la guía |
| 50–60 | Descanso | |
| 60–100 | **La PR de prueba** | Cada persona: crea la rama `feature/hola-<su-nombre>`, añade su nombre al archivo `docs/EQUIPO.md`, commit, push, abre la PR con la plantilla, ve pasar las comprobaciones. Se aprueban entre compañeros (es documentación) y cada uno fusiona la suya. Si dos editan la misma línea: perfecto, se resuelve un conflicto en directo |
| 100–110 | **La preview** | El lead abre una PR pequeña de código en directo para que todos vean aparecer el enlace de preview y cómo se revisa |
| 110–120 | **Reparto y reglas** | Se asignan las 4 funcionalidades (tabla de [Producto](PRODUCTO)), se repasan las 5 reglas de oro y la zona protegida, y se abre una issue por funcionalidad. Quién escribe la primera entrada de la [Bitácora](bitacora/) |

## Después de la sesión

- [ ] El lead apunta los responsables en `PRODUCTO.md` y asigna las issues.
- [ ] Los problemas de instalación que hayan salido se añaden a "Si algo va mal" de la guía.
- [ ] Primera PR real de cada persona: **pequeña** (sustituir su pantalla provisional por una primera versión sencilla).
