/**
 * Panel "Filtrar y ordenar" del catálogo en móvil (bottom sheet).
 * Solo abre/cierra: los controles (chips, orden, precio) son los mismos elementos
 * de la página y los gestiona catalogFilters.ts. Desde 1024px el panel no es un diálogo
 * y este módulo lo cierra si estaba abierto.
 */
import { must } from '../../lib/dom';
import { lockScroll, unlockScroll } from '../../lib/scrollLock';
import { trapFocus } from '../../lib/focusTrap';

/** Desde este ancho los controles van en línea y el panel deja de ser un diálogo. */
const ESCRITORIO_MQ = '(min-width: 1024px)';

interface SheetNodes {
  abrirBtn: HTMLButtonElement;
  sheet: HTMLElement;
  cerrarBtn: HTMLButtonElement;
  scrim: HTMLElement;
  aplicarBtn: HTMLButtonElement;
  panel: HTMLElement;
}

function leerNodos(): SheetNodes {
  return {
    abrirBtn: must<HTMLButtonElement>('#open-filters'),
    sheet: must('#sheet'),
    cerrarBtn: must<HTMLButtonElement>('#sheet-close'),
    scrim: must('#sheet-scrim'),
    aplicarBtn: must<HTMLButtonElement>('#sheet-apply'),
    panel: must('#sheet-panel'),
  };
}

/** Solo es un diálogo mientras está abierto (en escritorio los controles van en línea). */
function marcarDialogo(panel: HTMLElement, on: boolean): void {
  if (on) {
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
  } else {
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
  }
}

export function initFilterSheet(): void {
  const nodos = leerNodos();
  const { abrirBtn, sheet, cerrarBtn, scrim, aplicarBtn, panel } = nodos;
  let abierto = false;
  let soltarFoco: (() => void) | null = null;

  /** Estado visible y de foco del panel; sin tocar el scroll (eso lo hacen abrir y cerrar). */
  function mostrar(on: boolean): void {
    marcarDialogo(panel, on);
    sheet.classList.toggle('on', on);
    abrirBtn.setAttribute('aria-expanded', String(on));
  }

  function abrir(): void {
    if (abierto) return;
    abierto = true;
    mostrar(true);
    lockScroll();
    soltarFoco = trapFocus(sheet);
    cerrarBtn.focus();
  }

  /** Quita el bloqueo y el atrapado de foco; el llamador decide dónde queda el foco. */
  function ocultar(): void {
    abierto = false;
    soltarFoco?.();
    soltarFoco = null;
    mostrar(false);
    unlockScroll();
  }

  function cerrar(): void {
    if (!abierto) return;
    ocultar();
    abrirBtn.focus();
  }

  abrirBtn.addEventListener('click', abrir);
  cerrarBtn.addEventListener('click', cerrar);
  scrim.addEventListener('click', cerrar);
  aplicarBtn.addEventListener('click', cerrar);

  document.addEventListener('keydown', (e) => {
    if (!abierto || e.key !== 'Escape') return;
    e.preventDefault();
    cerrar();
  });

  // Si se amplía a escritorio con el panel abierto, se cierra sin mover el foco.
  window.matchMedia(ESCRITORIO_MQ).addEventListener('change', (e) => {
    if (!e.matches || !abierto) return;
    ocultar();
  });
}
