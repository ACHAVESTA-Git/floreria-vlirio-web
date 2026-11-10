// Pinta la cuenta regresiva de las promos (elementos [data-cd="dias|horas|min"]) y la refresca. No calcula fechas: eso es lib/countdown.ts.
import { desglosar, proximoCierre, segundosHasta } from '../../lib/countdown';

/** Refrescar cada 30 s basta: la cuenta muestra minutos, no segundos. */
const REFRESCO_MS = 30000;
const conectados = new WeakSet<HTMLElement>();

/** Idempotente por contenedor: un solo intervalo aunque se llame dos veces. */
export function initOffersCountdown(root: HTMLElement): void {
  if (conectados.has(root)) return;
  conectados.add(root);

  pintar(root);
  window.setInterval(() => pintar(root), REFRESCO_MS);
}

function pintar(root: HTMLElement): void {
  const ahora = new Date();
  const { dias, horas, min } = desglosar(segundosHasta(proximoCierre(ahora), ahora));
  const valores: Record<string, number> = { dias, horas, min };
  for (const [clave, valor] of Object.entries(valores)) {
    const el = root.querySelector<HTMLElement>(`[data-cd="${clave}"]`);
    if (el) el.textContent = String(valor).padStart(2, '0');
  }
}
