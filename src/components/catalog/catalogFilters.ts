/**
 * Conecta los eventos del DOM (clics, orden, slider, atrás/adelante) con el controlador
 * de catalogController.ts. No calcula nada: solo traduce eventos en acciones.
 */
import { must } from '../../lib/dom';
import { alternarValor, isOrden, parseLimite, TODOS, type Orden } from './filterState';
import { buscarElementos, type Elementos } from './catalogElements';
import { crearControlador, type Controlador } from './catalogController';

/** Idempotencia: llamar dos veces a initCatalog no duplica listeners. */
const initialized = new WeakSet<HTMLElement>();

function conectarCategorias(el: Elementos, ctl: Controlador): void {
  for (const b of el.filtros.catBtns) {
    b.addEventListener('click', () => {
      const cat = b.dataset.filterCat ?? TODOS;
      ctl.cambiar((e) => {
        e.categoria = cat;
      });
    });
  }
}

function conectarCasillas(el: Elementos, ctl: Controlador): void {
  for (const c of el.filtros.chips) {
    c.addEventListener('click', () => {
      const oca = c.dataset.filterOca ?? '';
      if (oca) ctl.cambiar((e) => alternarValor(e.ocasiones, oca));
    });
  }
  for (const c of el.filtros.colorBtns) {
    c.addEventListener('click', () => {
      const color = c.dataset.filterColor ?? '';
      if (color) ctl.cambiar((e) => alternarValor(e.colores, color));
    });
  }
}

function conectarOrden(el: Elementos, ctl: Controlador): void {
  el.filtros.sort.addEventListener('change', () => {
    const v = el.filtros.sort.value;
    if (!isOrden(v)) return;
    const orden: Orden = v;
    ctl.cambiar((e) => {
      e.orden = orden;
    });
  });
}

/** Rangos rápidos: tocar el que está activo lo quita. */
function conectarRangos(el: Elementos, ctl: Controlador): void {
  for (const r of el.precio.rangoBtns) {
    r.addEventListener('click', () => {
      const min = parseLimite(r.dataset.rangoMin ?? null);
      const max = parseLimite(r.dataset.rangoMax ?? null);
      const yaActivo = r.getAttribute('aria-pressed') === 'true';
      ctl.cambiar((e) => {
        e.min = yaActivo ? null : min;
        e.max = yaActivo ? null : max;
      });
    });
  }
}

function conectarSlider(el: Elementos, ctl: Controlador): void {
  el.precio.slider.pmin.addEventListener('input', () => ctl.arrastrarPrecio('min'));
  el.precio.slider.pmax.addEventListener('input', () => ctl.arrastrarPrecio('max'));
}

function conectarLimpiar(el: Elementos, ctl: Controlador): void {
  el.resultados.clear.addEventListener('click', () => ctl.limpiar());
  el.resultados.emptyClear.addEventListener('click', () => ctl.limpiar());
}

/** Atrás/adelante del navegador. Si la grilla ya no está en la página, se desuscribe. */
function conectarNavegacion(el: Elementos, ctl: Controlador): void {
  const alPopState = (): void => {
    if (!el.grid.isConnected) {
      window.removeEventListener('popstate', alPopState);
      return;
    }
    ctl.alNavegar();
  };
  window.addEventListener('popstate', alPopState);
}

export function initCatalog(): void {
  const grid = must<HTMLUListElement>('#grid');
  if (initialized.has(grid)) return;
  initialized.add(grid);

  const el = buscarElementos(grid);
  const ctl = crearControlador(el);
  conectarCategorias(el, ctl);
  conectarCasillas(el, ctl);
  conectarOrden(el, ctl);
  conectarRangos(el, ctl);
  conectarSlider(el, ctl);
  conectarLimpiar(el, ctl);
  conectarNavegacion(el, ctl);
}
