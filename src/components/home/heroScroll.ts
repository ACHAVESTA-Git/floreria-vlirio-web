// Animación de scroll del hero: tallos, mensaje, fotos y CTA aparecen según el avance (GSAP + ScrollTrigger).
// Con reduced-motion, o si GSAP no carga, el hero pasa a .static y se ve completo. Arranca cuando el navegador está libre para no bloquear el primer render.
import { all, prefersReducedMotion } from '../../lib/dom';
import { initSmoothScroll, type Gsap, type SmoothScrollRefs } from '../../lib/smoothScroll';

type Timeline = ReturnType<Gsap['timeline']>;

interface Piezas {
  garden: SVGSVGElement;
  intro: HTMLElement;
  hint: HTMLElement;
  cta: HTMLElement;
  stems: SVGRectElement[];
  leaves: SVGPathElement[];
  bulbs: SVGGElement[];
  lines: HTMLElement[];
  photos: HTMLElement[];
  hp5: HTMLElement | null;
  petals: HTMLElement[];
}

const SELECTOR_HERO = '#inicio.hero';
const conectados = new WeakSet<HTMLElement>();

/** Espera máxima al navegador libre; si no hay requestIdleCallback, se arranca tras el retraso. */
const IDLE_TIMEOUT_MS = 1500;
const RETRASO_SIN_IDLE_MS = 300;
/** Segundos que la animación va detrás del scroll: suaviza los saltos de la rueda. */
const SCRUB_S = 1;

// Posiciones en la línea de tiempo (segundos): 0-35% tallos, 35-65% mensaje, 65-100% fotos y CTA.
const POS_INTRO_SALE = 0.3;
const POS_HOJAS = 0.6;
const POS_JARDIN_SALE = 3.6;
const POS_MENSAJE = 3.8;
const POS_FOTOS = 6.6;
const POS_CTA = 7.6;
const POS_FIN_PETALOS = 8;

const DURACION_TALLO_S = 3;
const DURACION_HOJA_S = 2.4;
const DURACION_PETALO_S = 6;
const ESCALONADO = { each: 0.12, from: 'center' as const };

const ESCALA_TALLO_INICIAL = 0.35;
const ESCALA_HOJA_INICIAL = 0.3;
const ESCALA_BULBO_INICIAL = 0.55;
/** Fracción de la altura del tulipán que el bulbo baja al inicio. */
const FRACCION_BAJADA_BULBO = 0.65;
const ROTACION_TULIPAN_DEG = 3;
/** Índice del tulipán central (el más alto del arco). */
const CENTRO_TULIPANES = 3;

const DESPLAZAMIENTO_FOTO_PX = 320;
const CAIDA_FOTO_PX = 60;
const INCLINACION_FOTO_DEG = 12;
const ROTACION_FOTOS_DEG = [-6, 4, 6, -4, 0];
const DESPLAZAMIENTO_HP5_PX = 260;

const CAIDA_INTRO_PX = 20;
const JARDIN_SUBE_PX = 60;
const JARDIN_BAJA_PX = 80;
const JARDIN_ESCALA_FIN = 0.92;
const JARDIN_OPACIDAD_FIN = 0.12;
const MENSAJE_CAIDA_PX = 40;
const MENSAJE_BLUR_PX = 10;
const CTA_CAIDA_PX = 20;

const PETALO_SUBE_BASE_PX = 120;
const PETALO_SUBE_RUIDO_PX = 200;
const PETALO_DERIVA_PX = 60;
const PETALO_GIRO_DEG = 180;
const OPACIDAD_HOJA_FIN = 0.85;

/** Punto de entrada: marca el hero como estático o programa la animación para cuando haya tiempo libre. */
export function initHeroScroll(): void {
  const hero = document.querySelector<HTMLElement>(SELECTOR_HERO);
  if (!hero || conectados.has(hero)) return;
  conectados.add(hero);

  if (prefersReducedMotion()) {
    activarModoEstatico(hero);
    return;
  }
  arrancarCuandoHayTiempo(() => {
    void arrancar(hero);
  });
}

function arrancarCuandoHayTiempo(fn: () => void): void {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn, { timeout: IDLE_TIMEOUT_MS });
  } else {
    window.setTimeout(fn, RETRASO_SIN_IDLE_MS);
  }
}

async function arrancar(hero: HTMLElement): Promise<void> {
  const refs: SmoothScrollRefs | null = await initSmoothScroll();
  if (!refs) {
    activarModoEstatico(hero);
    return;
  }
  construirAnimacion(hero, refs.gsap);
}

function activarModoEstatico(hero: HTMLElement): void {
  hero.classList.add('static');
}

function construirAnimacion(section: HTMLElement, gsap: Gsap): void {
  const piezas = leerPiezas(section);
  if (!piezas) return;

  // A partir de aquí el JS está listo: se aplica el estado oculto y se anima.
  section.classList.add('js-ready');
  fijarEstadoInicial(gsap, piezas);
  animarEntrada(gsap, piezas);
  animarScroll(gsap, section, piezas);
}

