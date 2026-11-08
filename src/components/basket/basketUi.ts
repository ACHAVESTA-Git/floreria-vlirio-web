/** Animaciones del ícono de la canasta y del corazón contador (se reinician en cada llamada). */

const reducirMovimiento = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function reiniciar(el: HTMLElement | null, clase: string): void {
  if (!el) return;
  el.classList.remove(clase);
  void el.offsetWidth; // fuerza reflow para reiniciar la animación
  el.classList.add(clase);
}

/** 'canasta' = mecer el ícono; 'corazon' = latido del contador; 'ambos' por defecto. */
export function bumpBasket(parte: 'canasta' | 'corazon' | 'ambos' = 'ambos'): void {
  if (reducirMovimiento()) return;
  if (parte !== 'corazon') reiniciar(document.getElementById('basketBtn'), 'sway');
  if (parte !== 'canasta') reiniciar(document.getElementById('badge'), 'pulse');
}
