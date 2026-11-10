/**
 * Textos y cálculos de la canasta sin tocar el DOM: etiquetas, precios de cada línea y el
 * resumen del pedido. El estado viene de basketStore; aquí solo se formatea.
 */
import { soles, waLink } from '../../config/site';
import type { CatalogEntry } from '../../lib/catalog';
import { $canasta, buildWhatsAppMessage, getTotal, precioUnitario, type Catalogo } from './basketStore';

/** Cuántas sugerencias del tipo "¿Le agregas un detalle?" se muestran como máximo. */
const UPSELL_MAX = 3;
const CATEGORIA_UPSELL = 'extras';

export type AccionCantidad = 'menos' | 'mas';

export interface ResumenPedido {
  total: string;
  /** Enlace de WhatsApp con el pedido, o null si la canasta está vacía. */
  enlace: string | null;
}

export function textoAccion(accion: AccionCantidad): string {
  return accion === 'menos' ? '−' : '+';
}

export function ariaAccion(accion: AccionCantidad, nombre: string): string {
  return accion === 'menos' ? `Quitar uno de ${nombre}` : `Agregar uno más de ${nombre}`;
}

export function ariaQuitar(nombre: string): string {
  return `Quitar ${nombre} de la canasta`;
}

/** Clave estable para volver a enfocar el mismo control después de reconstruir la lista. */
export function claveAccion(slug: string, accion: string): string {
  return `${slug}:${accion}`;
}

export function textoPrecioUnitario(p: CatalogEntry): string {
  return `${soles(precioUnitario(p))} c/u`;
}

export function textoUpsell(p: CatalogEntry): string {
  return `+ ${p.nombre} · ${soles(precioUnitario(p))}`;
}

/** Productos sugeridos al abrir la canasta: los de la categoría de extras, en orden del catálogo. */
export function sugerenciasUpsell(catalogo: Catalogo): [string, CatalogEntry][] {
  return Object.entries(catalogo)
    .filter(([, p]) => p.categoria === CATEGORIA_UPSELL)
    .slice(0, UPSELL_MAX);
}

export function resumenPedido(catalogo: Catalogo): ResumenPedido {
  const total = soles(getTotal(catalogo));
  const vacia = Object.keys($canasta.get()).length === 0;
  return { total, enlace: vacia ? null : waLink(buildWhatsAppMessage(catalogo)) };
}
