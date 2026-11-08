# 03 · Diseño, UX y animaciones

Referencia visual: `boceto/index.html` (ábrelo en el navegador). Este documento explica **qué** hace cada sección y **cómo** debe sentirse.

**Principio de movimiento:** *orgánico y suave, como una flor que se abre.* Easing `power2.out` o `cubic-bezier(.22,1,.36,1)` y duraciones de 300–900 ms. Nada de rebotes exagerados, giros rápidos ni parpadeos.

---

## 1. Header (R1, R2)

```
[ 🌷 Florería V'LIRI♥ ]     Inicio  Catálogo  Ocasiones  Nosotros  Contacto     [WhatsApp] [🧺 ♥2]
```
- **Sticky.** Al bajar más de 80px se compacta (altura de 84 → 64px), fondo crema al 85% con `backdrop-filter: blur(12px)` y sombra suave.
- **Logo:** componente `Logo.astro` en SVG (7 tulipanes en arco, "Florería" en Luxurious Script y "V'LIRI" + corazón en Nunito Black, todo en `--vl-vino`). En el móvil se ven solo los tulipanes y "V'LIRI♥".
- **Canasta:** ícono de **canasta de mimbre** (SVG propio con asa curva, no el carrito genérico) y badge con forma de **corazón** que muestra la cantidad. Etiqueta accesible: `aria-label="Mi canasta, 2 productos"`.
  - Al recibir un producto: la canasta se "mece" (rotate ±8°, 400 ms) y el corazón late (scale 1 → 1.35 → 1).
  - Al hacer clic se abre el **drawer lateral** "Mi canasta".
- **Móvil (<768px):** menú hamburguesa → panel a pantalla completa con fondo blush. La canasta y WhatsApp siempre visibles.

## 2. Hero con scroll (R3, R4)

Sección de unos **300vh** con un "stage" `position: sticky` de 100vh. La animación avanza con el scroll (GSAP ScrollTrigger con `scrub: 1`).

| Progreso | Qué pasa |
|---|---|
| **0%** (carga) | Fondo crema → blush. **Ya se ven 7 tulipanes ilustrados** (SVG, como los del logo) brotando pequeños desde abajo, para que la primera pantalla nunca se vea vacía. Indicador "Desliza para descubrir ↓" |
| **0 → 35%** | Los tallos crecen (`scaleY` desde abajo), los capullos se abren (scale y rotate leve) y se escalonan como el arco del logo. Pétalos sueltos flotan con parallax |
| **35 → 65%** | Los tulipanes se desvanecen a un lado. Aparece el mensaje línea por línea con fade y blur-in: *"Aquí no solo vendemos flores,"* (Nunito 800) / *"entregamos momentos"* / *"que llegan al corazón ♥"* (la última palabra en Luxurious Script, en vino) |
| **65 → 100%** | **Paneo de fotos reales:** 4 o 5 ramos sin fondo entran desde los lados a distintas velocidades (parallax horizontal) y forman una composición. Aparecen el CTA **"Ver catálogo"** (frambuesa) y uno secundario **"Pedir por WhatsApp"** |

