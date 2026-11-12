// Favoritos (corazones): slugs guardados, compartidos por todas las tarjetas y persistidos en localStorage.
import { atom } from 'nanostores';

/** Misma clave que usaba la versión anterior: los favoritos guardados siguen apareciendo. */
const CLAVE = 'vl-favs';
const MAX_FAVS = 100;
const MAX_LONGITUD_SLUG = 64;
const SLUG_REGEX = /^[a-z0-9-]+$/;

function esSlugValido(x: unknown): x is string {
  return typeof x === 'string' && x.length > 0 && x.length <= MAX_LONGITUD_SLUG && SLUG_REGEX.test(x);
}

function leerStorage(): string[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(CLAVE) ?? '[]');
    return Array.isArray(data) ? data.filter(esSlugValido).slice(0, MAX_FAVS) : [];
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
  if (!esSlugValido(slug)) return;
  const actuales = $favoritos.get();
  $favoritos.set(
    actuales.includes(slug)
      ? actuales.filter((s) => s !== slug)
      : [...actuales, slug].slice(-MAX_FAVS),
  );
}
