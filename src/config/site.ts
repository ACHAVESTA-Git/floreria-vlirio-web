/** Número de WhatsApp en un solo lugar. Demo = número de pruebas. Producción: '51933099986' */
export const WHATSAPP_NUMBER = '51936688729';

export const SITE = {
  nombre: "Florería V'Lirio",
  razonSocial: 'Corporación Vlirio S.A.C.',
  eslogan: 'Flores que dicen lo que el corazón siente.',
  direccion: ['Av. Gerardo Unger 2488, puerta 2', 'Mercado Unicachi de Comas · Puestos 186, 188 y 189'],
  telefonos: ['933 099 986', '902 275 046', '974 048 878'],
  correo: 'vliriofloreria5@gmail.com',
  horario: 'Horario por confirmar',
  pagos: 'Yape · Plin · Transferencia',
  // Usuarios por confirmar con el cliente
  redes: {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    tiktok: 'https://www.tiktok.com/',
  },
  mapa: 'https://www.google.com/maps?q=Mercado+Unicachi+de+Comas+Lima&output=embed',
} as const;

/** Flor de la animación al agregar a la canasta */
export type FlyFlower = 'girasol' | 'tulipan' | 'producto';
export const FLY_FLOWER: FlyFlower = 'girasol';

export const waLink = (texto: string): string =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;

export const soles = (n: number): string => 'S/' + (Number.isInteger(n) ? n : n.toFixed(2));

export const CATEGORIAS = [
  { slug: 'ramos', nombre: 'Ramos', imagen: 'ramo-gerberas-rosas-papel-fucsia' },
  { slug: 'buchones', nombre: 'Buchones', imagen: 'buchon-girasoles' },
  { slug: 'arreglos', nombre: 'Arreglos', imagen: 'arreglo-tropical-girasol-lirio-caja-roja' },
  { slug: 'box', nombre: 'Box', imagen: 'box-corazon-girasoles-lirios-peluche-lotso' },
  { slug: 'tulipanes', nombre: 'Tulipanes', imagen: 'ramo-tulipanes-amarillos-papel-olivo' },
  { slug: 'extras', nombre: 'Peluches y chocolates', imagen: 'arreglo-rosas-rojas-globo-corazon-ferrero' },
] as const;

export const OCASIONES = [
  { slug: 'amor', nombre: 'Amor' },
  { slug: 'aniversario', nombre: 'Aniversario' },
  { slug: 'cumpleanos', nombre: 'Cumpleaños' },
  { slug: 'graduacion', nombre: 'Graduación' },
  { slug: 'condolencias', nombre: 'Condolencias' },
  { slug: 'mejorate-pronto', nombre: 'Mejórate pronto' },
  { slug: 'nacimientos', nombre: 'Nacimientos' },
] as const;
