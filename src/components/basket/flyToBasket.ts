import { FLY_FLOWER, type FlyTipo } from '../../config/site';
import type { CatalogEntry } from '../../lib/catalog';
import { bumpBasket } from './basketUi';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_VUELO = 12;
const MAX_PIEZAS = 5;
const DESTELLOS = 2;
let enVuelo = 0;

const SIMBOLOS: Record<FlyTipo, string> = {
  rosa: 'i-flyrose',
  tulipan: 'i-flytulip',
  girasol: 'i-sunflower',
  lirio: 'i-flylily',
  gerbera: 'i-flygerbera',
  osito: 'i-flybear',
  chocolate: 'i-flychoco',
};

/** Tipos del producto en orden de protagonismo (o el fijo de la config). */
function tiposDe(entry: CatalogEntry | undefined): FlyTipo[] {
  if (FLY_FLOWER !== 'producto') return [FLY_FLOWER];
  return entry?.flores?.length ? entry.flores : ['rosa'];
}

/**
 * Elige qué vuela en cada partícula: primero un ejemplar de cada tipo distinto
 * (así se reconoce todo lo que trae el arreglo) y luego se rellena repitiendo
 * la lista, que va en orden de protagonismo.
 */
function piezas(tipos: FlyTipo[], n: number): FlyTipo[] {
  const unicos = [...new Set(tipos)];
  const out: FlyTipo[] = unicos.slice(0, n);
  for (let i = 0; out.length < n; i++) out.push(tipos[i % tipos.length]);
  // Mezcla suave para que el osito o el chocolate no salgan siempre al final.
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Vuela de 3 a 5 piezas (las flores o extras del producto) y un par de destellos
 * desde `origen` hasta el ícono de la canasta del header.
 * `onDone` se llama al aterrizar la última. Con reduced motion solo hace el bump.
 */
export function flyToBasket(origen: Element, entry: CatalogEntry | undefined, onDone: () => void): void {
  const capa = document.getElementById('flyLayer');
  const destino = document.querySelector<SVGElement>('#basketBtn svg.basket');
  const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reducir || !capa || !destino) {
    onDone();
    bumpBasket();
    return;
  }

  const disponibles = MAX_VUELO - enVuelo;
  if (disponibles <= 0) {
    onDone();
    bumpBasket();
    return;
  }

  const a = origen.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  const sx = a.left + a.width / 2;
  const sy = a.top + a.height / 2;
  const ex = b.left + b.width / 2;
  const ey = b.top + b.height / 2 + 4;

  const tipos = tiposDe(entry);
  const unicos = new Set(tipos).size;
  const n = Math.min(Math.max(3 + Math.floor(Math.random() * 3), unicos), MAX_PIEZAS, disponibles);
  const lista = piezas(tipos, n);
  const destellos = Math.min(DESTELLOS, disponibles - n);
  let aterrizadas = 0;

  for (let i = 0; i < n + destellos; i++) {
    const esDestello = i >= n;
    const href = `#${esDestello ? 'i-flysparkle' : SIMBOLOS[lista[i]]}`;
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', esDestello ? 'fly fly-spark' : 'fly');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', href);
    svg.append(use);
    capa.append(svg);
    enVuelo++;

    // Curva Bézier cuadrática: sube y se abre hacia un lado, luego cae en la canasta.
    // Los destellos siguen a las piezas por una curva intermedia, un poco después.
    const pos = esDestello ? ((i - n + 1) * (n - 1)) / (destellos + 1) : i;
    const separacion = (pos - (n - 1) / 2) * 70 + (Math.random() * 40 - 20);
    const cx = sx + separacion + (ex - sx) * 0.25;
    const cy = Math.min(sy, ey) - 120 - Math.random() * 120;
    // El osito y el chocolate apenas se balancean: girando de cabeza se ven raros.
    const balanceo = !esDestello && (lista[i] === 'osito' || lista[i] === 'chocolate');
    const giro = (Math.random() > 0.5 ? 1 : -1) * (balanceo ? 20 + Math.random() * 20 : 180 + Math.random() * 180);

    const pasos = 22;
    const frames: Keyframe[] = [];
    for (let k = 0; k <= pasos; k++) {
      const u = k / pasos;
      const x = (1 - u) * (1 - u) * sx + 2 * (1 - u) * u * cx + u * u * ex;
      const y = (1 - u) * (1 - u) * sy + 2 * (1 - u) * u * cy + u * u * ey;
      const escala = u < 0.15 ? 0.4 + (u / 0.15) * 0.75 : 1.15 - ((u - 0.15) / 0.85) * 0.75;
      frames.push({
        transform: `translate(${x}px, ${y}px) rotate(${giro * u}deg) scale(${escala})`,
        opacity: u > 0.92 ? (1 - u) / 0.08 : 1,
      });
    }

    const anim = svg.animate(frames, {
      duration: 820 + Math.random() * 80,
      delay: esDestello ? 140 + (i - n) * 110 : i * 70,
      easing: 'cubic-bezier(.45,0,.55,1)',
      fill: 'both',
    });

    anim.onfinish = () => {
      svg.remove();
      enVuelo--;
      if (esDestello) return;
      aterrizadas++;
      if (aterrizadas === 1) bumpBasket('canasta');
      if (aterrizadas === n) {
        bumpBasket('corazon');
        onDone();
      }
    };
  }
}
