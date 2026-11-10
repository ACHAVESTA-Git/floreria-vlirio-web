/**
 * Botones [data-add] de cualquier parte de la página: suman el producto a la canasta,
 * muestran "✓ Agregado" un momento y lanzan la flor hacia el ícono. Un solo listener delegado en document.
 */
import type { CatalogEntry } from '../../lib/catalog';
import { addItem, getCatalogo } from './basketStore';
import { flyToBasket } from './flyToBasket';
import { showToast } from './toast';

const FEEDBACK_MS = 1300;
const TEXTO_AGREGADO = '✓ Agregado';
const CANTIDAD_MIN = 1;
const CANTIDAD_MAX = 99;

/** Un listener por documento aunque se llame dos veces. */
const montados = new WeakSet<Document>();

/** `alVerCanasta` abre el drawer desde el toast que aparece tras agregar. */
export function initAddButtons(alVerCanasta: () => void): void {
  if (montados.has(document)) return;
  montados.add(document);

  // Temporizador por botón: si se pulsa de nuevo antes de 1.3 s, se reinicia el feedback.
  const temporizadores = new WeakMap<HTMLElement, number>();

  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    const boton = e.target.closest<HTMLElement>('[data-add]');
    const slug = boton?.dataset.add;
    if (!boton || !slug) return;
    const p = getCatalogo()[slug];
    if (!p) return;
    agregar(boton, slug, p, temporizadores, alVerCanasta);
  });
}

function agregar(
  boton: HTMLElement,
  slug: string,
  p: CatalogEntry,
  temporizadores: WeakMap<HTMLElement, number>,
  alVerCanasta: () => void,
): void {
  marcarAgregado(boton, temporizadores);
  addItem(slug, cantidadDelBoton(boton));
  flyToBasket(boton, p, () => {
    showToast(`${p.nombre} se agregó a tu canasta`, { label: 'Ver canasta', onClick: alVerCanasta });
  });
}

/** data-qty del botón, acotado a 1–99; sin data-qty (o inválido) agrega una unidad. */
function cantidadDelBoton(boton: HTMLElement): number {
  const n = Math.floor(Number(boton.dataset.qty)) || CANTIDAD_MIN;
  return Math.min(CANTIDAD_MAX, Math.max(CANTIDAD_MIN, n));
}

function marcarAgregado(boton: HTMLElement, temporizadores: WeakMap<HTMLElement, number>): void {
  boton.classList.add('done');
  const span = boton.querySelector('span');
  if (!span) return;
  span.dataset.original ??= span.textContent ?? '';
  span.textContent = TEXTO_AGREGADO;

  const previo = temporizadores.get(boton);
  if (previo !== undefined) window.clearTimeout(previo);
  const id = window.setTimeout(() => {
    restaurar(boton, span);
    temporizadores.delete(boton);
  }, FEEDBACK_MS);
  temporizadores.set(boton, id);
}

function restaurar(boton: HTMLElement, span: HTMLElement): void {
  span.textContent = span.dataset.original ?? '';
  boton.classList.remove('done');
}
