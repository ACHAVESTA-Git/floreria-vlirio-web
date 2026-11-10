/**
 * Panel "Filtrar y ordenar" del catálogo en móvil (bottom sheet).
 * Solo abre/cierra: los controles (chips, orden, precio) son los mismos elementos
 * de la página y los gestiona catalogFilters.ts. Desde 760px el panel no existe
 * visualmente (display: contents en CSS) y este módulo no hace nada útil.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function must<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[catalogo] Falta #${id} para el panel de filtros`);
  return el as T;
}

export function initFilterSheet(): void {
  const abrirBtn = must<HTMLButtonElement>('open-filters');
  const sheet = must<HTMLElement>('sheet');
  const cerrarBtn = must<HTMLButtonElement>('sheet-close');
  const scrim = must<HTMLElement>('sheet-scrim');
  const aplicarBtn = must<HTMLButtonElement>('sheet-apply');

  let abierto = false;

  function abrir(): void {
    if (abierto) return;
    abierto = true;
    sheet.classList.add('on');
    abrirBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    cerrarBtn.focus();
  }

  function cerrar(): void {
    if (!abierto) return;
    abierto = false;
    sheet.classList.remove('on');
    abrirBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    abrirBtn.focus();
  }

  abrirBtn.addEventListener('click', abrir);
  cerrarBtn.addEventListener('click', cerrar);
  scrim.addEventListener('click', cerrar);
  aplicarBtn.addEventListener('click', cerrar);

  document.addEventListener('keydown', (e) => {
    if (!abierto) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      cerrar();
      return;
    }
    if (e.key !== 'Tab') return;

    // Foco atrapado dentro del panel (solo elementos visibles)
    const foco = [...sheet.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
    const primero = foco[0];
    const ultimo = foco[foco.length - 1];
    if (!primero || !ultimo) {
      e.preventDefault();
      cerrarBtn.focus();
      return;
    }
    const activo = document.activeElement;
    const dentro = activo instanceof Node && sheet.contains(activo);
    if (e.shiftKey && (activo === primero || !dentro)) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && (activo === ultimo || !dentro)) {
      e.preventDefault();
      primero.focus();
    }
  });

  // Si se amplía a escritorio con el panel abierto, se cierra sin mover el foco.
  window.matchMedia('(min-width: 760px)').addEventListener('change', (e) => {
    if (!e.matches || !abierto) return;
    abierto = false;
    sheet.classList.remove('on');
    abrirBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
}
