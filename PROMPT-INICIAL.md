# Prompt inicial · Fase 1 (demo de Florería V'Lirio)

> Copia todo lo que está dentro del bloque y pégalo en Claude Code, abierto en la carpeta `floreria-vlirio`.

```text
Vas a desarrollar la demo web de Florería V'Lirio con Astro.

ANTES DE ESCRIBIR CÓDIGO
1. Lee completos: CLAUDE.md, docs/01-requerimientos-cliente.md, docs/02-catalogo-e-imagenes.md y docs/03-diseno-ux-animaciones.md.
2. Abre y estudia boceto/index.html: es la referencia visual aprobada del home (estructura, colores, textos, hero con scroll, canasta y animación de girasoles). Puedes reutilizar su CSS y su JS, pero conviértelo en componentes Astro limpios.
3. Resume en 10 líneas lo que entendiste (marca, alcance, stack) y muéstrame el plan de la Fase 1 antes de empezar.

FASE 1: BASE DEL PROYECTO Y HOME
1. Crea el proyecto Astro 5 (TypeScript strict) en esta misma carpeta, sin borrar docs/, assets/, boceto/ ni los .md. Inicializa git con un .gitignore adecuado.
2. Dependencias: gsap, lenis, nanostores. Fuentes con @fontsource (nunito, poppins, luxurious-script) o Google Fonts con preconnect.
3. src/styles/tokens.css con TODOS los tokens de CLAUDE.md (colores, fuentes, radios y sombras) y global.css (reset y base).
4. src/config/site.ts con WHATSAPP_NUMBER = '51967446580' (número de pruebas), los datos de contacto y las redes.
5. Content Collection "productos" con el esquema de docs/02. Crea los JSON de TODOS los productos del catálogo (docs/02, sección 2). Usa las imágenes de assets/productos/sin-fondo según la asignación tentativa (docs/02, sección 5) y marca demo: true. Los productos sin foto usan un placeholder. Marca 8 productos como destacados y 3 con precioOferta (los mismos del boceto).
6. Copia a src/assets/productos/ las imágenes que se usen y sírvelas con <Image /> de Astro (WebP o AVIF, tamaños responsivos).
7. Componentes: BaseLayout, Header (con Logo en SVG y BasketButton con contador corazón), Footer, HeroScroll, CategoryCards (con chips de ocasión), Featured (carrusel), OffersBand, HowToOrder, VisitUs, ProductCard, BasketDrawer, WhatsAppFloat y Toast.
8. Canasta: basketStore con nanostores y localStorage. El drawer tiene cantidades, extras sugeridos, mensaje para la tarjeta, total y "Pedir por WhatsApp" con el mensaje armado (formato en docs/03, sección 9). Usa enlaces wa.me, sin API.
9. Animación flyToBasket: siluetas de girasol que salen del botón y vuelan en curva hasta la canasta del header (docs/03, sección 9). La flor es configurable ('girasol' | 'tulipan' | 'producto'); el default es 'girasol'.
10. HeroScroll con GSAP ScrollTrigger y Lenis, en tres fases (docs/03, sección 2), con el estado estático si hay prefers-reduced-motion.
11. Las páginas /catalogo y /catalogo/[slug] pueden quedar como stub con "Próximamente" y los enlaces funcionando (se construyen en la Fase 2).

CRITERIOS DE ACEPTACIÓN
- npm run build sin errores ni warnings de TypeScript.
- El home se ve igual o mejor que boceto/index.html en 375px, 768px y 1440px, sin scroll horizontal.
- Agregar a la canasta → los girasoles vuelan → el contador sube → el drawer muestra el producto → el botón abre WhatsApp al 51967446580 con el pedido.
- Lighthouse móvil: Performance ≥ 85 y Accessibility ≥ 95.
- No hay colores hex sueltos fuera de tokens.css.

FORMA DE TRABAJO
- Haz commits pequeños por componente.
- Si algo de los docs es ambiguo o contradictorio, pregúntame antes de decidir.
- Al terminar, levanta el servidor de desarrollo, revísalo en el navegador (escritorio y móvil) y dame un resumen con lo que quedó, lo que falta y los pendientes con el cliente.
```

---

## Fases siguientes (para prompts futuros)
- **Fase 2:** `/catalogo` con filtros en la URL, orden y animación FLIP, más `/catalogo/[slug]` con galería, colores, extras y View Transitions.
- **Fase 3:** Nosotros y Contacto, SEO (Open Graph, sitemap, schema.org `Florist`), favicon corazón, 404 bonita y publicación en Cloudflare Pages.
- **Fase 4 (post aprobación):** CMS para el cliente, Supabase (clientes y pedidos), pagos y cambio de WHATSAPP_NUMBER al de la florería.
