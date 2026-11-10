/**
 * Acciones del catálogo: cada una cambia el Estado, reescribe la URL y pinta la vista.
 * Es el único sitio que decide cuándo animar (FLIP) y cuándo esperar al arrastre del
 * slider. Los eventos del DOM están en catalogFilters.ts.
 */
import { flipUpdate } from './flip';
import {
  clonar,
  estadoInicial,
  leerEstado,
  type Estado,
  type ValoresValidos,
} from './filterState';
import { aplicarCeldas, escribirUrl, sincronizar } from './catalogRender';
import { valoresValidos, type Elementos } from './catalogElements';
import { ajustarPuntos, aSinLimite, pintarSlider, type CampoPrecio } from './priceSlider';

export interface Controlador {
  cambiar(mod: (e: Estado) => void): void;
  limpiar(): void;
  arrastrarPrecio(campo: CampoPrecio): void;
  alNavegar(): void;
}

/** Espera a que el usuario deje de arrastrar antes de filtrar (evita refiltrar en cada píxel). */
const DEBOUNCE_MS = 250;

interface Debounce {
  programar(fn: () => void): void;
  cancelar(): void;
}

/** Temporizador de un solo disparo: programar otro cancela el anterior. */
function crearDebounce(ms: number): Debounce {
  let timer: number | undefined;
  const cancelar = (): void => {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  };
  const programar = (fn: () => void): void => {
    cancelar();
    timer = window.setTimeout(() => {
      timer = undefined;
      fn();
    }, ms);
  };
  return { programar, cancelar };
}

function leerUrlActual(validos: ValoresValidos): Estado {
  return leerEstado(new URLSearchParams(window.location.search), validos);
}

/**
 * Estado del catálogo: cada acción pasa por `aplicar`, que pinta la vista. El estado
 * vive en la función y no a nivel de módulo, así cada initCatalog arranca limpio.
 */
export function crearControlador(el: Elementos): Controlador {
  const validos = valoresValidos(el);
  const debounce = crearDebounce(DEBOUNCE_MS);
  let estado = leerUrlActual(validos);
  let arrastrando = false;

  function aplicar(siguiente: Estado, animar: boolean): void {
    estado = siguiente;
    if (animar) flipUpdate(el.grid, () => aplicarCeldas(el, siguiente));
    else aplicarCeldas(el, siguiente);
    sincronizar(el, siguiente, !arrastrando);
  }

  function cambiar(mod: (e: Estado) => void): void {
    const siguiente = clonar(estado);
    mod(siguiente);
    escribirUrl(siguiente, validos);
    aplicar(siguiente, true);
  }

  function limpiar(): void {
    debounce.cancelar();
    const inicial = estadoInicial();
    escribirUrl(inicial, validos);
    aplicar(inicial, true);
  }

  function arrastrarPrecio(campo: CampoPrecio): void {
    const { pmin, pmax } = el.precio.slider;
    const [a, b] = ajustarPuntos(Number(pmin.value), Number(pmax.value), campo);
    arrastrando = true;
    pintarSlider(el.precio.slider, a, b, el.precio.bordes);
    const { min, max } = aSinLimite(a, b, el.precio.bordes);
    debounce.programar(() => {
      cambiar((e) => {
        e.min = min;
        e.max = max;
      });
      arrastrando = false;
    });
  }

  function alNavegar(): void {
    debounce.cancelar();
    aplicar(leerUrlActual(validos), true);
  }

  // Estado inicial desde la URL, sin animación
  aplicarCeldas(el, estado);
  sincronizar(el, estado, true);

  return { cambiar, limpiar, arrastrarPrecio, alNavegar };
}
