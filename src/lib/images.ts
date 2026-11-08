import type { ImageMetadata } from 'astro';

const mods = import.meta.glob<{ default: ImageMetadata }>('/src/assets/productos/*.{png,jpg}', { eager: true });

/** Devuelve la imagen de src/assets/productos por nombre base (sin extensión). Ej: getAsset('buchon-girasoles'). */
export function getAsset(name: string): ImageMetadata {
  const key = Object.keys(mods).find((k) => k.endsWith(`/${name}.png`) || k.endsWith(`/${name}.jpg`));
  if (!key) throw new Error(`Imagen no encontrada en src/assets/productos: ${name}`);
  return mods[key].default;
}
