import { FLY_FLOWER } from '../../config/site';
import type { CatalogEntry } from '../../lib/catalog';
import { bumpBasket } from './basketUi';

const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_VUELO = 8;
let enVuelo = 0;

function simbolo(entry: CatalogEntry | undefined): string {
  const flor = FLY_FLOWER === 'producto' ? (entry?.flor ?? 'rosa') : FLY_FLOWER;
  switch (flor) {
    case 'tulipan':
      return 'i-flytulip';
    case 'rosa':
      return 'i-flyrose';
    default:
      return 'i-sunflower';
  }
}

/**
 * Vuela de 3 a 5 flores desde `origen` hasta el ícono de la canasta del header.
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

  const n = Math.min(3 + Math.floor(Math.random() * 3), disponibles);
  const href = `#${simbolo(entry)}`;
  let aterrizadas = 0;

  for (let i = 0; i < n; i++) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', 'fly');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(SVG_NS, 'use');
    use.setAttribute('href', href);
    svg.append(use);
    capa.append(svg);
    enVuelo++;

    // Curva Bézier cuadrática: sube y se abre hacia un lado, luego cae en la canasta.
    const separacion = (i - (n - 1) / 2) * 70 + (Math.random() * 40 - 20);
    const cx = sx + separacion + (ex - sx) * 0.25;
    const cy = Math.min(sy, ey) - 120 - Math.random() * 120;
    const giro = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 180);

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
      delay: i * 70,
      easing: 'cubic-bezier(.45,0,.55,1)',
      fill: 'both',
    });

    anim.onfinish = () => {
      svg.remove();
      enVuelo--;
      aterrizadas++;
      if (aterrizadas === 1) bumpBasket('canasta');
      if (aterrizadas === n) {
        bumpBasket('corazon');
        onDone();
      }
    };
  }
}
