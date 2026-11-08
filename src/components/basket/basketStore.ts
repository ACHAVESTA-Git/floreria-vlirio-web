import { atom } from 'nanostores';
import type { CatalogEntry } from '../../lib/catalog';
import { soles } from '../../config/site';

/** Canasta: slug de producto → cantidad. */
export type Canasta = Record<string, number>;
export type Catalogo = Record<string, CatalogEntry>;

const CLAVE = 'vl-canasta';

function leerStorage(): Canasta {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return {};
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object') return {};
    const out: Canasta = {};
    for (const [slug, qty] of Object.entries(data)) {
      if (typeof qty === 'number' && Number.isInteger(qty) && qty > 0) out[slug] = qty;
    }
    return out;
  } catch {
    return {};
  }
}

function guardar(canasta: Canasta): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(canasta));
  } catch {
    /* sin almacenamiento disponible: la canasta sigue en memoria */
  }
}

/** Se lee en cliente al cargar el módulo, así que no hay parpadeo de contador. */
export const $canasta = atom<Canasta>(leerStorage());
/** Mensaje para la tarjeta (solo en memoria). */
export const $cardMessage = atom<string>('');

$canasta.listen(guardar);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === CLAVE) $canasta.set(leerStorage());
  });
}

let catalogoCache: Catalogo | null = null;

/** Lee el JSON que el layout inyecta en #vl-catalog (una sola vez). */
export function getCatalogo(): Catalogo {
  if (catalogoCache) return catalogoCache;
  if (typeof document === 'undefined') return {};
  const texto = document.getElementById('vl-catalog')?.textContent;
  if (!texto) return {};
  try {
    const data: unknown = JSON.parse(texto);
    catalogoCache = data && typeof data === 'object' ? (data as Catalogo) : {};
  } catch {
    catalogoCache = {};
  }
  return catalogoCache;
}

export function precioUnitario(p: Pick<CatalogEntry, 'precio' | 'precioOferta'>): number {
  return p.precioOferta ?? p.precio;
}

export function cantidadDe(slug: string): number {
  return $canasta.get()[slug] ?? 0;
}

export function setQty(slug: string, qty: number): void {
  const canasta = { ...$canasta.get() };
  const q = Math.floor(qty);
  if (!Number.isFinite(q) || q <= 0) delete canasta[slug];
  else canasta[slug] = q;
  $canasta.set(canasta);
}

export function addItem(slug: string, n = 1): void {
  setQty(slug, cantidadDe(slug) + n);
}

export function removeItem(slug: string): void {
  setQty(slug, 0);
}

/** Número total de unidades en la canasta. */
export function getCount(): number {
  return Object.values($canasta.get()).reduce((a, b) => a + b, 0);
}

export function getTotal(catalogo: Catalogo): number {
  let total = 0;
  for (const [slug, qty] of Object.entries($canasta.get())) {
    const p = catalogo[slug];
    if (p) total += precioUnitario(p) * qty;
  }
  return total;
}

export function buildWhatsAppMessage(catalogo: Catalogo): string {
  const lineas: string[] = [];
  let total = 0;
  for (const [slug, qty] of Object.entries($canasta.get())) {
    const p = catalogo[slug];
    if (!p) continue;
    const subtotal = precioUnitario(p) * qty;
    total += subtotal;
    lineas.push(`• ${qty} × ${p.nombre} — ${soles(subtotal)}`);
  }
  const partes = ["Hola V'Lirio 🌷, quiero hacer este pedido:", ...lineas, `Total: ${soles(total)}`];
  const mensaje = $cardMessage.get().trim();
  if (mensaje) partes.push(`Mensaje para la tarjeta: "${mensaje}"`);
  return partes.join('\n');
}
