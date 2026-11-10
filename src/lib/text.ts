/** Utilidades de texto puras (sirven en el servidor y en el navegador). */

/** Minúsculas, sin tildes y sin espacios extremos: 'Salmón ' → 'salmon'. */
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Primera letra en mayúscula: 'rosado' → 'Rosado'. */
export function capitalizar(texto: string): string {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** '1 producto' / '3 productos'. */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}
