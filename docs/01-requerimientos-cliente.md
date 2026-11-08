# 01 · Requerimientos del cliente

## Objetivo de la demo
Una web pública que muestre **lo que vende V'Lirio** con una experiencia moderna y memorable, para que el cliente apruebe el proyecto. Si sale bien, se escala a una tienda con backend.

**Métrica de éxito de la demo:** el cliente la abre en su celular, entiende al instante que es *su* florería, navega el catálogo, agrega flores a la canasta y llega a WhatsApp con el pedido armado.

## Lo que pidió el cliente (y lo que acordamos)

| # | Requerimiento | Decisión |
|---|---|---|
| R1 | **Header** con el logo y el nombre de la florería | ✅ Logo (tulipanes, "Florería" y V'LIRIO) a la izquierda. Navegación al centro y acciones a la derecha. Sticky y compacto al hacer scroll |
| R2 | A la derecha, **canasta de flores** en vez del carrito de compras | ✅ Ícono de **canasta de mimbre** con contador en forma de corazón. Se llama "Mi canasta" en toda la web (nunca "carrito") |
| R3 | Que **de primera impresión se vean sus flores** | ✅ Se combina con R4: el hero ya muestra tulipanes al cargar y termina mostrando fotos reales de ramos con el CTA "Ver catálogo" |
| R4 | **Animación al hacer scroll** en la primera pantalla: tulipanes o rosas que aparecen con desvanecido o paneo, y luego un mensaje emocional | ✅ Hero "pinned" con tres fases (ver `docs/03`). Mensaje: *"Aquí no solo vendemos flores, entregamos momentos que llegan al corazón."* |
| R5 | **Filtros** que lleven a las pantallas del catálogo | ✅ **Tarjetas rectangulares con bordes redondeados y foto** por tipo de producto (Ramos, Buchones, Arreglos, Box, Tulipanes, Extras), más una fila de **chips minimalistas por ocasión** (Amor, Cumpleaños, Aniversario, Graduación, Condolencias, Mejórate pronto, Nacimientos). Cada uno lleva a `/catalogo?categoria=…` o `/catalogo?ocasion=…` |
| R6 | Sección de **productos destacados** | ✅ Carrusel horizontal (scroll-snap) de 6 a 8 productos |
| R7 | Sección de **productos con descuento** | ✅ Con formato distinto para no saturar: una **banda "Ofertas de la semana"** con 3 productos y fondo blush. Los descuentos de la demo son de ejemplo (`demo: true`) |
| R8 | **Animación de girasoles** al agregar a la canasta: siluetas que salen del botón, vuelan arriba a la derecha y entran a la canasta | ✅ Microinteracción firma de la marca (ver `docs/03`). El boceto permite comparar girasoles con tulipanes |
| R9 | Look **novedoso y moderno** (referencias: Refero y MotionSites) | ✅ Animaciones con scroll, View Transitions y microinteracciones suaves. Siempre dentro de la paleta de la marca |

## Decisión: ¿redes sociales o catálogo previo en el home?
**Elegimos el catálogo previo** (tarjetas por categoría). Motivos:
- El objetivo es que vean y pidan flores. Las redes sacan al usuario de la web justo cuando está por comprar.
- Las tarjetas con foto cumplen R3 (ver las flores) y R5 (filtros) al mismo tiempo.
- Las redes no desaparecen: van en la sección "Visítanos" (foto real de la tienda, dirección y botones de IG, FB y TikTok) y en el footer.

## Análisis: ¿destacados y ofertas en el home lo saturan?
No, si se cumplen tres condiciones:
1. **Formatos distintos:** destacados en carrusel y ofertas en una banda corta. Si los dos fueran grillas, se sentiría repetido.
2. **Pocos productos:** de 6 a 8 destacados y 3 ofertas. El resto vive en `/catalogo`.
3. **Mucho aire:** secciones separadas por fondos alternos (crema, blush, crema) y espacio generoso.

Orden final del home, del más emocional al más práctico:
`Hero con scroll → Categorías y ocasiones → Destacados → Ofertas de la semana → Cómo pedir (3 pasos) → Visítanos y redes → Footer`

> Alternativa por si el cliente lo siente cargado: unir destacados y ofertas en **una sola sección con pestañas** ("Más pedidos" | "En oferta").

## Alcance de la demo (Fase 1)
**Incluye**
- Home completo (todas las secciones de arriba)
- `/catalogo` con filtros por categoría y ocasión, y orden por precio
- `/catalogo/[slug]`: detalle con galería, descripción, precio, colores disponibles, extras sugeridos y "Agregar a la canasta"
- Canasta: drawer lateral, cantidades, total, persistencia en localStorage y botón **"Pedir por WhatsApp"** con el pedido prellenado
- Animación de girasoles y animación del hero
- "Nosotros" y "Contacto" simples (pueden ser secciones del home en la primera iteración)
- Responsive (375px → 1440px), SEO básico (title, meta, Open Graph) y publicación en Cloudflare Pages

**No incluye (fases futuras)**
- Registro o login de clientes, historial de pedidos
- Pagos en línea (Culqi, Mercado Pago o Izipay) y pedidos guardados en BD
- Panel para que la florería edite productos (CMS: Keystatic, Decap o Sanity)
- Programación de fecha y hora de entrega, cálculo de delivery por distrito
- Dominio propio y correo corporativo

## Roadmap
1. **Demo (ahora):** Astro estático, JSON de productos, WhatsApp y Cloudflare Pages (S/0)
2. **V1:** dominio propio, CMS para que el cliente edite su catálogo, fotos profesionales
3. **V2:** Supabase (clientes y pedidos), SSR en Astro solo en las rutas que lo necesiten, pasarela de pago, panel de pedidos

## Datos de contacto para la web
- **WhatsApp en la demo (pruebas): 967 446 580** (número del desarrollador) → `https://wa.me/51967446580?text=...`
- WhatsApp de la florería para producción: **933 099 986** (confirmar cuál prefiere el cliente). Se cambia en `src/config/site.ts`.
- **Botones de WhatsApp en la demo (R10):** botón flotante en todas las páginas (abajo a la derecha, con un saludo prellenado), "Pedir por WhatsApp" en cada producto (con el nombre y el precio) y en la canasta (con el pedido completo). **No requiere API ni configuración**: es un enlace `wa.me` con el texto codificado.
- Dirección: Av. Gerardo Unger 2488, puerta 2, Unicachi de Comas, puestos 186, 188 y 189
- Métodos de pago que existen: Yape/Plin y transferencia BCP (soles y dólares). **En la web solo se menciona "Yape, Plin y transferencia"; los números de cuenta se envían por WhatsApp.**
