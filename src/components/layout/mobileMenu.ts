/**
 * Menú móvil del header: abre y cierra el panel a pantalla completa, bloquea el scroll
 * y atrapa el Tab mientras está abierto. No cambia el marcado (ids y data-* son el contrato
 * con Header.astro). Desde 900px el panel se oculta por CSS y el módulo lo cierra si estaba abierto.
 */
import { all, must } from '../../lib/dom';
import { lockScroll, unlockScroll } from '../../lib/scrollLock';
import { trapFocus } from '../../lib/focusTrap';

/** Desde este ancho el menú móvil desaparece y se usa la navegación en línea. */
const ESCRITORIO_MQ = '(min-width: 900px)';
const ETIQUETA_ABRIR = 'Abrir menú';
const ETIQUETA_CERRAR = 'Cerrar menú';
const ICONO_ABRIR = '#i-menu';
const ICONO_CERRAR = '#i-close';

/** Un solo listener por header aunque initMobileMenu() se llame dos veces. */
const inicializados = new WeakSet<HTMLElement>();

interface MenuNodes {
  burger: HTMLButtonElement;
  menu: HTMLElement;
  icono: SVGUseElement;
  enlaces: HTMLElement[];
}

function leerNodos(): MenuNodes {
  const burger = must<HTMLButtonElement>('[data-burger]');
  const menu = must('[data-menu]');
  return {
    burger,
    menu,
    icono: must<SVGUseElement>('[data-burger-icon]', burger),
    enlaces: all('a', menu),
  };
}

export function initMobileMenu(): void {
  const { burger, menu, icono, enlaces } = leerNodos();
  if (inicializados.has(burger)) return;
  inicializados.add(burger);

  let soltarFoco: (() => void) | null = null;

  function marcarAbierto(on: boolean): void {
    menu.hidden = !on;
    burger.setAttribute('aria-expanded', String(on));
    burger.setAttribute('aria-label', on ? ETIQUETA_CERRAR : ETIQUETA_ABRIR);
    icono.setAttribute('href', on ? ICONO_CERRAR : ICONO_ABRIR);
  }

  function abrir(): void {
    if (!menu.hidden) return;
    marcarAbierto(true);
    lockScroll();
    // La hamburguesa queda fuera del menú, pero forma parte del ciclo de Tab.
    soltarFoco = trapFocus(menu, [burger]);
    enlaces[0]?.focus();
  }

  function cerrar(devolverFoco = true): void {
    if (menu.hidden) return;
    soltarFoco?.();
    soltarFoco = null;
    marcarAbierto(false);
    unlockScroll();
    if (devolverFoco) burger.focus();
  }

  burger.addEventListener('click', () => {
    if (menu.hidden) abrir();
    else cerrar();
  });

  // Clic en un enlace del menú: cierra sin devolver el foco (la página navega o abre WhatsApp).
  menu.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a')) cerrar(false);
  });

  // Escape cierra y devuelve el foco a la hamburguesa.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || menu.hidden) return;
    e.preventDefault();
    cerrar();
  });

  // Pasar a escritorio con el menú abierto: cerrar sin mover el foco.
  window.matchMedia(ESCRITORIO_MQ).addEventListener('change', (e) => {
    if (e.matches) cerrar(false);
  });
}
