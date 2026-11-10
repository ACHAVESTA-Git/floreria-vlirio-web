# Guía de código — Florería V'Lirio

> Reglas para que cualquier agente o persona pueda abrir un archivo, entenderlo en dos minutos y cambiarlo sin romper otra cosa. Complementa a `CLAUDE.md`: si algo choca, `CLAUDE.md` manda.

## 1. Tamaños máximos (señal de alarma, no meta)

| Pieza | Límite orientativo | Si lo pasas… |
|---|---|---|
| Componente `.astro` (todo el archivo) | **~250 líneas** | Sepáralo en subcomponentes o saca el script/la lógica |
| Bloque `<script>` dentro de un `.astro` | **~30 líneas** | Muévelo a un módulo `.ts` al lado del componente y déjalo en 2–3 líneas (`import { initX } …; initX();`) |
| Frontmatter (`---`) | **~30 líneas** | Los cálculos de datos van a `src/lib/*.ts` |
| Módulo `.ts` | **~200 líneas** | Separa lógica pura (estado, cálculos) de la que toca el DOM |
| Función | **~40 líneas** | Extrae pasos con nombre propio |

Una página de 900 líneas no es "completa": es difícil de revisar, de probar y de reutilizar.

## 2. Una responsabilidad por archivo

Cada archivo responde **una** pregunta:

- `*.astro` → *¿qué se ve?* (marcado + estilos de ese bloque).
- `src/lib/*.ts` → *¿qué datos se calculan?* (funciones puras, sin `document`).
- `components/<área>/<algo>.ts` → *¿cómo se comporta en el navegador?* (eventos, DOM).
- `components/<área>/<algo>Store.ts` → *¿qué estado se comparte?* (nanostores + `localStorage`).

**Separa la lógica pura del DOM.** Ejemplo en el catálogo:
- `filterState.ts`: tipo `Estado`, leer/escribir la URL, `coincide()`, `comparador()`. Sin `document` → se puede probar y reutilizar.
- `catalogFilters.ts`: busca los elementos, escucha eventos y llama a lo anterior.

## 3. No repitas: usa lo compartido

Antes de escribir un helper, busca si ya existe (`grep -rn "function nombre" src`).

| Necesitas… | Usa | No hagas |
|---|---|---|
| Buscar un elemento obligatorio | `must()` de `src/lib/dom.ts` | Otra función `must` local, o `document.querySelector(...)!` |
| Varios elementos como array | `all()` de `src/lib/dom.ts` | `Array.from(document.querySelectorAll(...))` repetido |
| Saber si hay reduced motion | `prefersReducedMotion()` de `src/lib/dom.ts` | `window.matchMedia(...)` copiado |
| Bloquear el scroll al abrir un panel | `lockScroll()`/`unlockScroll()` de `src/lib/scrollLock.ts` | `document.body.style.overflow = 'hidden'` (dos paneles se pisan y Lenis sigue moviendo la página) |
| Atrapar el foco en un diálogo | `trapFocus()` de `src/lib/focusTrap.ts` | Copiar el manejo de `Tab` en cada componente |
| Quitar tildes, capitalizar, plurales | `src/lib/text.ts` | Otra `normalizar` local |
| Color de producto → token CSS | `src/lib/colors.ts` | Listas `TOKENS_COLOR` copiadas |
| Datos de productos | `src/lib/catalog.ts` | Leer la colección o escribir precios en el componente |
| Conteos y facetas del catálogo | `src/lib/catalogFacets.ts` | Calcularlos en el frontmatter de la página |
| Emitir o escuchar un evento propio | Constante de `src/lib/events.ts` | Escribir `'vl:algo'` a mano en dos archivos |
| Favoritos o canasta | `favoritesStore.ts` / `basketStore.ts` | Leer `localStorage` desde un componente |

Si copias un bloque por segunda vez, es momento de extraerlo.

## 4. Componentes Astro

Orden fijo dentro del archivo: **frontmatter → marcado → `<script>` (corto) → `<style>`**.

```astro
---
import FilterAccordion from './FilterAccordion.astro';
import { getFacetas } from '../../lib/catalogFacets';

interface Props {
  productos: Producto[];
}
const { productos } = Astro.props;
const { ocasiones, colores } = getFacetas(productos); // la lógica vive en lib
---

<aside class="panel">…</aside>

<script>
  import { initFilterPanel } from './filterPanel';
  initFilterPanel();
</script>

<style>
  .panel { … }
</style>
```

