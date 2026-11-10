/**
 * Pinta en el drawer las filas de la canasta, el total, el enlace de WhatsApp y las sugerencias.
 * Lee el estado de basketStore y actualiza los nodos recibidos; no escucha eventos.
 */
import type { CatalogEntry } from '../../lib/catalog';
import type { BasketNodes } from './basketNodes';
import { $canasta, getCatalogo, type Catalogo } from './basketStore';
import {
  ariaAccion,
  ariaQuitar,
  claveAccion,
  resumenPedido,
  sugerenciasUpsell,
  textoAccion,
  textoPrecioUnitario,
  textoUpsell,
  type AccionCantidad,
} from './basketText';

export function renderItems(nodos: BasketNodes): void {
  const filas = filasDeCanasta(getCatalogo());
  nodos.items.replaceChildren(...filas);
  nodos.items.hidden = filas.length === 0;
  nodos.vacio.hidden = filas.length > 0;
}

export function renderTotales(nodos: BasketNodes): void {
  const resumen = resumenPedido(getCatalogo());
  nodos.total.textContent = resumen.total;
  if (resumen.enlace === null) desactivarPedido(nodos.checkout);
  else activarPedido(nodos.checkout, resumen.enlace);
}

export function renderUpsell(nodos: BasketNodes): void {
  const sugerencias = sugerenciasUpsell(getCatalogo());
  nodos.upsellOpts.replaceChildren(...sugerencias.map(([slug, p]) => crearOpcionUpsell(slug, p)));
  nodos.upsell.hidden = sugerencias.length === 0;
}

function filasDeCanasta(catalogo: Catalogo): HTMLLIElement[] {
  const filas: HTMLLIElement[] = [];
  for (const [slug, qty] of Object.entries($canasta.get())) {
    const p = catalogo[slug];
    if (p) filas.push(crearFila(slug, qty, p));
  }
  return filas;
}

function desactivarPedido(checkout: HTMLAnchorElement): void {
  checkout.removeAttribute('href');
  checkout.setAttribute('aria-disabled', 'true');
  checkout.classList.add('off');
}

function activarPedido(checkout: HTMLAnchorElement, enlace: string): void {
  checkout.href = enlace;
  checkout.removeAttribute('aria-disabled');
  checkout.classList.remove('off');
}

function crearFila(slug: string, qty: number, p: CatalogEntry): HTMLLIElement {
  const li = document.createElement('li');
  li.className = 'item';
  li.append(crearImagen(p), crearInfo(slug, p), crearControlCantidad(slug, qty, p.nombre));
  return li;
}

function crearImagen(p: CatalogEntry): HTMLImageElement {
  const img = document.createElement('img');
  img.src = p.img;
  img.alt = p.nombre;
  img.width = 64;
  img.height = 64;
  img.loading = 'lazy';
  img.decoding = 'async';
  return img;
}

function crearInfo(slug: string, p: CatalogEntry): HTMLDivElement {
  const info = document.createElement('div');
  info.className = 'info';
  const nombre = document.createElement('b');
  nombre.textContent = p.nombre;
  const precio = document.createElement('small');
  precio.textContent = textoPrecioUnitario(p);
  info.append(nombre, precio, crearBotonQuitar(slug, p.nombre));
  return info;
}

function crearBotonQuitar(slug: string, nombre: string): HTMLButtonElement {
  const quitar = document.createElement('button');
  quitar.type = 'button';
  quitar.className = 'quitar';
  quitar.textContent = 'Quitar';
  quitar.dataset.slug = slug;
  quitar.dataset.accion = 'quitar';
  quitar.dataset.key = claveAccion(slug, 'quitar');
  quitar.setAttribute('aria-label', ariaQuitar(nombre));
  return quitar;
}

function crearControlCantidad(slug: string, qty: number, nombre: string): HTMLDivElement {
  const control = document.createElement('div');
  control.className = 'qty';
  const cantidad = document.createElement('span');
  cantidad.textContent = String(qty);
  control.append(crearBotonCantidad(slug, 'menos', nombre), cantidad, crearBotonCantidad(slug, 'mas', nombre));
  return control;
}

function crearBotonCantidad(slug: string, accion: AccionCantidad, nombre: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.textContent = textoAccion(accion);
  b.dataset.slug = slug;
  b.dataset.accion = accion;
  b.dataset.key = claveAccion(slug, accion);
  b.setAttribute('aria-label', ariaAccion(accion, nombre));
  return b;
}

function crearOpcionUpsell(slug: string, p: CatalogEntry): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.add = slug;
  const span = document.createElement('span');
  span.textContent = textoUpsell(p);
  b.append(span);
  return b;
}
