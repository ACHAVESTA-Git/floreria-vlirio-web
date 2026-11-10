/**
 * Busca en la página los elementos del catálogo y lee una sola vez los datos que no
 * cambian (data-* de cada celda y los valores válidos). Los ids y data-* son el
 * contrato con CatalogToolbar, FilterPanel, PriceFilter, CatalogGrid y CatalogEmpty.
 */
import { all, must } from '../../lib/dom';
import type { DatosCelda, ValoresValidos } from './filterState';
import type { Bordes, SliderEls } from './priceSlider';

export interface CeldaDatos {
  el: HTMLElement;
  datos: DatosCelda;
}

export interface FiltrosEls {
  catBtns: HTMLButtonElement[];
  chips: HTMLButtonElement[];
  colorBtns: HTMLButtonElement[];
  sort: HTMLSelectElement;
}

export interface PrecioEls {
  slider: SliderEls;
  bordes: Bordes;
  rangoBtns: HTMLButtonElement[];
}

export interface ResultadosEls {
  count: HTMLElement;
  empty: HTMLElement;
  clear: HTMLButtonElement;
  emptyClear: HTMLButtonElement;
  nombreCat: HTMLElement;
  contadorCat: HTMLElement;
  sub: HTMLElement;
  /** Texto de #cat-sub sin filtrar: se restaura al volver a "Todos". */
  subBase: string;
  filtrosN: HTMLElement;
  botonVer: HTMLButtonElement;
  badges: { oca: HTMLElement; color: HTMLElement; precio: HTMLElement };
}

export interface Elementos {
  grid: HTMLUListElement;
  celdas: CeldaDatos[];
  filtros: FiltrosEls;
  precio: PrecioEls;
  resultados: ResultadosEls;
}

/** Celda sin dato numérico: se trata como "sin límite" y va al final al ordenar por precio. */
const SIN_DATO = Number.POSITIVE_INFINITY;

/** Lista separada por espacios (data-oca="amor cumple") sin vacíos. */
function listaDe(raw: string | undefined): string[] {
  return (raw ?? '').split(' ').filter(Boolean);
}

function leerNumero(raw: string | undefined): number {
  const n = Number.parseFloat(raw ?? '');
  return Number.isFinite(n) ? n : SIN_DATO;
}

export function leerDatosCelda(cell: HTMLElement): DatosCelda {
  return {
    cat: cell.dataset.cat ?? '',
    ocasiones: listaDe(cell.dataset.oca),
    colores: listaDe(cell.dataset.color),
    precio: leerNumero(cell.dataset.precio),
    rel: leerNumero(cell.dataset.rel),
  };
}

/** Valores que la página acepta para cada filtro, en el orden en que aparecen. */
export function valoresValidos(el: Elementos): ValoresValidos {
  return {
    categorias: el.filtros.catBtns.map((b) => b.dataset.filterCat ?? ''),
    ocasiones: el.filtros.chips.map((c) => c.dataset.filterOca ?? '').filter(Boolean),
    colores: el.filtros.colorBtns.map((c) => c.dataset.filterColor ?? '').filter(Boolean),
  };
}

function buscarFiltros(): FiltrosEls {
  return {
    catBtns: all<HTMLButtonElement>('[data-filter-cat]'),
    chips: all<HTMLButtonElement>('[data-filter-oca]'),
    colorBtns: all<HTMLButtonElement>('[data-filter-color]'),
    sort: must<HTMLSelectElement>('#sort'),
  };
}

function buscarPrecio(): PrecioEls {
  const root = must<HTMLElement>('#slider');
  return {
    slider: {
      root,
      pmin: must<HTMLInputElement>('#pmin'),
      pmax: must<HTMLInputElement>('#pmax'),
      valor: must<HTMLElement>('#slider-val'),
    },
    bordes: { min: Number(root.dataset.min ?? 0), max: Number(root.dataset.max ?? 0) },
    rangoBtns: all<HTMLButtonElement>('[data-rango-min]'),
  };
}

function buscarResultados(): ResultadosEls {
  const sub = must<HTMLElement>('#cat-sub');
  return {
    count: must<HTMLElement>('#results-count'),
    empty: must<HTMLElement>('#empty'),
    clear: must<HTMLButtonElement>('#clear'),
    emptyClear: must<HTMLButtonElement>('#empty-clear'),
    nombreCat: must<HTMLElement>('#cat-name'),
    contadorCat: must<HTMLElement>('#cat-count'),
    sub,
    subBase: sub.textContent ?? '',
    filtrosN: must<HTMLElement>('#filtros-n'),
    botonVer: must<HTMLButtonElement>('#sheet-apply'),
    badges: {
      oca: must<HTMLElement>('[data-acc-n="oca"]'),
      color: must<HTMLElement>('[data-acc-n="color"]'),
      precio: must<HTMLElement>('[data-acc-n="precio"]'),
    },
  };
}

export function buscarElementos(grid: HTMLUListElement): Elementos {
  return {
    grid,
    celdas: all<HTMLElement>('[data-cell]', grid).map((el) => ({ el, datos: leerDatosCelda(el) })),
    filtros: buscarFiltros(),
    precio: buscarPrecio(),
    resultados: buscarResultados(),
  };
}
