# Florería V'Lirio — Guía principal del proyecto

> Este es el archivo que Claude Code lee primero. Resume **qué es el proyecto, la esencia de la marca y las reglas de trabajo**. El detalle vive en `docs/`.

| Archivo | Para qué |
|---|---|
| `CLAUDE.md` (este) | Identidad de marca, tokens de diseño, stack y reglas |
| `docs/01-requerimientos-cliente.md` | Lo que pide el cliente, alcance de la demo y lo que queda fuera |
| `docs/02-catalogo-e-imagenes.md` | Productos y precios del catálogo e índice de las imágenes renombradas |
| `docs/03-diseno-ux-animaciones.md` | Estructura del home, componentes, animaciones y canasta |
| `docs/04-guia-de-codigo.md` | Tamaños máximos, estructura de archivos, utilidades compartidas y checklist antes de commit |
| `PROMPT-INICIAL.md` | Prompt para arrancar la Fase 1 del desarrollo |
| `boceto/index.html` | Boceto navegable del home (referencia visual aprobada en conversación) |

---

## 1. El negocio

- **Nombre:** Florería V'Lirio (la marca escribe la "o" final como un **corazón**: `V'LIRI♥`).
- **Razón social:** Corporación Vlirio S.A.C.
- **Ubicación:** Av. Gerardo Unger 2488, puerta 2, Mercado Unicachi de Comas, puestos 186, 188 y 189, Lima (Perú).
- **Pedidos (WhatsApp):** 933 099 986 · 902 275 046 · 974 048 878
- **Correo:** vliriofloreria5@gmail.com
- **Redes:** Facebook "Florería VLirio", Instagram "V'Lirio" y TikTok "FloreriaV'Lirio". *Los usuarios exactos están por confirmar con el cliente.*
- **Qué vende:** ramos, buchones, arreglos coreanos, box, tulipanes y extras (chocolates y peluches). Precios de **S/20 a S/350**.
- **Cliente final:** personas en Lima que quieren regalar un detalle (amor, cumpleaños, aniversario, graduación, condolencias). Compran desde el celular y cierran el pedido por WhatsApp.

## 2. Esencia de marca

**Personalidad:** cálida, romántica, cercana y con un toque elegante. *No es lujo frío, es un detalle hecho con cariño.*

**Promesa:** no vendemos solo flores, entregamos momentos que llegan al corazón.

**Eslogan:** pendiente de que el cliente elija uno.
1. ⭐ **"Flores que dicen lo que el corazón siente."** (recomendado: corto, emocional y conecta con el corazón del logo)
2. "Aquí no solo vendemos flores, entregamos momentos que llegan al corazón." (el mensaje largo de la animación del hero)
3. "Detalles que florecen en el corazón."
4. "Cada flor cuenta lo que sientes."
5. "Hacemos florecer tus momentos."

**Tono de voz:** cercano y en segunda persona ("tú"), con frases cortas y emoción sin exagerar. Usa español neutro peruano.
- ✅ "Sorprende a quien más quieres hoy mismo."
- ✅ "Elige tu ramo y lo preparamos con cariño."
- ❌ "Adquiera nuestros productos florales de alta gama."
- ❌ Muchos emojis o MAYÚSCULAS gritadas.

### Logo
- Archivo actual: `assets/logo/logo-vlirio.jpeg` (447×447, fondo blanco, **no es vectorial**). **Hay que pedirle al cliente el SVG o PNG con transparencia.** Mientras tanto, el header puede recrear el logo con SVG y fuentes (así está hecho en el boceto).
- Composición: **7 tulipanes** en arco (el central es el más alto), "Florería" en script y "V'LIRIO" en sans redondeada black. La "o" es un corazón.
- **Elementos reutilizables:** el **tulipán** (íconos, separadores, loader, partículas) y el **corazón** (favoritos, contador de la canasta, bullet points, favicon).
- Curiosidad para la sección "Nosotros": el nombre dice *lirio* y el ícono son *tulipanes*. Hay que preguntarle al cliente la historia.

### Paleta de color (tokens)

Salen del logo (vino) y del catálogo PDF (frambuesa y rosados). Todas las combinaciones de texto cumplen WCAG AA.

```css
:root {
  /* Marca */
  --vl-vino:        #772A4C; /* color del logo. Titulares, header, footer, links. 9.5:1 sobre blanco */
  --vl-vino-oscuro: #5A1F3A; /* hover de vino, fondos oscuros */
  --vl-frambuesa:   #B4285A; /* CTA principal (botones), badges de oferta. Texto blanco 6.2:1 */
  --vl-coral:       #CD3764; /* acento del catálogo: precios, detalles. Solo para texto ≥18px o decoración (4.85:1) */
  /* Rosados (fondos) */
  --vl-rosa:        #F79BA6; /* ilustraciones, bordes, hover suave */
  --vl-durazno:     #F5CFC4; /* fondos de tarjeta alternos */
  --vl-blush:       #FFEBEB; /* fondo de secciones */
  --vl-crema:       #FDF8F3; /* fondo base de la página (no usar blanco puro de fondo general) */
  --vl-blanco:      #FFFFFF; /* tarjetas */
  /* Texto */
  --vl-tinta:       #2E1A24; /* texto principal (15:1 sobre crema) */
  --vl-tinta-suave: #6B5560; /* texto secundario (6.4:1) */
  /* Naturales (uso puntual) */
  --vl-follaje:     #5E7D5A; /* tallos de las ilustraciones, detalles "fresco" */
  --vl-girasol:     #F2B53A; /* solo la animación de girasoles y destellos. Nunca como texto */
}
```

**Reglas de color**
- La marca es casi **monocromática**: mucho crema y blanco, con el vino como protagonista. Las fotos de flores ponen el resto del color.
- Hay **un solo color de CTA**: frambuesa. No inventes azules, verdes o negros para los botones.
- El coral `#CD3764` no se usa para texto pequeño.
- No uses degradados chillones. Si hace falta uno: `linear-gradient(180deg, var(--vl-blush), var(--vl-crema))`.

