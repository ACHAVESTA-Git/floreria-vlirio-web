/**
 * Estado de los filtros del catálogo y su traducción a la URL. Lógica pura: recibe
 * datos (URLSearchParams, listas de valores válidos, datos de celda) y devuelve
 * datos. No toca el DOM ni window.location.
 */

export type Orden = 'relevancia' | 'menor' | 'mayor';

export interface Estado {
  categoria: string;
  ocasiones: Set<string>;
  colores: Set<string>;
  orden: Orden;
  min: number | null;
  max: number | null;
}

/** Valores que acepta la página. El orden de cada lista es el orden en que van en la URL. */
export interface ValoresValidos {
  categorias: readonly string[];
  ocasiones: readonly string[];
  colores: readonly string[];
}

/** Datos de una celda, leídos del dataset una sola vez (no cambian al filtrar). */
export interface DatosCelda {
  cat: string;
  ocasiones: readonly string[];
  colores: readonly string[];
  precio: number;
  rel: number;
}

export const TODOS = 'todos';
const ORDENES: readonly Orden[] = ['relevancia', 'menor', 'mayor'];
const ORDEN_INICIAL: Orden = 'relevancia';

export function estadoInicial(): Estado {
  return { categoria: TODOS, ocasiones: new Set(), colores: new Set(), orden: ORDEN_INICIAL, min: null, max: null };
}

/** Copia independiente: los Set se copian para que cambiar la copia no toque el original. */
export function clonar(e: Estado): Estado {
  return { ...e, ocasiones: new Set(e.ocasiones), colores: new Set(e.colores) };
}

/** Quita el valor si ya está y lo pone si no (casillas y muestras de color). */
export function alternarValor(conjunto: Set<string>, valor: string): void {
  if (conjunto.has(valor)) conjunto.delete(valor);
  else conjunto.add(valor);
}

export function isOrden(v: string | null): v is Orden {
  return v !== null && (ORDENES as readonly string[]).includes(v);
}

/** Límite de precio: vacío o inválido => null (sin límite). */
export function parseLimite(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Lee una lista separada por comas (?ocasion=amor,aniversario) y se queda con los valores válidos. */
function leerLista(params: URLSearchParams, clave: string, validos: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const raw of params.getAll(clave)) {
    for (const parte of raw.split(',')) {
      const slug = parte.trim();
      if (validos.includes(slug)) out.add(slug);
    }
  }
  return out;
}

/** Estado desde la URL. Lo que no es válido vuelve a su valor inicial. */
export function leerEstado(params: URLSearchParams, validos: ValoresValidos): Estado {
  const cat = params.get('categoria') ?? TODOS;
  const ordenRaw = params.get('orden');
  return {
    categoria: cat === TODOS || validos.categorias.includes(cat) ? cat : TODOS,
    ocasiones: leerLista(params, 'ocasion', validos.ocasiones),
    colores: leerLista(params, 'color', validos.colores),
    orden: isOrden(ordenRaw) ? ordenRaw : ORDEN_INICIAL,
    min: parseLimite(params.get('min')),
    max: parseLimite(params.get('max')),
  };
}

/**
 * Query de la URL con '?' o '' si el estado es el inicial. Las ocasiones y colores
 * salen en el orden de `validos` (no en el de los clics) para que la URL sea estable.
 */
export function serializarEstado(e: Estado, validos: ValoresValidos): string {
  const partes: string[] = [];
  if (e.categoria !== TODOS) partes.push(`categoria=${encodeURIComponent(e.categoria)}`);
  const oc = validos.ocasiones.filter((s) => e.ocasiones.has(s));
  if (oc.length > 0) partes.push(`ocasion=${oc.map(encodeURIComponent).join(',')}`);
  const col = validos.colores.filter((s) => e.colores.has(s));
  if (col.length > 0) partes.push(`color=${col.map(encodeURIComponent).join(',')}`);
  if (e.orden !== ORDEN_INICIAL) partes.push(`orden=${e.orden}`);
  if (e.min !== null) partes.push(`min=${e.min}`);
  if (e.max !== null) partes.push(`max=${e.max}`);
  return partes.length > 0 ? `?${partes.join('&')}` : '';
}

/** true si hay un límite de precio (mínimo o máximo). */
export function tienePrecio(e: Estado): boolean {
  return e.min !== null || e.max !== null;
}

/** true si algo distinto del estado inicial está aplicado (muestra "Limpiar"). */
export function hayFiltros(e: Estado): boolean {
  return e.categoria !== TODOS || e.ocasiones.size > 0 || e.colores.size > 0 || e.orden !== ORDEN_INICIAL || tienePrecio(e);
}

/** Número para el badge del botón Filtros: ocasiones + colores + 1 si hay precio. */
export function contarActivos(e: Estado): number {
  return e.ocasiones.size + e.colores.size + (tienePrecio(e) ? 1 : 0);
}

/** Si hay valores seleccionados, la celda debe tener al menos uno de ellos. */
function coincideLista(valoresCelda: readonly string[], seleccion: Set<string>): boolean {
  return seleccion.size === 0 || valoresCelda.some((v) => seleccion.has(v));
}

function coincidePrecio(precio: number, e: Estado): boolean {
  return (e.min === null || precio >= e.min) && (e.max === null || precio <= e.max);
}

/** true si la celda debe verse con este estado. */
export function coincide(d: DatosCelda, e: Estado): boolean {
  return (
    (e.categoria === TODOS || d.cat === e.categoria) &&
    coincideLista(d.ocasiones, e.ocasiones) &&
    coincideLista(d.colores, e.colores) &&
    coincidePrecio(d.precio, e)
  );
}

function porRelevancia(a: DatosCelda, b: DatosCelda): number {
  return a.rel - b.rel;
}

/** Comparador para ordenar celdas. Si el precio empata, manda la relevancia. */
export function comparador(orden: Orden): (a: DatosCelda, b: DatosCelda) => number {
  if (orden === 'relevancia') return porRelevancia;
  const direccion = orden === 'menor' ? 1 : -1;
  return (a, b) => (a.precio - b.precio) * direccion || porRelevancia(a, b);
}
