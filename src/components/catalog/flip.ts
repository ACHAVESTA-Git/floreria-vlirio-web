/**
 * Animación FLIP (First, Last, Invert, Play) para la grilla del catálogo.
 * - First: se mide la posición de cada celda visible antes de cambiar el DOM.
 * - Last: se aplica la mutación (hidden, style.order) y se mide de nuevo.
 * - Invert + Play: las celdas que se movieron parten de su posición anterior
 *   (translate) hacia su lugar nuevo; las celdas que aparecen se funden con un
 *   pequeño escalonado. Las celdas que se ocultan desaparecen al instante.
 * Usa la Web Animations API directamente. No deja estilos inline: todo son
 * animaciones que se cancelan al empezar una nueva actualización.
 */

const MOVE_DURATION_MS = 450;
const ENTER_DURATION_MS = 400;
const STAGGER_STEP_MS = 25;
const MAX_STAGGER_STEPS = 12;
const MIN_MOVE_PX = 1;
const EASING = 'cubic-bezier(.22,1,.36,1)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const CELL_SELECTOR = ':scope > [data-cell]';

const ENTER_KEYFRAMES: Keyframe[] = [
  { opacity: 0, transform: 'translateY(16px) scale(.96)' },
  { opacity: 1, transform: 'none' },
];

function getCells(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(CELL_SELECTOR));
}

function isVisible(cell: HTMLElement): boolean {
  return !cell.hasAttribute('hidden');
}

function prefersReducedMotion(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function cancelRunningAnimations(cell: HTMLElement): void {
  if (typeof cell.getAnimations !== 'function') return;
  cell.getAnimations().forEach((animation) => animation.cancel());
}

export function flipUpdate(container: HTMLElement, mutate: () => void): void {
  if (prefersReducedMotion() || typeof HTMLElement.prototype.animate !== 'function') {
    mutate();
    return;
  }

  // Cancela animaciones previas (incluidas las de celdas que se están ocultando)
  // para medir la posición real, sin transforms a medio camino.
  const cellsBefore = getCells(container);
  cellsBefore.forEach(cancelRunningAnimations);

  // FIRST
  const first = new Map<HTMLElement, DOMRect>();
  for (const cell of cellsBefore) {
    if (isVisible(cell)) first.set(cell, cell.getBoundingClientRect());
  }

  // Mutación
  mutate();

  // LAST
  const visibleNow = getCells(container).filter(isVisible);
  const movers: { cell: HTMLElement; dx: number; dy: number }[] = [];
  const entering: { cell: HTMLElement; rect: DOMRect }[] = [];

  for (const cell of visibleNow) {
    const rect = cell.getBoundingClientRect();
    const before = first.get(cell);
    if (!before) {
      entering.push({ cell, rect });
      continue;
    }
    const dx = before.left - rect.left;
    const dy = before.top - rect.top;
    if (Math.abs(dx) > MIN_MOVE_PX || Math.abs(dy) > MIN_MOVE_PX) {
      movers.push({ cell, dx, dy });
    }
  }

  // INVERT + PLAY: movimiento de las celdas que ya estaban visibles
  for (const { cell, dx, dy } of movers) {
    cell.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: 'translate(0, 0)' },
      ],
      { duration: MOVE_DURATION_MS, easing: EASING, fill: 'none' },
    );
  }

  // PLAY: aparición escalonada (en orden visual) de las celdas nuevas
  entering.sort((a, b) => a.rect.top - b.rect.top || a.rect.left - b.rect.left);
  entering.forEach(({ cell }, index) => {
    const step = Math.min(index, MAX_STAGGER_STEPS);
    cell.animate(ENTER_KEYFRAMES, {
      duration: ENTER_DURATION_MS,
      delay: step * STAGGER_STEP_MS,
      easing: EASING,
      fill: 'backwards',
    });
  });
}
