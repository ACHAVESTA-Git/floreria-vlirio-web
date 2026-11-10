// Mensaje y enlace de WhatsApp de un pedido de un producto. Funciones puras: las usan la página (servidor) y el selector de cantidad (navegador).
import { soles, waLink } from '../config/site';

/** Mismo texto al cargar la página y al cambiar la cantidad: el enlace nunca cambia de redacción. */
export function mensajePedido(nombre: string, cantidad: number, unitario: number): string {
  const total = soles(unitario * cantidad);
  return `Hola V'Lirio 🌷, quiero pedir:\n• ${cantidad} × ${nombre} — ${total}\nTotal: ${total}`;
}

export function enlacePedido(nombre: string, cantidad: number, unitario: number): string {
  return waLink(mensajePedido(nombre, cantidad, unitario));
}
