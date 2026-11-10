import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { FLY_TIPOS } from './config/site';

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
      /**
       * Lo que vuela a la canasta al agregar el producto (animación 'producto').
       * Va en orden de protagonismo: la primera es la flor principal y se repite
       * si hay más partículas que elementos.
       */
      flores: z.array(z.enum(FLY_TIPOS)).min(1).default(['rosa']),
      demo: z.boolean().default(false),
    }),
});

export const collections = { productos };
