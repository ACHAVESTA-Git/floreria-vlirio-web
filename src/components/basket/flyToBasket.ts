// Animación de las flores que vuelan desde un producto hasta el ícono de la canasta.
// Solo dibuja el vuelo: el conteo de la canasta vive en basketStore y el bump en basketUi.
import { FLY_FLOWER, type FlyTipo } from '../../config/site';
import type { CatalogEntry } from '../../lib/catalog';
import { prefersReducedMotion } from '../../lib/dom';
import { bumpBasket } from './basketUi';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Piezas en el aire a la vez, entre todos los clics: evita llenar la pantalla. */
const MAX_VUELO = 12;
const MIN_PIEZAS = 3;
const VARIACION_PIEZAS = 3; // de 3 a 5 piezas por clic
const MAX_PIEZAS = 5;
const DESTELLOS = 2;
const SIMBOLO_DESTELLO = 'i-flysparkle';
/** Los que se ven raros de cabeza: solo se balancean. */
const BALANCEABLES: FlyTipo[] = ['osito', 'chocolate'];

/** Baja el punto de llegada: la pieza aterriza sobre el ícono, no encima. */
const AJUSTE_CANASTA_PX = 4;
const SEPARACION_PX = 70;
const RUIDO_SEPARACION_PX = 40;
const ALTURA_CONTROL_PX = 120;
const RUIDO_ALTURA_PX = 120;
const FRACCION_CONTROL_X = 0.25;
const PASOS = 22;
const DURACION_BASE_MS = 820;
const RUIDO_DURACION_MS = 80;
const RETRASO_PIEZA_MS = 70;
const RETRASO_DESTELLO_MS = 140;
const RETRASO_DESTELLO_PASO_MS = 110;
const GIRO_MIN_DEG = 180;
const GIRO_RUIDO_DEG = 180;
const BALANCEO_MIN_DEG = 20;
const BALANCEO_RUIDO_DEG = 20;
const ESCALA_INICIAL = 0.4;
const ESCALA_PICO = 1.15;
/** Hasta esta fracción del vuelo la pieza crece; después se encoge hacia la canasta. */
const FRACCION_PICO = 0.15;
/** Desde esta fracción la pieza se desvanece. */
const FRACCION_DESVANECE = 0.92;
const EASING = 'cubic-bezier(.45,0,.55,1)';

const SIMBOLOS: Record<FlyTipo, string> = {
  rosa: 'i-flyrose',
  tulipan: 'i-flytulip',
  girasol: 'i-sunflower',
  lirio: 'i-flylily',
  gerbera: 'i-flygerbera',
  osito: 'i-flybear',
  chocolate: 'i-flychoco',
};

let enVuelo = 0;

