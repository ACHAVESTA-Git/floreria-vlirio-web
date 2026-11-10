// Favoritos (corazones): slugs guardados, compartidos por todas las tarjetas y persistidos en localStorage.
import { atom } from 'nanostores';

/** Misma clave que usaba la versión anterior: los favoritos guardados siguen apareciendo. */
const CLAVE = 'vl-favs';

function esTexto(x: unknown): x is string {
  return typeof x === 'string';
}

function leerStorage(): string[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(data) ? data.filter(esTexto) : [];
  } catch {
    return [];
  }
}

function guardar(favs: readonly string[]): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(favs));
  } catch {
    /* sin almacenamiento: el favorito solo dura la página */
  }
}

/** Se lee al cargar el módulo, así que el corazón ya sale marcado sin parpadeo. */
export const $favoritos = atom<string[]>(leerStorage());

$favoritos.listen(guardar);

export function esFavorito(slug: string): boolean {
  return $favoritos.get().includes(slug);
}

export function toggleFavorito(slug: string): void {
  const actuales = $favoritos.get();
  $favoritos.set(actuales.includes(slug) ? actuales.filter((s) => s !== slug) : [...actuales, slug]);
}
