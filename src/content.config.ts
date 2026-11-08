import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const productos = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/productos' }),
  schema: ({ image }) =>
    z.object({
      nombre: z.string(),
      categoria: z.enum(['ramos', 'buchones', 'cumpleanos', 'arreglos', 'box', 'tulipanes', 'extras']),
      ocasiones: z
        .array(z.enum(['amor', 'aniversario', 'cumpleanos', 'graduacion', 'condolencias', 'mejorate-pronto', 'nacimientos']))
        .default([]),
      descripcion: z.string(),
      precio: z.number(),
      precioOferta: z.number().optional(),
      destacado: z.boolean().default(false),
      colores: z.array(z.string()).default([]),
      imagen: image(),
      imagenAmbiente: image().optional(),
      /** Flor para la animación 'producto' */
      flor: z.enum(['girasol', 'tulipan', 'rosa']).default('rosa'),
      demo: z.boolean().default(false),
    }),
});

export const collections = { productos };
