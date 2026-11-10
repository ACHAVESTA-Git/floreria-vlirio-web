/**
 * Pinta un Estado en la página: orden y visibilidad de las celdas, controles marcados,
 * contadores, títulos y la URL. No decide nada: recibe el estado y lo refleja.
 */
import { plural } from '../../lib/text';
import {
  comparador,
  coincide,
  contarActivos,
  hayFiltros,
  parseLimite,
  serializarEstado,
  tienePrecio,
  TODOS,
  type Estado,
  type ValoresValidos,
} from './filterState';
import type { Elementos } from './catalogElements';
import { pintarSlider } from './priceSlider';

const TITULO_BASE = 'Catálogo';
const SUFIJO_TITULO = " · Florería V'Lirio";

/** Solo cambia el orden (style.order) y la visibilidad (hidden) de las celdas: no mueve nodos. */
export function aplicarCeldas(el: Elementos, e: Estado): void {
  const cmp = comparador(e.orden);
  const ordenadas = [...el.celdas].sort((a, b) => cmp(a.datos, b.datos));
  ordenadas.forEach((c, i) => {
    c.el.style.order = String(i);
  });
  for (const c of el.celdas) {
    c.el.hidden = !coincide(c.datos, e);
  }
}

function contarVisibles(el: Elementos): number {
  return el.celdas.filter((c) => !c.el.hidden).length;
}

function marcarControles(el: Elementos, e: Estado): void {
  const f = el.filtros;
  for (const b of f.catBtns) {
    b.setAttribute('aria-pressed', String(b.dataset.filterCat === e.categoria));
  }
  for (const c of f.chips) {
    c.setAttribute('aria-pressed', String(e.ocasiones.has(c.dataset.filterOca ?? '')));
  }
  for (const c of f.colorBtns) {
    c.setAttribute('aria-pressed', String(e.colores.has(c.dataset.filterColor ?? '')));
  }
  f.sort.value = e.orden;
}

function marcarRangos(el: Elementos, e: Estado): void {
  for (const r of el.precio.rangoBtns) {
    const activo =
      tienePrecio(e) &&
      parseLimite(r.dataset.rangoMin ?? null) === e.min &&
      parseLimite(r.dataset.rangoMax ?? null) === e.max;
    r.setAttribute('aria-pressed', String(activo));
  }
}

function marcarBadge(badge: HTMLElement, n: number): void {
  badge.textContent = String(n);
  badge.hidden = n === 0;
}

function etiquetaResultados(visibles: number): string {
  return visibles === 0 ? 'Sin resultados' : plural(visibles, 'producto');
}

function actualizarResultados(el: Elementos, e: Estado, visibles: number): void {
  const r = el.resultados;
  r.count.textContent = etiquetaResultados(visibles);
  r.empty.hidden = visibles > 0;
  r.clear.hidden = !hayFiltros(e);
  // Mismo valor que #results-count, pero en el título y en el botón "Ver N" del panel
  r.contadorCat.textContent = `· ${plural(visibles, 'detalle')}`;
  r.botonVer.textContent = visibles === 0 ? 'Ver sin resultados' : `Ver ${plural(visibles, 'producto')}`;
}

function actualizarBadges(el: Elementos, e: Estado): void {
  const r = el.resultados;
  marcarBadge(r.filtrosN, contarActivos(e));
  marcarBadge(r.badges.oca, e.ocasiones.size);
  marcarBadge(r.badges.color, e.colores.size);
  marcarBadge(r.badges.precio, tienePrecio(e) ? 1 : 0);
}

function nombreCategoria(el: Elementos, slug: string): string {
  const btn = el.filtros.catBtns.find((b) => b.dataset.filterCat === slug);
  return btn?.textContent?.trim() || slug;
}

function actualizarTitulo(el: Elementos, e: Estado, visibles: number): void {
  const r = el.resultados;
  const nombre = e.categoria === TODOS ? TITULO_BASE : nombreCategoria(el, e.categoria);
  r.nombreCat.textContent = nombre;
  document.title = `${nombre}${SUFIJO_TITULO}`;
  r.sub.textContent =
    e.categoria === TODOS ? r.subBase : `Mostrando ${plural(visibles, 'producto')} de ${nombre}`;
}

/**
 * Refleja el estado en controles, contadores y títulos. Con `pintarPrecio` false no
 * mueve el slider: mientras se arrastra, el propio slider es la fuente de verdad.
 */
export function sincronizar(el: Elementos, e: Estado, pintarPrecio: boolean): void {
  marcarControles(el, e);
  marcarRangos(el, e);
  if (pintarPrecio) pintarSlider(el.precio.slider, e.min, e.max, el.precio.bordes);
  const visibles = contarVisibles(el);
  actualizarResultados(el, e, visibles);
  actualizarBadges(el, e);
  actualizarTitulo(el, e, visibles);
}

/** Reescribe la query de la URL sin crear entrada en el historial. */
export function escribirUrl(e: Estado, validos: ValoresValidos): void {
  const { pathname, hash } = window.location;
  history.replaceState(history.state, '', `${pathname}${serializarEstado(e, validos)}${hash}`);
}
