/**
 * Atrapa Tab y Shift+Tab dentro de un diálogo: al pasar del último elemento vuelve al primero y al revés.
 * Solo cuenta elementos visibles. No mueve el foco inicial (eso lo decide quien abre el panel).
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * `extras` son elementos fuera del contenedor que también entran en el ciclo (p. ej. el botón
 * de hamburguesa del header, que queda antes del menú). Devuelve la función que quita el atrapado.
 */
export function trapFocus(container: HTMLElement, extras: readonly HTMLElement[] = []): () => void {
  const onKeydown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    const lista = elementosVisibles(container, extras);
    if (lista.length === 0) return;
    ciclar(e, lista, container);
  };
  document.addEventListener('keydown', onKeydown);
  return () => document.removeEventListener('keydown', onKeydown);
}

function elementosVisibles(container: HTMLElement, extras: readonly HTMLElement[]): HTMLElement[] {
  const dentro = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)];
  return [...extras, ...dentro].filter((el) => el.getClientRects().length > 0);
}

/** Decide si el Tab sale por un extremo del ciclo; dentro del ciclo deja que el navegador avance. */
function ciclar(e: KeyboardEvent, lista: HTMLElement[], container: HTMLElement): void {
  const primero = lista[0];
  const ultimo = lista[lista.length - 1];
  const activo = document.activeElement;
  if (!primero || !ultimo) return;
  const dentro = (activo instanceof Node && container.contains(activo)) || lista.some((el) => el === activo);

  if (e.shiftKey && (activo === primero || !dentro)) {
    e.preventDefault();
    ultimo.focus();
  } else if (!e.shiftKey && (activo === ultimo || !dentro)) {
    e.preventDefault();
    primero.focus();
  }
}