**Requisitos**
- `prefers-reduced-motion: reduce` → mostrar directamente el estado final (mensaje, fotos y CTAs), sin pin.
- En el móvil, el pin dura menos (unos 200vh) y las fotos son 3.
- El texto del mensaje existe en el HTML desde el inicio (SEO y lectores de pantalla). La animación solo cambia la opacidad.
- **Lenis** para un scroll suave, sincronizado con ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)`).
- No bloquear el LCP: el primer frame se pinta solo con CSS y GSAP se carga después (`client:idle` o un `<script>` diferido).

## 3. Categorías y ocasiones (R5)

**Título:** "Encuentra el detalle perfecto". Subtítulo: "Elige por tipo de arreglo o por ocasión".

- **Tarjetas por categoría:** rectángulos con `border-radius: 24px` y relación 4:5. Cada una tiene fondo con degradado blush, la **foto sin fondo** que sobresale un poco por arriba (efecto 3D sutil), nombre (Nunito 800), "Desde S/xx" (Poppins) y una flecha.
  - Grilla: 6 columnas en escritorio, 3 en tablet y carrusel horizontal con scroll-snap en el móvil.
  - Hover: la foto sube 8px y gira 2°, la sombra crece y la flecha se desplaza. Al hacer clic lleva a `/catalogo?categoria=<slug>` con **View Transition** (la foto de la tarjeta "viaja" al encabezado del catálogo).
- **Chips de ocasión** debajo: píldoras minimalistas (borde vino de 1px, texto vino; en hover o activo: fondo vino y texto blanco) con un ícono lineal pequeño (corazón, pastel, birrete, etc.). Llevan a `/catalogo?ocasion=<slug>`.

## 4. Destacados (R6)
- Título: "Los más pedidos" con el subtítulo en script "hechos con amor".
- **Carrusel horizontal** (scroll-snap y flechas en escritorio) de 6 a 8 `ProductCard`.
- **ProductCard:** foto sin fondo sobre fondo blanco con un círculo blush detrás, botón de favorito (corazón), nombre, descripción corta (2 líneas máximo), precio (Poppins 600, frambuesa) y botón **"Agregar a la canasta"** (píldora frambuesa con ícono de canasta).
- Al hacer clic en la tarjeta (fuera del botón) se abre `/catalogo/[slug]`.

## 5. Ofertas de la semana (R7)
- **Banda** de ancho completo con fondo `--vl-blush`, un título a la izquierda ("Ofertas de la semana", texto breve y un CTA "Ver todas") y 3 tarjetas a la derecha.
- Las tarjetas llevan un badge **"-15%"** (frambuesa), el precio anterior tachado (tinta suave) y el precio nuevo en frambuesa.
- Opcional: una cuenta regresiva hasta el domingo (le da urgencia sin gritar).
- Datos con `precioOferta` y `demo: true` hasta que el cliente defina los descuentos.

## 6. Cómo pedir
Tres pasos con íconos lineales en vino y una línea punteada que los une, dibujada al entrar en pantalla (stroke-dashoffset):
1. **Elige tus flores** y agrégalas a tu canasta
2. **Envía tu pedido por WhatsApp** con un clic
3. **Lo preparamos y lo llevamos** con todo el cariño

## 7. Visítanos y redes
- Foto real de la tienda (`ramo-mixto-lirios-blanco-rosa-frente-tienda`), dirección, horario, mapa embebido (Google Maps, con `loading="lazy"`) y botones de Instagram, Facebook, TikTok y WhatsApp.
- Pagos: "Yape · Plin · Transferencia" (sin números de cuenta).

## 8. Footer
Fondo `--vl-vino`, logo en blanco, enlaces, contacto, redes y "Hecho con ♥ en Lima". Arriba lleva una fila de tulipanes en silueta como borde decorativo.

---

## 9. Canasta y animación de girasoles (R2, R8) ⭐ microinteracción firma

### Flujo
1. El usuario pulsa **"Agregar a la canasta"**.
2. El botón cambia a "✓ Agregado" durante 1.2 s (y vuelve a su estado).
3. **Salen de 3 a 5 siluetas de girasol** (SVG, `--vl-girasol` con centro `--vl-vino-oscuro`) desde el centro del botón.
4. Cada una vuela por una **curva Bézier** (sube y se abre hacia un lado, luego se curva) hasta el ícono de la canasta, girando 180–360°, escalando de 1 → 0.4 y con un escalonado de 70 ms. Dura unos **800–900 ms**.
5. Al llegar, cada girasol "cae" dentro de la canasta. Con el primero, la canasta se mece; con el último, **el contador corazón late** y sube el número.
6. Un toast discreto abajo: "Resplandor Dorado se agregó a tu canasta · Ver canasta".

### Implementación sugerida (`flyToBasket.ts`)
- Calcula `getBoundingClientRect()` del botón y del ícono de la canasta (que está en el header sticky, así que el destino siempre es visible).
- Crea los SVG en un contenedor `position: fixed; pointer-events: none; z-index: 9999`.
- Anima con `element.animate()` (WAAPI) usando keyframes con puntos intermedios, o con GSAP `MotionPathPlugin`. Al terminar, elimina los nodos.
- `prefers-reduced-motion` → sin vuelo: solo el latido del contador y el toast.
- Si el usuario hace clic varias veces seguidas, limita a 8 siluetas en vuelo a la vez.

### Recomendación de marca
La idea de los girasoles **funciona muy bien** como experiencia: es tangible, alegre y comunica "esto se fue a tu canasta" sin leer nada. Aun así, el logo usa **tulipanes**, así que hay dos opciones (el boceto permite comparar):
- **Girasoles** (idea original): más alegres y visibles por el amarillo, que contrasta con la paleta vino.
- **Tulipanes en vino:** más coherentes con el logo, la animación se vuelve parte de la identidad.
- Opción mixta: usar **la flor principal del producto** (girasoles si el ramo tiene girasoles, tulipanes si tiene tulipanes, rosas si no). Es un detalle que se recuerda.

### Drawer "Mi canasta"
- Entra desde la derecha (420px; pantalla completa en el móvil), con fondo crema y el título "Mi canasta 🧺" en Nunito 800.
- Cada ítem muestra miniatura, nombre, precio, controles − cantidad + y "quitar".
- **Extras sugeridos:** "¿Le agregas un detalle?" con chocolates o peluche (ticket promedio más alto).
- Campo opcional "Mensaje para la tarjeta".
- Total y botón **"Pedir por WhatsApp"**, que arma el texto:
  ```
  Hola V'Lirio 🌷, quiero hacer este pedido:
  • 1 × Resplandor Dorado — S/200
  • 2 × Ferrero Rocher 4u — S/30
  Total: S/230
  Mensaje para la tarjeta: "..."
  ```
  y abre `https://wa.me/${WHATSAPP_NUMBER}?text=<encodeURIComponent>` (en la demo `51967446580`).
