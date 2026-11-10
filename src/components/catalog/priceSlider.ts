/**
 * Slider de precio de dos puntos (escritorio): pinta la pista, evita que los puntos
 * se crucen y convierte los bordes en "sin límite". No sabe de filtros ni de la URL.
 */

export type CampoPrecio = 'min' | 'max';

/** Precio más bajo y más alto del catálogo: los extremos del slider. */
export interface Bordes {
  min: number;
  max: number;
}

export interface SliderEls {
  root: HTMLElement;
  pmin: HTMLInputElement;
  pmax: HTMLInputElement;
  valor: HTMLElement;
}

const PORCENTAJE = 100;
/** Evita dividir entre 0 si todos los productos cuestan lo mismo. */
const ANCHO_MINIMO = 1;

/** Posición de un valor sobre la pista, en porcentaje. */
function posicion(valor: number, bordes: Bordes): string {
  const ancho = Math.max(ANCHO_MINIMO, bordes.max - bordes.min);
  return `${((valor - bordes.min) / ancho) * PORCENTAJE}%`;
}

/**
 * Pinta los dos puntos, el relleno entre ellos y el texto. Un límite null (sin límite)
 * se pinta en el borde correspondiente.
 */
export function pintarSlider(els: SliderEls, min: number | null, max: number | null, bordes: Bordes): void {
  const a = min ?? bordes.min;
  const b = max ?? bordes.max;
  els.pmin.value = String(a);
  els.pmax.value = String(b);
  els.root.style.setProperty('--a', posicion(a, bordes));
  els.root.style.setProperty('--b', posicion(b, bordes));
  els.valor.textContent = `S/${a} – S/${b}`;
  els.pmin.setAttribute('aria-valuetext', `S/${a}`);
  els.pmax.setAttribute('aria-valuetext', `S/${b}`);
}

/** Los puntos no se cruzan: el que se mueve empuja al otro hasta igualarlo. */
export function ajustarPuntos(a: number, b: number, mueve: CampoPrecio): [number, number] {
  if (a <= b) return [a, b];
  return mueve === 'min' ? [b, b] : [a, a];
}

/** Valores del slider a límites de filtro: un punto en el borde equivale a "sin límite". */
export function aSinLimite(a: number, b: number, bordes: Bordes): { min: number | null; max: number | null } {
  return {
    min: a <= bordes.min ? null : a,
    max: b >= bordes.max ? null : b,
  };
}
