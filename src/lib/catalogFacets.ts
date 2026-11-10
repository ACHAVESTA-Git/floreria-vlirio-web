/**
 * Facetas del catálogo: orden por relevancia, conteos por ocasión y color, límites
 * del precio y categorías con productos. Funciones puras sobre la colección: no
 * leen la URL ni el DOM.
 */
import { CATEGORIAS, OCASIONES } from '../config/site';
import { COLOR_SLUGS, colorNombre, colorSlug } from './colors';
import { normalizar } from './text';
import { precioFinal, type Producto } from './catalog';

export type CategoriaCatalogo = (typeof CATEGORIAS)[number];

/** Una opción de filtro (ocasión o color) con cuántos productos la tienen. */
export interface Faceta {
  slug: string;
  nombre: string;
  n: number;
}

export interface RangoPrecio {
  min: number | null;
  max: number | null;
  nombre: string;
}

export interface LimitesPrecio {
  min: number;
  max: number;
}

/** Datos de una tarjeta de la grilla; los strings son los que van en los data-* de la celda. */
export interface CeldaCatalogo {
  producto: Producto;
  categoria: string;
  ocasiones: string;
  colores: string;
  precio: number;
  rel: number;
}

/** El slider avanza y redondea en múltiplos de 10 soles para que los bordes sean números redondos. */
const MULTIPLO_PRECIO = 10;

/** Rangos de un toque para móvil y tablet (en escritorio el slider hace ese trabajo). */
export const RANGOS_PRECIO: readonly RangoPrecio[] = [
  { min: null, max: 50, nombre: 'Hasta S/50' },
  { min: 50, max: 100, nombre: 'S/50 – S/100' },
  { min: 100, max: 150, nombre: 'S/100 – S/150' },
  { min: 150, max: null, nombre: 'Más de S/150' },
];

const tieneOferta = (p: Producto): boolean =>
  p.data.precioOferta !== undefined && p.data.precioOferta < p.data.precio;

const porNombre = (a: Producto, b: Producto): number =>
  a.data.nombre.localeCompare(b.data.nombre, 'es');

/** Colores del producto sin repetir, en minúsculas y sin tildes (para el atributo data-color). */
function coloresNormalizados(p: Producto): string[] {
  return [...new Set(p.data.colores.map(normalizar))];
}

/**
 * Destacados primero (en su orden), luego los que tienen oferta y luego el resto,
 * ambos grupos por nombre. Así "Más pedidos" muestra lo más vendido arriba.
 */
export function ordenarPorRelevancia(productos: Producto[], destacados: Producto[]): Producto[] {
  const idsDestacados = new Set(destacados.map((p) => p.id));
  const restantes = productos.filter((p) => !idsDestacados.has(p.id));
  const ofertas = restantes.filter(tieneOferta).sort(porNombre);
  const resto = restantes.filter((p) => !tieneOferta(p)).sort(porNombre);
  return [...destacados, ...ofertas, ...resto];
}

/** Celdas de la grilla en orden de relevancia, con los datos que el filtrado necesita. */
export function celdasCatalogo(productos: Producto[], destacados: Producto[]): CeldaCatalogo[] {
  return ordenarPorRelevancia(productos, destacados).map((producto, rel) => ({
    producto,
    categoria: producto.data.categoria,
    ocasiones: producto.data.ocasiones.join(' '),
    colores: coloresNormalizados(producto).join(' '),
    precio: precioFinal(producto.data),
    rel,
  }));
}

/** Ocasiones con al menos un producto, con su conteo. */
export function facetasOcasion(productos: Producto[]): Faceta[] {
  return OCASIONES.map((o) => ({
    slug: o.slug,
    nombre: o.nombre,
    n: productos.filter((p) => p.data.ocasiones.includes(o.slug)).length,
  })).filter((f) => f.n > 0);
}

/** Colores con token CSS (ver colors.ts) que tienen al menos un producto. */
export function facetasColor(productos: Producto[]): Faceta[] {
  return COLOR_SLUGS.map((slug) => ({
    slug,
    nombre: colorNombre(slug),
    n: productos.filter((p) => p.data.colores.some((c) => colorSlug(c) === slug)).length,
  })).filter((f) => f.n > 0);
}

/** Límites del slider: el precio más bajo y el más alto, redondeados a múltiplos de 10. */
export function limitesPrecio(productos: Producto[]): LimitesPrecio {
  const precios = productos.map((p) => precioFinal(p.data));
  return {
    min: Math.floor(Math.min(...precios) / MULTIPLO_PRECIO) * MULTIPLO_PRECIO,
    max: Math.ceil(Math.max(...precios) / MULTIPLO_PRECIO) * MULTIPLO_PRECIO,
  };
}

/** Categorías de config/site.ts que tienen productos (las vacías no se muestran). */
export function categoriasConProductos(productos: Producto[]): CategoriaCatalogo[] {
  return CATEGORIAS.filter((c) => productos.some((p) => p.data.categoria === c.slug));
}
