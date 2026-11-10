// Selector de cantidad (− / +) de la ficha del producto y enlace de WhatsApp que sigue la cantidad.
// No agrega a la canasta: el botón [data-add] lo atiende BasketDrawer.
import { all, must } from '../../lib/dom';
import { enlacePedido } from '../../lib/pedido';

const MIN = 1;
const MAX = 20;
const conectados = new WeakSet<HTMLElement>();

/** Idempotente por bloque de compra: cada bloque se conecta una sola vez. */
export function initProductBuy(): void {
  all<HTMLElement>('[data-compra]').forEach(iniciarCompra);
}

function iniciarCompra(compra: HTMLElement): void {
  const unitario = Number(compra.dataset.precio);
  if (conectados.has(compra) || !Number.isFinite(unitario)) return;
  conectados.add(compra);

  const nombre = compra.dataset.nombre ?? '';
  const valor = must<HTMLElement>('[data-valor]', compra);
  const menos = must<HTMLButtonElement>('[data-menos]', compra);
  const mas = must<HTMLButtonElement>('[data-mas]', compra);
  const agregar = must<HTMLButtonElement>('[data-add]', compra);
  const wa = must<HTMLAnchorElement>('[data-wa]', compra);

  let cantidad = 1;
  const pintar = (): void => {
    valor.textContent = String(cantidad);
    agregar.dataset.qty = String(cantidad);
    menos.disabled = cantidad <= MIN;
    mas.disabled = cantidad >= MAX;
    wa.href = enlacePedido(nombre, cantidad, unitario);
  };

  menos.addEventListener('click', () => {
    cantidad = Math.max(MIN, cantidad - 1);
    pintar();
  });
  mas.addEventListener('click', () => {
    cantidad = Math.min(MAX, cantidad + 1);
    pintar();
  });
}
