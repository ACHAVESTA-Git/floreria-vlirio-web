// Flechas de un carrusel horizontal (.rail con botones [data-dir]). Sin JS, el rail se desliza igual con el dedo o la rueda.
import { all, prefersReducedMotion } from '../../lib/dom';

/** Separación de respaldo si el rail aún no tiene tarjetas medidas. */
const GAP_RESPALDO_PX = 20;
const PASO_RESPALDO_PX = 300;
const conectados = new WeakSet<HTMLElement>();

/** Idempotente por contenedor: busca el .rail y las flechas dentro de `root` y las conecta una sola vez. */
export function initRail(root: HTMLElement): void {
  const rail = root.querySelector<HTMLElement>('.rail');
  if (!rail || conectados.has(root)) return;
  conectados.add(root);

  all<HTMLButtonElement>('[data-dir]', root).forEach((flecha) => {
    flecha.addEventListener('click', () => desplazar(rail, Number(flecha.dataset.dir) || 1));
  });
}

function desplazar(rail: HTMLElement, dir: number): void {
  rail.scrollBy({
    left: dir * pasoDe(rail),
    behavior: prefersReducedMotion() ? 'auto' : 'smooth',
  });
}

/** Ancho de una tarjeta más el hueco entre ellas: un clic avanza una tarjeta. */
function pasoDe(rail: HTMLElement): number {
  const tarjeta = rail.querySelector<HTMLElement>('.card');
  const gap = parseFloat(getComputedStyle(rail).columnGap) || GAP_RESPALDO_PX;
  return tarjeta ? tarjeta.offsetWidth + gap : PASO_RESPALDO_PX;
}
