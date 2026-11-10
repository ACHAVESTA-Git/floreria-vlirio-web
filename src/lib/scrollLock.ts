/**
 * Bloqueo del scroll de la página mientras hay un panel abierto (canasta, menú, filtros).
 * Con contador de referencias: solo el primer lock bloquea y solo el último unlock libera,
 * así dos paneles abiertos a la vez no se pisan. También detiene Lenis si ya existe.
 */
import { getLenis } from './smoothScroll';

/** Paneles abiertos que pidieron el bloqueo. Estado de módulo a propósito: es la fuente única del bloqueo. */
let bloqueos = 0;

/** Suma un bloqueo; el primero congela el scroll. */
export function lockScroll(): void {
  bloqueos += 1;
  if (bloqueos === 1) congelar(true);
}

/** Resta un bloqueo; solo cuando no queda ninguno vuelve a scrollear. */
export function unlockScroll(): void {
  if (bloqueos === 0) return;
  bloqueos -= 1;
  if (bloqueos === 0) congelar(false);
}

/**
 * overflow no basta con Lenis: su rueda sigue moviendo la página, así que también se
 * detiene. Si Lenis aún no cargó, solo aplica overflow (no se fuerza su carga aquí).
 */
function congelar(activo: boolean): void {
  document.documentElement.style.overflow = activo ? 'hidden' : '';
  const lenis = getLenis();
  if (!lenis) return;
  if (activo) lenis.stop();
  else lenis.start();
}