- **Props tipadas** con `interface Props`. Nada de `any`.
- **Los ids y `data-*` son un contrato** con el JS: si los cambias, cambia también el `.ts` que los busca. Prefiere `data-*` para el comportamiento y clases para el estilo.
- Estilos **acotados al componente**. `:global()` solo cuando de verdad hay que alcanzar a un hijo de otro componente, y con un comentario que diga por qué.
- Un componente de página (`pages/*.astro`) debe leerse como un índice: compone secciones, no las implementa.

## 5. TypeScript del navegador

- `strict` sin escapatorias: nada de `any`, `@ts-ignore` ni `!` para callar nulos (usa `must()`).
- Exporta una función `initX()` por módulo y haz que sea **idempotente** (que llamarla dos veces no duplique listeners). Patrón: `WeakSet` del elemento raíz.
- **Nada de estado global de módulo** salvo que sea a propósito (y comentado). Los temporizadores y el estado van dentro de `initX()`.
- Nombres: funciones en español o inglés, pero **consistentes dentro del archivo**. Componentes en inglés (`FilterPanel.astro`) y textos visibles en español (regla de `CLAUDE.md`).
- Nada de números mágicos: `const DEBOUNCE_MS = 250;` arriba del archivo. **Pero con criterio:** nombra los valores que alguien querría ajustar o que no se entienden solos (duraciones, límites, cortes). Una curva con 30 constantes (`RUIDO_ALTURA_PX`, `ESCALA_PICO`…) no se lee mejor que con los números y un comentario. Agrúpalas en un objeto (`const VUELO = { duracionMs: 820, pasos: 22 }`) si son de lo mismo.
- **Dos paneles pueden convivir**: si un panel nuevo atrapa el foco, piensa qué pasa si otro se abre encima (ejemplo: abrir la canasta cierra el menú móvil).

## 6. CSS

- **Solo tokens** (`var(--vl-*)`). Si falta un color, sombra o medida, **agrega el token** en `src/styles/tokens.css` con un comentario de uso. Nunca hex, `rgb()` ni sombras sueltas en un componente.
- **Mobile first**: estilos base para 375px y `@media (min-width: …)` hacia arriba. Usa los cortes que ya existen: **760px** (tablet), **1024px** (escritorio con barra lateral) y **1240px** (escritorio ancho).
- Cada `transition`/`animation` tiene su versión en `@media (prefers-reduced-motion: reduce)`.
- Si un elemento usa `hidden` y además una clase que define `display`, agrega `.clase[hidden] { display: none; }`.

## 7. Comentarios

- Explica **por qué**, no qué: `/* 9px = medio punto: la columna con scroll recortaba los extremos */`.
- Encabezado corto en cada módulo `.ts` diciendo qué hace y qué no.
- Borra el código comentado y los `console.log`.

## 8. Lecciones del primer refactor (nov 2026)

- **Que un archivo sea corto no lo hace legible.** `flyToBasket.ts` pasó de 137 a 236 líneas al nombrar cada número. El objetivo es entender el archivo rápido, no cumplir un contador.
- **Al separar componentes, los ids y `data-*` son el contrato.** Compara la lista de ids y `data-*` del HTML antes y después (`grep -o 'id="[^"]*"' | sort`). Así se verificó el refactor del catálogo: 262 atributos idénticos.
- **Lo que no puedes probar, dilo.** "Compila" no es lo mismo que "funciona": la prueba en el navegador (375px y 1280px, teclado, scroll) se hace siempre antes de fusionar.
- **Si ves un bug fuera de tu área, repórtalo; no lo arregles en silencio.** Así salió a la luz el conflicto entre el menú y la canasta.

## 9. Antes de hacer commit (checklist)

1. `npm run build` → **0 errores** (`astro check` incluido).
2. Ningún archivo nuevo o tocado pasa los límites de la sección 1 sin una razón escrita en el PR o commit.
3. Pruébalo en 375px y 1280px; si tocaste un panel, prueba Escape, el foco y el scroll de fondo.
4. **Mismo comportamiento que antes**: un refactor no cambia lo que ve el usuario. Compara capturas antes y después.
5. Commits pequeños en español: `refactor: extraer FilterPanel del catálogo`.