interface Ruta {
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

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

/** Número aleatorio entre min y max. */
function azar(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Coordenada de una curva cuadrática de Bézier en u (0 a 1): sale de `inicio`,
 * se dobla hacia `control` y llega a `fin`.
 */
function puntoBezier(u: number, inicio: number, control: number, fin: number): number {
  const v = 1 - u;
  return v * v * inicio + 2 * v * u * control + u * u * fin;
}

/** Escala de la pieza en u: crece al salir y luego se achica hacia la canasta. */
function escalaEn(u: number): number {
  if (u < FRACCION_PICO) return ESCALA_INICIAL + (u / FRACCION_PICO) * (ESCALA_PICO - ESCALA_INICIAL);
  const restante = (u - FRACCION_PICO) / (1 - FRACCION_PICO);
  return ESCALA_PICO - restante * (ESCALA_PICO - ESCALA_INICIAL);
}

function opacidadEn(u: number): number {
  return u > FRACCION_DESVANECE ? (1 - u) / (1 - FRACCION_DESVANECE) : 1;
}

/** Fotogramas de la pieza a lo largo de la curva (control en cx, cy) y con el giro dado. */
function fotogramas(ruta: Ruta, cx: number, cy: number, giro: number): Keyframe[] {
  const out: Keyframe[] = [];
  for (let k = 0; k <= PASOS; k++) {
    const u = k / PASOS;
    const x = puntoBezier(u, ruta.sx, cx, ruta.ex);
    const y = puntoBezier(u, ruta.sy, cy, ruta.ey);
    out.push({
      transform: `translate(${x}px, ${y}px) rotate(${giro * u}deg) scale(${escalaEn(u)})`,
      opacity: opacidadEn(u),
    });
  }
  return out;
}

function crearIcono(simbolo: string, esDestello: boolean): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', esDestello ? 'fly fly-spark' : 'fly');
  svg.setAttribute('viewBox', '0 0 40 40');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const use = document.createElementNS(SVG_NS, 'use');
  use.setAttribute('href', `#${simbolo}`);
  svg.append(use);
  return svg;
}

/** Giro aleatorio, en sentido horario o antihorario. */
function girar(balanceo: boolean): number {
  const sentido = Math.random() > 0.5 ? 1 : -1;
  return balanceo ? sentido * azar(BALANCEO_MIN_DEG, BALANCEO_MIN_DEG + BALANCEO_RUIDO_DEG) : sentido * azar(GIRO_MIN_DEG, GIRO_MIN_DEG + GIRO_RUIDO_DEG);
}

/**
 * Lanza una pieza por la curva. `lateral` la separa de sus vecinas (0 = centro).
 * El ruido hace que el vuelo no se vea idéntico en cada clic.
 */
function animarPieza(svg: SVGSVGElement, ruta: Ruta, lateral: number, retraso: number, balanceo: boolean): Animation {
  const separacion = lateral * SEPARACION_PX + azar(-RUIDO_SEPARACION_PX / 2, RUIDO_SEPARACION_PX / 2);
  const cx = ruta.sx + separacion + (ruta.ex - ruta.sx) * FRACCION_CONTROL_X;
  const cy = Math.min(ruta.sy, ruta.ey) - ALTURA_CONTROL_PX - azar(0, RUIDO_ALTURA_PX);
  const giro = girar(balanceo);
  return svg.animate(fotogramas(ruta, cx, cy, giro), {
    duration: azar(DURACION_BASE_MS, DURACION_BASE_MS + RUIDO_DURACION_MS),
    delay: retraso,
    easing: EASING,
    fill: 'both',
  });
}

function rutaEntre(origen: Element, destino: Element): Ruta {
  const a = origen.getBoundingClientRect();
  const b = destino.getBoundingClientRect();
  return {
    sx: a.left + a.width / 2,
    sy: a.top + a.height / 2,
    ex: b.left + b.width / 2,
    ey: b.top + b.height / 2 + AJUSTE_CANASTA_PX,
  };
}

/** Sin animación: solo el bump de la canasta y el callback, como con reduced motion. */
function terminarSinVuelo(onDone: () => void): void {
  onDone();
  bumpBasket();
}

/** Cuenta las piezas que aterrizan: al primero mece la canasta; al último late el corazón y llama a onDone. */
function contarAterrizajes(total: number, onDone: () => void): () => void {
  let aterrizadas = 0;
  return () => {
    aterrizadas++;
    if (aterrizadas === 1) bumpBasket('canasta');
    if (aterrizadas === total) {
      bumpBasket('corazon');
      onDone();
    }
  };
}

/**
 * Vuela de 3 a 5 piezas (las flores o extras del producto) y un par de destellos
 * desde `origen` hasta el ícono de la canasta del header.
 * `onDone` se llama al aterrizar la última. Con reduced motion solo hace el bump.
 */
export function flyToBasket(origen: Element, entry: CatalogEntry | undefined, onDone: () => void): void {
  const capa = document.getElementById('flyLayer');
  const destino = document.querySelector<SVGElement>('#basketBtn svg.basket');
  if (prefersReducedMotion() || !capa || !destino) {
    terminarSinVuelo(onDone);
    return;
  }

  const disponibles = MAX_VUELO - enVuelo;
  if (disponibles <= 0) {
    terminarSinVuelo(onDone);
    return;
  }

  const ruta = rutaEntre(origen, destino);
  const tipos = tiposDe(entry);
  const n = Math.min(Math.max(MIN_PIEZAS + Math.floor(Math.random() * VARIACION_PIEZAS), new Set(tipos).size), MAX_PIEZAS, disponibles);
  const lista = piezas(tipos, n);
  const destellos = Math.min(DESTELLOS, disponibles - n);
  const alAterrizar = contarAterrizajes(n, onDone);

  for (let i = 0; i < n + destellos; i++) {
    const esDestello = i >= n;
    const svg = crearIcono(esDestello ? SIMBOLO_DESTELLO : SIMBOLOS[lista[i]], esDestello);
    capa.append(svg);
    enVuelo++;

    // Los destellos siguen a las piezas por una curva intermedia, un poco después.
    const pos = esDestello ? ((i - n + 1) * (n - 1)) / (destellos + 1) : i;
    const retraso = esDestello ? RETRASO_DESTELLO_MS + (i - n) * RETRASO_DESTELLO_PASO_MS : i * RETRASO_PIEZA_MS;
    const balanceo = !esDestello && BALANCEABLES.includes(lista[i]);
    const anim = animarPieza(svg, ruta, pos - (n - 1) / 2, retraso, balanceo);

    anim.onfinish = () => {
      svg.remove();
      enVuelo--;
      if (!esDestello) alAterrizar();
    };
  }
}