### Tipografía

Fuentes detectadas en el catálogo PDF: **Nunito** (Regular, Bold y Black), **Poppins**, **Luxurious Script**, **TAN Variety** y Open Sans.

| Rol | Fuente | Uso |
|---|---|---|
| Decorativa | **Luxurious Script** (Google Fonts) | Palabras sueltas o frases cortas: "Florería", "con amor", el remate del hero. **Nunca en párrafos, botones ni precios.** Tamaño mínimo de 28px |
| Títulos | **Nunito** 800/900 | H1–H3 y el wordmark V'LIRIO (Nunito Black es casi idéntica al logo) |
| Texto | **Nunito** 400/600 | Párrafos y descripciones de productos |
| UI | **Poppins** 500/600 | Botones, precios, chips, badges y el contador de la canasta |
| Etiquetas de sección (opcional) | **TAN Variety** | Se usa en los títulos del catálogo ("01 RAMOS"). Es de pago o de uso personal: **hay que verificar la licencia**. La alternativa libre es **Italiana** (Google Fonts) |

```css
--vl-font-script: 'Luxurious Script', cursive;
--vl-font-title:  'Nunito', system-ui, sans-serif;
--vl-font-body:   'Nunito', system-ui, sans-serif;
--vl-font-ui:     'Poppins', system-ui, sans-serif;
```

### Forma y estilo
- **Bordes redondeados generosos**: tarjetas de 20–24px, botones tipo píldora (999px), como los precios del catálogo.
- Sombras suaves con tinte vino: `0 10px 30px -12px rgb(119 42 76 / .25)`.
- Las fotos **sin fondo** (`assets/productos/sin-fondo`) van sobre fondos blush o crema; se ven más limpias que las de WhatsApp.
- Espacio en blanco amplio. Debe sentirse aireado y premium, no como un catálogo saturado.

## 3. Stack técnico

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | **Astro 5** (estático) | HTML rápido, buen SEO y JS solo donde hace falta (islands) |
| Estilos | CSS con los tokens de arriba (o Tailwind 4 con estos tokens en `@theme`) | Mantener la marca centralizada |
| Interactividad | Islands en **TypeScript vanilla** o Preact | Canasta, filtros, carrusel y animaciones |
| Estado de la canasta | **nanostores** + `localStorage` | Compartido entre islands y persistente |
| Animación | **GSAP + ScrollTrigger** (gratis), **Lenis** (scroll suave) y **View Transitions** de Astro | El hero con scroll y las transiciones del catálogo al detalle |
| Datos | **Content Collections** (`src/content/productos/*.json`) con esquema zod | Así podemos pasar a una BD sin tocar los componentes |
| Imágenes | `<Image />` / `<Picture />` de Astro (AVIF/WebP) | Las PNG originales pesan 1–2 MB |
| Hosting de la demo | **Cloudflare Pages** (gratis) | Permite uso comercial |
| Futuro (no en la demo) | Supabase (clientes y pedidos), SSR con adapter y pasarela (Culqi, Mercado Pago o Izipay) | Ver `docs/01` |

