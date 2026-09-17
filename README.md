# Finder

Web para que los objetos perdidos vuelvan a su dueño: quien encuentra algo lo publica, y quien lo ha perdido lo busca y lo reclama.

- Qué es el producto y quién hace qué: [`docs/PRODUCTO.md`](docs/PRODUCTO.md)
- Qué se ha decidido y qué está pendiente: [`docs/DECISIONES.md`](docs/DECISIONES.md)
- Con qué datos trabaja la web (de ejemplo o reales): [`docs/ENTORNOS.md`](docs/ENTORNOS.md)
- Reglas para las IAs (Claude, Cursor, Copilot…): [`AGENTS.md`](AGENTS.md)

## Arrancar el proyecto

Hace falta [Node](https://nodejs.org) 22 o superior y [pnpm](https://pnpm.io).

```bash
pnpm install   # la primera vez, y cuando cambien las dependencias
pnpm dev       # arranca la web en http://localhost:5173
```

La web funciona con **datos de ejemplo** guardados en tu navegador: puedes publicar, reclamar y cambiar de persona desde el menú de cuenta (arriba a la derecha), y restaurar los datos iniciales cuando quieras. No hace falta Firebase ni ningún archivo `.env`.

Antes de abrir una PR: `pnpm check` (revisa el código y comprueba que compila).

## Qué hay en cada carpeta

```
/
├── apps/
│   └── web/                  La web (React + Vite + Tailwind + shadcn/ui)
│       └── src/
│           ├── components/
│           │   ├── ui/       Componentes de shadcn/ui. No se editan a mano.
│           │   ├── layout/   Cabecera, pie y estructura común de las pantallas
│           │   └── …         Composiciones propias hechas SOLO con piezas de ui/
│           ├── features/     Una carpeta por funcionalidad (pantallas + su lógica)
│           │   ├── search/         Portada y buscador
│           │   ├── item-detail/    Ficha del objeto y reclamación
│           │   ├── publish-item/   Publicar un objeto
│           │   ├── account/        Entrar, registro, perfil, mis publicaciones
│           │   ├── example/        LA REFERENCIA PARA COPIAR (/ejemplo). Temporal. Lee su README.
│           │   └── styleguide/     Guía de estilos (/guia-de-estilos). Temporal.
│           ├── services/     Acceso a datos. Las pantallas solo hablan con esto.
│           │   ├── types.ts        El contrato: todas las operaciones que existen
│           │   ├── mock/           Implementación con datos de ejemplo (la que se usa ahora)
│           │   └── firebase/       Implementación real (escrita, desactivada)
│           ├── routes/       Mapa de pantallas (index.tsx) y sus URLs (paths.ts)
│           ├── lib/          Utilidades y configuración
│           ├── hooks/        Hooks compartidos
│           └── index.css     EL TEMA: colores, tipografía y radios. Único sitio donde se tocan.
├── functions/                Cloud Functions: esqueleto, no se usa ni se despliega en la fase 1
├── firebase.json             Configuración de Firebase (hosting y reglas)
├── firestore.rules           Reglas de seguridad de los datos reales
├── firestore.indexes.json    Índices de las consultas
├── packages/
│   └── shared/               Tipos de datos (un archivo por colección), categorías y datos de ejemplo
└── docs/                     Documentación del equipo
```

## Reglas de oro

1. **Solo shadcn/ui.** Las pantallas se construyen con los componentes de `components/ui/`. Todo lo disponible se ve en `/guia-de-estilos`. Si falta un componente, se pide; no se inventa.
2. **Nada de colores a mano.** Se usan los del tema (`bg-primary`, `text-muted-foreground`…), nunca `#ff0000` ni `bg-red-500`. Así el rediseño futuro es cambiar un solo archivo.
3. **Los datos pasan por `services/`.** Ninguna pantalla importa Firebase (si lo haces, `pnpm check` falla).
4. **Cada uno en su carpeta de `features/`.** Así no nos pisamos.
5. **Zona protegida: no se toca.** `.github/` (workflows), Firebase, `AGENTS.md`, `components/ui/`, `index.css` y las dependencias solo las cambia el lead. Si lo necesitas, abre una issue "Cambio en zona protegida".
