import { capitalizar, normalizar } from './text';

/**
 * Colores de producto que tienen token en tokens.css (--vl-color-<slug>).
 * Si agregas un color aquí, agrega también su token.
 */
export const COLOR_SLUGS = ['rojo', 'rosado', 'fucsia', 'salmon', 'naranja', 'amarillo', 'blanco', 'azul', 'lila'] as const;
export type ColorSlug = (typeof COLOR_SLUGS)[number];

/** Nombre visible con tilde cuando corresponde. */
const NOMBRES: Partial<Record<ColorSlug, string>> = { salmon: 'Salmón' };

export function isColorSlug(v: string): v is ColorSlug {
  return (COLOR_SLUGS as readonly string[]).includes(v);
}

/** 'Salmón' (texto del JSON) → 'salmon' si existe el token; si no, null. */
export function colorSlug(texto: string): ColorSlug | null {
  const slug = normalizar(texto);
  return isColorSlug(slug) ? slug : null;
}

export function colorNombre(slug: ColorSlug): string {
  return NOMBRES[slug] ?? capitalizar(slug);
}

/** Valor CSS para pintar una muestra. Colores sin token caen en el rosa de marca. */
export function colorCss(texto: string): string {
  const slug = colorSlug(texto);
  return slug ? `var(--vl-color-${slug})` : 'var(--vl-rosa)';
}