### Estructura de carpetas objetivo
```
src/
├── content/productos/        ← un JSON por producto (ver esquema en docs/02)
├── content.config.ts
├── components/
│   ├── layout/   Header.astro, Footer.astro, Logo.astro, BasketButton.astro
│   ├── home/     HeroScroll.astro, CategoryCards.astro, Featured.astro, OffersBand.astro, HowToOrder.astro, VisitUs.astro
│   ├── product/  ProductCard.astro, AddToBasket.ts, PriceTag.astro
│   └── basket/   BasketDrawer.ts, flyToBasket.ts (animación de girasoles), basketStore.ts
├── layouts/BaseLayout.astro
├── pages/  index.astro, catalogo/index.astro, catalogo/[slug].astro, nosotros.astro, contacto.astro
├── styles/ tokens.css, global.css
└── assets/ (las imágenes de /assets/productos se copian aquí al iniciar)
```

## 4. Reglas para los agentes

1. **Lee los docs antes de tocar código** (y `docs/04-guia-de-codigo.md` siempre que escribas o refactorices código). Si algo choca con este archivo, este manda.
2. **Usa siempre los tokens** de color y tipografía. No uses hex sueltos en los componentes.
3. **Mobile first**: la mayoría de los clientes llega desde el celular por WhatsApp o Instagram. Prueba en 375px.
4. **Accesibilidad:** contraste AA, `alt` descriptivo en cada flor, foco visible, el drawer de la canasta con `role="dialog"` y Escape para cerrar. **Todas las animaciones respetan `prefers-reduced-motion`.**
5. **Rendimiento:** LCP < 2.5s en 4G. La animación del hero no puede bloquear el primer render. Las imágenes van optimizadas y con `loading="lazy"` debajo del fold.
6. **Datos en un solo lugar.** No escribas productos ni precios a mano en los componentes.
7. **La demo no cobra.** El flujo termina en "Pedir por WhatsApp" con el mensaje prellenado. No publiques números de cuenta bancaria en la web.
   - **Número de WhatsApp en un solo lugar:** `src/config/site.ts` → `WHATSAPP_NUMBER`. **Durante la demo es el número de pruebas del desarrollador: `51967446580`** (967 446 580). Antes de entregar se cambia por el de la florería (933 099 986).
   - **No se usa ninguna API de WhatsApp.** Basta un enlace `https://wa.me/<número>?text=<encodeURIComponent(mensaje)>`, que abre la app en el móvil y WhatsApp Web en la PC. La WhatsApp Business Cloud API (Meta) solo haría falta en el futuro para mensajes automáticos (confirmaciones o estados de pedido).
8. **Precios y descuentos de ejemplo** se marcan en los datos con `demo: true`. El cliente aún no definió ofertas reales.
9. Usa nombres de componentes en inglés y textos visibles en español. Haz commits pequeños y descriptivos.
10. Para inspiración visual moderna puedes consultar **Refero** (MCP: https://refero.design/mcp) y **MotionSites** (https://motionsites.ai, MCP `motionsites` con `search_prompts`), **sin copiar** diseños de otras marcas.

## 5. Pendientes con el cliente
- [ ] Logo en SVG o PNG transparente
- [ ] Eslogan definitivo (ver la lista de arriba)
- [ ] Usuarios exactos de Facebook, Instagram y TikTok
- [ ] Qué productos van como **destacados** y cuáles con **descuento** (y de cuánto)
- [ ] Corregir los nombres y precios duplicados del catálogo (ver `docs/02`)
- [ ] Rehacer el recorte de 3 fotos sin fondo y conseguir fotos de los productos que faltan
- [ ] Zonas y costo de delivery, horario de atención
- [ ] Historia de la marca (por qué "V'Lirio") para "Nosotros"
