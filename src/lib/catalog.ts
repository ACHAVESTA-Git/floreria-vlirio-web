import { getCollection, type CollectionEntry } from 'astro:content';
import { getImage } from 'astro:assets';

export type Producto = CollectionEntry<'productos'>;

/** Todos los productos, con destacados primero en el orden del JSON. */
export async function getProductos(): Promise<Producto[]> {
  const all = await getCollection('productos');
  return all.sort((a, b) => a.id.localeCompare(b.id));
}

const ORDEN_DESTACADOS = ['resplandor-dorado', 'rose-rubi', 'campo-amanecer', 'dulces-primaveras', 'ternura-de-amor', 'edeliz', 'rose-energy', 'dulce-pasion'];

export async function getDestacados(): Promise<Producto[]> {
  const all = await getProductos();
  return all
    .filter((p) => p.data.destacado)
    .sort((a, b) => ORDEN_DESTACADOS.indexOf(a.id) - ORDEN_DESTACADOS.indexOf(b.id));
}

export async function getOfertas(): Promise<Producto[]> {
  const all = await getProductos();
  return all.filter((p) => p.data.precioOferta !== undefined);
}

export interface CatalogEntry {
  nombre: string;
  precio: number;
  precioOferta?: number;
  flor: 'girasol' | 'tulipan' | 'rosa';
  categoria: string;
  img: string; // miniatura webp 160px
}

/** Mapa slug → datos mínimos que la canasta necesita en el navegador. */
export async function getCatalogMap(): Promise<Record<string, CatalogEntry>> {
  const all = await getProductos();
  const entries = await Promise.all(
    all.map(async (p) => {
      const thumb = await getImage({ src: p.data.imagen, width: 160, format: 'webp' });
      const e: CatalogEntry = {
        nombre: p.data.nombre,
        precio: p.data.precio,
        precioOferta: p.data.precioOferta,
        flor: p.data.flor,
        categoria: p.data.categoria,
        img: thumb.src,
      };
      return [p.id, e] as const;
    }),
  );
  return Object.fromEntries(entries);
}

/** Precio vigente (con oferta si existe). */
export const precioFinal = (p: { precio: number; precioOferta?: number }): number => p.precioOferta ?? p.precio;