function leerPiezas(section: HTMLElement): Piezas | null {
  const garden = section.querySelector<SVGSVGElement>('#garden');
  const intro = section.querySelector<HTMLElement>('#heroIntro');
  const hint = section.querySelector<HTMLElement>('#scrollHint');
  const cta = section.querySelector<HTMLElement>('#heroCta');
  if (!garden || !intro || !hint || !cta) return null;

  return {
    garden,
    intro,
    hint,
    cta,
    stems: all<SVGRectElement>('.garden .stem', section),
    leaves: all<SVGPathElement>('.garden .leaf', section),
    bulbs: all<SVGGElement>('.garden .bulb', section),
    lines: all<HTMLElement>('.msg-h .l', section),
    photos: all<HTMLElement>('.hero-photo', section),
    hp5: section.querySelector<HTMLElement>('.hp5'),
    petals: all<HTMLElement>('.petal', section),
  };
}

/** Estado inicial igual al CSS, para que GSAP parta de ahí sin salto. */
function fijarEstadoInicial(gsap: Gsap, p: Piezas): void {
  gsap.set(p.stems, { scaleY: ESCALA_TALLO_INICIAL, transformOrigin: '50% 100%' });
  gsap.set(p.leaves, { scale: ESCALA_HOJA_INICIAL, opacity: 0, transformOrigin: '50% 100%' });
  p.bulbs.forEach((bulbo) => {
    gsap.set(bulbo, { y: alturaDeTulipan(bulbo) * FRACCION_BAJADA_BULBO, scale: ESCALA_BULBO_INICIAL, transformOrigin: '50% 100%' });
  });
  gsap.set(p.lines, { opacity: 0, y: MENSAJE_CAIDA_PX, filter: `blur(${MENSAJE_BLUR_PX}px)` });
  gsap.set(p.cta, { opacity: 0, y: CTA_CAIDA_PX });
  p.photos.forEach((foto, i) => {
    gsap.set(foto, {
      opacity: 0,
      x: signo(i) * DESPLAZAMIENTO_FOTO_PX,
      y: CAIDA_FOTO_PX,
      rotate: signo(i) * INCLINACION_FOTO_DEG,
    });
  });
  if (p.hp5) gsap.set(p.hp5, { x: 0, y: DESPLAZAMIENTO_HP5_PX });
}

/** Entrada suave al cargar, antes de que el scroll tome el control. */
function animarEntrada(gsap: Gsap, p: Piezas): void {
  gsap.from(p.garden, { y: JARDIN_SUBE_PX, opacity: 0, duration: 1.2, ease: 'power2.out' });
  gsap.from(Array.from(p.intro.children), { y: CAIDA_INTRO_PX, opacity: 0, duration: 1, stagger: 0.15, ease: 'power2.out', delay: 0.2 });
}

function animarScroll(gsap: Gsap, section: HTMLElement, p: Piezas): void {
  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: SCRUB_S },
  });
  animarTallos(tl, p);
  animarMensaje(tl, p);
  animarFotos(tl, p);
}

/** Primer tercio del scroll: el texto de bienvenida se va y crecen los tulipanes. */
function animarTallos(tl: Timeline, p: Piezas): void {
  tl.to(p.hint, { opacity: 0, duration: 0.5 }, 0)
    .to(p.intro, { opacity: 0, y: -40, duration: 1.2 }, POS_INTRO_SALE)
    .to(p.stems, { scaleY: 1, duration: DURACION_TALLO_S, stagger: ESCALONADO }, 0)
    .to(p.bulbs, { y: 0, scale: 1, rotate: (i: number) => (i - CENTRO_TULIPANES) * ROTACION_TULIPAN_DEG, duration: DURACION_TALLO_S, stagger: ESCALONADO }, 0)
    .to(p.leaves, { scale: 1, opacity: OPACIDAD_HOJA_FIN, duration: DURACION_HOJA_S, stagger: ESCALONADO }, POS_HOJAS)
    .to(p.petals, { y: () => -PETALO_SUBE_BASE_PX - Math.random() * PETALO_SUBE_RUIDO_PX, x: () => Math.random() * 2 * PETALO_DERIVA_PX - PETALO_DERIVA_PX, rotate: `+=${PETALO_GIRO_DEG}`, duration: DURACION_PETALO_S, stagger: 0.05 }, 0);
}

/** Segundo tercio: el jardín se aleja y aparece el mensaje, línea por línea. */
function animarMensaje(tl: Timeline, p: Piezas): void {
  tl.to(p.garden, { opacity: JARDIN_OPACIDAD_FIN, y: JARDIN_BAJA_PX, scale: JARDIN_ESCALA_FIN, transformOrigin: '50% 100%', duration: 1.6 }, POS_JARDIN_SALE)
    .to(p.lines, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, stagger: 0.7 }, POS_MENSAJE);
}

/** Último tercio: las fotos se acomodan en el paneo, aparece el CTA y se apagan los pétalos. */
function animarFotos(tl: Timeline, p: Piezas): void {
  tl.to(p.photos, { opacity: 1, x: 0, y: 0, rotate: (i: number) => ROTACION_FOTOS_DEG[i] ?? 0, duration: 2.2, stagger: 0.25, ease: 'power3.out' }, POS_FOTOS)
    .to(p.cta, { opacity: 1, y: 0, duration: 1 }, POS_CTA)
    .to(p.petals, { opacity: 0, duration: 1 }, POS_FIN_PETALOS)
    .to({}, { duration: 1 });
}

/** Alto del tulipán (data-h) del bulbo que se está animando. */
function alturaDeTulipan(bulbo: SVGGElement): number {
  return Number(bulbo.closest('.tulip')?.getAttribute('data-h') ?? 0);
}

/** Alterna el signo por índice: las fotos pares entran por la izquierda y las impares por la derecha. */
function signo(i: number): number {
  return i % 2 ? 1 : -1;
}
