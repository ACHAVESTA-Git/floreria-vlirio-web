/**
 * Abre y cierra el drawer "Mi canasta", conecta sus eventos y lo mantiene al día con basketStore.
 * El pintado vive en basketRender.ts y los botones [data-add] en basketAddButtons.ts.
 */
import { lockScroll, unlockScroll } from '../../lib/scrollLock';
import { trapFocus } from '../../lib/focusTrap';
import { EVENTO_ABRIR_CANASTA } from '../../lib/events';
import { initAddButtons } from './basketAddButtons';
import { leerNodosCanasta, type BasketNodes } from './basketNodes';
import { renderItems, renderTotales, renderUpsell } from './basketRender';
import { $canasta, $cardMessage, cantidadDe, setQty } from './basketStore';
import { claveAccion } from './basketText';

const ID_BOTON_CANASTA = 'basketBtn';

/** Un drawer por documento aunque initBasketDrawer() se llame dos veces. */
const montados = new WeakSet<HTMLElement>();

interface Panel {
  abrir: () => void;
  cerrar: () => void;
}

export function initBasketDrawer(): void {
  const nodos = leerNodosCanasta();
  if (montados.has(nodos.drawer)) return;
  montados.add(nodos.drawer);

  const panel = crearPanel(nodos);
  conectarEventos(nodos, panel);
  initAddButtons(panel.abrir);
  suscribir(nodos);
}

function crearPanel(nodos: BasketNodes): Panel {
  let abierto = false;
  let soltarFoco: (() => void) | null = null;

  function abrir(): void {
    if (abierto) return;
    abierto = true;
    renderUpsell(nodos);
    mostrar(nodos, true);
    lockScroll();
    soltarFoco = trapFocus(nodos.drawer);
    nodos.closeBtn.focus();
  }

  function cerrar(): void {
    if (!abierto) return;
    abierto = false;
    soltarFoco?.();
    soltarFoco = null;
    // Primero se devuelve el foco fuera del drawer; mostrar(false) lo vuelve inerte después.
    document.getElementById(ID_BOTON_CANASTA)?.focus();
    mostrar(nodos, false);
    unlockScroll();
  }

  document.addEventListener('keydown', (e) => {
    if (!abierto || e.key !== 'Escape') return;
    e.preventDefault();
    cerrar();
  });

  return { abrir, cerrar };
}

/** Visibilidad del drawer y su scrim. `inert` evita que se pueda llegar a él con el drawer cerrado. */
function mostrar(nodos: BasketNodes, on: boolean): void {
  nodos.drawer.toggleAttribute('inert', !on);
  nodos.drawer.classList.toggle('on', on);
  nodos.drawer.setAttribute('aria-hidden', String(!on));
  nodos.scrim.classList.toggle('on', on);
}

function conectarEventos(nodos: BasketNodes, panel: Panel): void {
  nodos.items.addEventListener('click', (e) => onClickItems(e, nodos));
  nodos.cardMsg.addEventListener('input', () => {
    $cardMessage.set(nodos.cardMsg.value);
  });
  nodos.closeBtn.addEventListener('click', panel.cerrar);
  nodos.scrim.addEventListener('click', panel.cerrar);
  document.addEventListener(EVENTO_ABRIR_CANASTA, panel.abrir);
}

/** Botones de cantidad y "Quitar" de una fila; después devuelve el foco al control equivalente. */
function onClickItems(e: MouseEvent, nodos: BasketNodes): void {
  if (!(e.target instanceof Element)) return;
  const boton = e.target.closest<HTMLButtonElement>('button[data-accion]');
  const slug = boton?.dataset.slug;
  const accion = boton?.dataset.accion;
  if (!slug || !accion) return;

  aplicarAccion(slug, accion);
  // El render es síncrono: enfocar el control equivalente tras reconstruir la lista.
  enfocarPorClave(nodos, claveAccion(slug, accion));
}

function aplicarAccion(slug: string, accion: string): void {
  if (accion === 'quitar') setQty(slug, 0);
  else setQty(slug, cantidadDe(slug) + (accion === 'mas' ? 1 : -1));
}

function enfocarPorClave(nodos: BasketNodes, clave: string): void {
  const el = nodos.items.querySelector<HTMLElement>(`[data-key="${clave}"]`);
  (el ?? nodos.items.querySelector<HTMLElement>('button') ?? nodos.closeBtn).focus();
}

function suscribir(nodos: BasketNodes): void {
  $canasta.subscribe(() => {
    renderItems(nodos);
    renderTotales(nodos);
  });
  $cardMessage.subscribe(() => {
    if (nodos.cardMsg.value !== $cardMessage.get()) nodos.cardMsg.value = $cardMessage.get();
    renderTotales(nodos);
  });
}
