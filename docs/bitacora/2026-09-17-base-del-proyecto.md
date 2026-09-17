---
title: "2026-09-17 · Base del proyecto"
parent: Bitácora
nav_order: 1
---

# 2026-09-17 · Base del proyecto

**Quién:** lead (con Claude Code).

## Qué se hizo

- Definición del producto y del modelo de datos ([Producto](../PRODUCTO)).
- Base del proyecto: web con React + shadcn/ui, tema único, estructura de carpetas, todas las rutas con pantallas "por construir".
- Datos de ejemplo guardados en el navegador, con selector de persona para probar como quien publica y como quien reclama.
- Pantalla de referencia `/ejemplo` y guía de estilos `/guia-de-estilos` (ambas temporales).
- Proyecto de Firebase `finder-lost-found-app` (plan gratuito, Madrid) con reglas de seguridad desplegadas.
- GitHub: comprobaciones automáticas, preview por PR, publicación automática al fusionar, `main` protegida.
- Reglas para las IAs en `AGENTS.md` y zona protegida.

## Qué se decidió

Todo está en [Decisiones](../DECISIONES). Lo más importante: el equipo trabaja **siempre** con datos de ejemplo; la conexión con datos reales se activará más adelante con un interruptor.

## Qué queda

- Invitar al equipo al repositorio y asignar las 4 funcionalidades.
- Primera sesión con el equipo ([guion](../PRIMERA-SESION)).
