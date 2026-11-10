import type { gsap as GsapCore } from 'gsap';
import type { ScrollTrigger as ScrollTriggerPlugin } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';
import { prefersReducedMotion } from './dom';

export type Gsap = typeof GsapCore;
export type ScrollTriggerType = typeof ScrollTriggerPlugin;

export interface SmoothScrollRefs {
  gsap: Gsap;
  ScrollTrigger: ScrollTriggerType;
  /** null si Lenis no pudo cargarse: el scroll nativo sigue funcionando. */
  lenis: Lenis | null;
}

/** Alto del header fijo (84px sin compactar). Los anclas no quedan tapadas por él. */
const HEADER_OFFSET = -84;

let pending: Promise<SmoothScrollRefs | null> | null = null;
/** Instancia de Lenis ya creada. Se guarda aquí para que los paneles la paren sin cargarla. */
let lenisActivo: Lenis | null = null;

/** La instancia de Lenis si ya se creó; null si no hay (reduced motion, sin carga o aún cargando). */
export function getLenis(): Lenis | null {
  return lenisActivo;
}

/**
 * Carga GSAP + ScrollTrigger y Lenis una sola vez y los sincroniza.
 * Devuelve null con prefers-reduced-motion o si GSAP no se pudo cargar.
 */
export function initSmoothScroll(): Promise<SmoothScrollRefs | null> {
  if (!pending) pending = start();
  return pending;
}

async function start(): Promise<SmoothScrollRefs | null> {
  if (typeof window === 'undefined') return null;
  if (prefersReducedMotion()) return null;

  const core = await loadCore().catch((): null => null);
  if (!core) return null;
  const { gsap, ScrollTrigger } = core;

  let lenis: Lenis | null = null;
  try {
    const { default: LenisCtor } = await import('lenis');
    const instance = new LenisCtor({ lerp: 0.1, smoothWheel: true });
    instance.on('scroll', () => ScrollTrigger.update());
    gsap.ticker.add((time) => instance.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    bindAnchors(instance);
    lenis = instance;
    lenisActivo = instance;
  } catch {
    lenis = null;
  }

  return { gsap, ScrollTrigger, lenis };
}

async function loadCore(): Promise<{ gsap: Gsap; ScrollTrigger: ScrollTriggerType }> {
  const [gsapMod, stMod] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  const gsap = gsapMod.gsap;
  const ScrollTrigger = stMod.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

/** Intercepta los clics en anclas de la misma página (#id o /#id) y los lleva con Lenis. */
function bindAnchors(lenis: Lenis): void {
  document.addEventListener('click', (ev) => {
    if (ev.defaultPrevented || ev.button !== 0) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    if (!(ev.target instanceof Element)) return;

    const link = ev.target.closest<HTMLAnchorElement>('a[href*="#"]');
    if (!link) return;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
    if (!url.hash || url.hash === '#') return;

    const id = decodeURIComponent(url.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;

    ev.preventDefault();
    lenis.scrollTo(target, { offset: HEADER_OFFSET });
    window.history.pushState(null, '', url.hash);
  });
}
