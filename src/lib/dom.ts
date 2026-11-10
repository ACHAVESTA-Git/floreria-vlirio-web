/**
 * Helpers de DOM compartidos por todos los scripts del navegador.
 * Úsalos en vez de redefinir `must`/`all` en cada módulo.
 */

/** Devuelve el elemento o lanza un error claro si falta (evita `!` y nulos en closures). */
export function must<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`[vlirio] Falta el elemento ${selector}`);
  return el;
}

/** Todos los elementos que coinciden, como array (no NodeList). */
export function all<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** true si el usuario pidió reducir el movimiento. Consultar en cada animación, no cachear. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
