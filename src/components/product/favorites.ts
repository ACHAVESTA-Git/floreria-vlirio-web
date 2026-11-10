// Conecta los botones [data-fav] con el store: el clic cambia el favorito y todos los corazones se repintan.
// No guarda nada por sí mismo (eso es favoritesStore.ts).
import { all } from '../../lib/dom';
import { $favoritos, esFavorito, toggleFavorito } from './favoritesStore';

const SELECTOR = '[data-fav]';
const conectados = new WeakSet<Document>();

/** Idempotente: aunque se llame varias veces, hay un solo listener y una sola suscripción. */
export function initFavorites(): void {
  if (conectados.has(document)) return;
  conectados.add(document);

  document.addEventListener('click', onClick);
  $favoritos.listen(() => pintarFavoritos());
  pintarFavoritos();
}

function onClick(e: MouseEvent): void {
  if (!(e.target instanceof Element)) return;
  const slug = e.target.closest<HTMLElement>(SELECTOR)?.dataset.fav;
  if (slug) toggleFavorito(slug);
}

function pintarFavoritos(): void {
  all<HTMLButtonElement>(SELECTOR).forEach(sincronizar);
}

function sincronizar(boton: HTMLButtonElement): void {
  const slug = boton.dataset.fav ?? '';
  const nombre = boton.dataset.nombre ?? '';
  const on = esFavorito(slug);
  boton.setAttribute('aria-pressed', String(on));
  boton.setAttribute('aria-label', etiqueta(nombre, on));
}

function etiqueta(nombre: string, on: boolean): string {
  return on ? `Quitar ${nombre} de favoritos` : `Guardar ${nombre} en favoritos`;
}