- **Botón flotante de WhatsApp** en todas las páginas: círculo verde WhatsApp (#25D366) con el ícono oficial, abajo a la derecha (en el móvil por encima de la barra del navegador). Mensaje: "Hola V'Lirio 🌷, quiero información sobre sus arreglos". Al hacer scroll aparece un tooltip "¿Te ayudamos a elegir?" una sola vez.
- Canasta vacía: ilustración de una canasta con un tulipán y el texto "Tu canasta está esperando flores", con CTA al catálogo.

---

## 10. Página de catálogo (`/catalogo`)
- Encabezado con el título de la categoría activa y su foto (destino de la View Transition).
- **Barra de filtros sticky:** tabs de categoría (píldoras), chips de ocasión (multi-selección), orden (relevancia, menor precio, mayor precio) y rango de precio.
- Grilla de `ProductCard` (2 columnas en el móvil, 3 en tablet, 4 en escritorio). Al filtrar, la grilla se reordena con una animación FLIP suave.
- Los filtros se reflejan en la URL (`?categoria=box&ocasion=amor`) para poder compartir el enlace.

## 11. Detalle (`/catalogo/[slug]`)
- Galería (sin fondo y con fondo), nombre, precio, descripción, **colores disponibles** como puntos (igual que en el PDF), ocasiones, selector de cantidad, "Agregar a la canasta" (con los girasoles) y "Pedir ahora por WhatsApp".
- "También te puede gustar": 4 productos de la misma categoría.

---

## 12. Inspiración moderna (sin copiar)
- **Refero** (https://refero.design, MCP en https://refero.design/mcp): busca patrones como "flower shop", "ecommerce product card", "cart drawer" o "scroll storytelling hero".
- **MotionSites** (https://motionsites.ai, MCP `motionsites`): usa `search_prompts` con "florist", "botanical", "romantic luxury" o "scroll animation hero" para ideas de secciones y movimiento.
- Ideas 3D ligeras que sí encajan: pétalos con profundidad (parallax en capas), tarjetas con tilt sutil al mover el mouse y sombras que reaccionan. **Evitar Three.js en la demo** (pesa mucho para el móvil); si se quiere 3D real, usar un video corto o Lottie de un tulipán abriéndose.

## 13. Checklist de calidad por sección
- [ ] Funciona en 375px sin scroll horizontal
- [ ] Contraste AA y foco visible
- [ ] `prefers-reduced-motion` respetado
- [ ] Imágenes optimizadas, con `alt` y lazy debajo del fold
- [ ] Textos en el tono de la marca (cercano y en "tú")
- [ ] Tokens de color y fuentes, sin hex sueltos
