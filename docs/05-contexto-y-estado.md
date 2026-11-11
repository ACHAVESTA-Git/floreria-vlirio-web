# Contexto y estado del proyecto — Florería V'Lirio

> **Léelo primero si eres un agente (o una persona) que retoma el proyecto en otra cuenta o sesión.** Resume para qué es, qué está hecho, cómo se trabaja con el autor y qué falta. Las reglas de marca y código siguen en `CLAUDE.md` y `docs/01` a `docs/04`; este archivo no las repite, las enlaza.
>
> Última actualización: 11 de noviembre de 2026.

---

## 1. Qué es y para qué

- **Proyecto de tesis** de Anthony Chavesta (achavestap@gmail.com). Es un sitio de e-commerce para **Florería V'Lirio** (Corporación Vlirio S.A.C., Mercado Unicachi de Comas, Lima).
- El cliente elige flores, arma una canasta y **cierra el pedido por WhatsApp** con un enlace `wa.me` y el mensaje prellenado. **No hay pago en línea.**
- Como parte de la tesis, se **simuló la venta del proyecto** al cliente con una propuesta comercial y modelos de contrato (sección 6). Esa simulación **ya se presentó y se aprobó** con el profesor.
- Es un proyecto **personal**: no se trabaja desde cuentas empresariales.

## 2. Dónde vive

| Qué | Dónde |
|---|---|
| Código | GitHub `git@github.com:ACHAVESTA-Git/floreria-vlirio-web.git` (carpeta local `~/Desktop/floreria-vlirio`) |
| Producción (rama `main`) | https://floreria-vlirio-web.achavestap.workers.dev (Cloudflare Workers, sitio estático desde `./dist`, ver `wrangler.jsonc`) |
| Ramas de prueba | Cloudflare genera una URL de preview por rama (`feature/cloudflare-previews`) |
| Propuesta, contratos y generadores | `~/Desktop/Propuesta V'Lirio/` (**fuera del repo** a propósito, ver sección 6) |
| Hoja de ruta de seguridad y funcionalidades | `docs/hoja-de-ruta-seguridad-y-funcionalidades.pdf` (5 páginas) |

## 3. Stack (resumen; el detalle está en `CLAUDE.md`)

Astro 5 estático + TypeScript estricto, nanostores (canasta y favoritos en `localStorage`), GSAP + ScrollTrigger, Lenis, Content Collections (`src/content/productos/*.json`, 15 productos, esquema zod en `src/content.config.ts`) y despliegue en Cloudflare. Los tokens de marca están en `src/styles/tokens.css` (solo `--vl-*`, nunca hex sueltos).

Comandos: `npm run dev` · `npm run build` (incluye `astro check`, tiene que dar **0 errores**) · `npm run preview`.

### Número de WhatsApp por rama (importante)

`astro.config.mjs` elige el número según la rama que se construye:

- **`main`** → `51936688729` (producción, número de la florería).
- **Cualquier otra rama** (`dev`, `feature/*`) → `51967446580` (número de pruebas del desarrollador).
- Si no se sabe la rama, usa el de producción. `WHATSAPP_NUMBER_OVERRIDE` lo fuerza.

`src/config/site.ts` expone `WHATSAPP_NUMBER` a partir de ese valor. **No cambies ninguno de los dos números.** Si un merge choca con ellos, resuélvelo conservando estos valores y avísale al autor.

## 4. Lo que está hecho (todo en `dev` y `main`, en producción)

1. **Base:** home con hero animado al hacer scroll (tulipanes y fotos), categorías, destacados, banda de ofertas con cuenta regresiva, "Cómo pedir", visítanos; catálogo; detalle de producto; favoritos; canasta en panel lateral y pedido por WhatsApp.
2. **Catálogo compacto:**
   - Grilla de 2 columnas en celular (`ProductCard variant="compact"`).
   - Encabezado "Catálogo · N detalles" con círculos de categoría que funcionan como filtro.
   - Barra lateral de filtros desde 1024px: Ocasión con conteos, Color con muestras `--vl-color-*` y `?color=`, y Precio con slider doble.
   - En celular y tablet, el panel inferior usa rangos de precio predefinidos (Hasta S/50, S/50–100, S/100–150, Más de S/150).
   - El orden va al lado del botón Filtros.
   - El primer producto en 375px pasó de 621px a 331px.
3. **Animación de "volar a la canasta" por producto:**
   - El campo `flores: FlyTipo[]` de cada JSON define qué vuela. Los tipos (`FLY_TIPOS` en `src/config/site.ts`) son rosa, tulipán, girasol, lirio, gerbera, osito y chocolate.
   - Los símbolos SVG están en `Icons.astro`.
4. **Refactor de calidad** (ver `docs/04-guia-de-codigo.md`):
   - Utilidades compartidas en `src/lib/`: `dom.ts`, `text.ts`, `colors.ts`, `events.ts`, `scrollLock.ts` (con conteo de referencias y que detiene Lenis), `focusTrap.ts`, `catalogFacets.ts`, `countdown.ts` y `pedido.ts`.
   - Componentes chicos por área: `basket/`, `catalog/`, `home/`, `layout/` y `product/`.
   - Bugs corregidos: el scroll seguía detrás de los paneles, las trampas de foco se duplicaban, el menú y la canasta se abrían a la vez, el foco no entraba al abrir la canasta y el plural decía "1 productos".
   - Probado en el navegador a 375px y 1280px.
5. **Historial limpio:** se quitaron los trailers `Co-Authored-By` de 32 commits y se forzó el push.

Las ramas locales `feature/*` y `refactor/*` ya están fusionadas y se pueden borrar.

## 5. Reglas de trabajo con el autor (no están en otro lado)

- **Nunca agregues `Co-Authored-By: Claude`** ni ninguna atribución a Claude o Anthropic en commits ni en PRs. Tampoco en los commits de subagentes: díselo explícitamente en el encargo. Los mensajes de commit van en español, son cortos y descriptivos y no llevan trailer (por ejemplo, `refactor: extraer FilterPanel del catálogo`).
- **No guardes respaldos locales** (ramas `backup/*`, copias de la carpeta) cuando reescribas el historial. GitHub es el respaldo.
- **Haz commit o push solo si el autor lo pide.** Los `push --force` los ejecuta él.
- **No toques los números de WhatsApp** (sección 3).
- **Responde en español.** El autor prefiere respuestas directas y con recomendación.
- **Antes de fusionar, prueba en el navegador** a 375px y 1280px (teclado, Escape, foco, scroll de fondo). "Compila" no es lo mismo que "funciona".

## 6. Simulación de venta (propuesta comercial y contratos)

Archivos en `~/Desktop/Propuesta V'Lirio/`:

| Archivo | Qué es |
|---|---|
| `01-propuesta-comercial-vlirio.pdf` | **Propuesta final, la que se presentó** (11 páginas): portada, resumen con QR a la demo, capturas reales (con nota de que el diseño y las animaciones están sujetos a cambios), comparativa, maquetas del panel admin (computadora y celular), maquetas del Premium (pedidos, métricas, WhatsApp con número de pedido, Google), propuesta económica, plazos y condiciones, y pendientes y aceptación |
| `02-contrato-paquete-profesional.pdf` / `03-contrato-paquete-premium.pdf` | Modelos de **contrato de locación de servicios** (Código Civil, art. 1764 y siguientes) con anexos A (alcance), B (cronograma y registro de pagos) y C (acta de entrega). La **cláusula décimo novena** dice que la legalización notarial de firmas la paga el desarrollador. Los DNI, RUC y domicilios siguen como `[____]`. **No se envían hasta que el cliente acepte la propuesta.** |
| `generador/` | Scripts de Python con reportlab: `marca.py` (datos, precios y estilos), `mockups.py` (maquetas dibujadas), `propuesta.py`, `contratos.py` y `hoja_de_ruta.py`, más `img/` |
| `fonts/` | Nunito y Poppins (los generadores las buscan en `../fonts`) |

### Precios finales (contrato de 12 meses)

| Paquete | Opción | Adelanto | Mensual |
|---|---|---|---|
| **Profesional** (web y panel admin) | Al contado | S/ 2,000 | S/ 60 de dominio, hosting y soporte |
| | En partes | S/ 1,000 | S/ 150 × 12 (100 de la web + 50 de dominio y hosting) |
| | Mensualidad fija | — | S/ 350 × 12 (300 de la web + 50 de dominio y hosting) |
| **Premium** (más métricas, análisis de ventas, registro de pedidos y páginas por ocasión) | Al contado | S/ 4,000 | S/ 100 |
| | En partes | S/ 2,000 | S/ 300 × 12 (200 de la web + 100 de dominio y hosting) |

- **Renovación después de los 12 meses:** S/ 60 al mes en el Profesional y S/ 100 en el Premium.
- **Cambios fuera del alcance:** S/ 40 por hora.
- **No hay paquete "Esencial":** se eliminó. En el código, `ALCANCE["base"]` es la web actual, incluida en los dos paquetes.
- **Pendiente sugerido y no aplicado:** el dominio del Profesional cuesta S/ 60 al contado y S/ 50 en las otras opciones. Convendría unificarlo.
- **Costo real para el desarrollador:**
  - Dominio `.com` en Cloudflare: unos S/ 40 al año. `.com.pe`: unos S/ 110–150 al año (confirmar en punto.pe).
  - Hosting en Workers, más D1 y R2: gratis con este volumen.
  - **Usa D1 + R2 y no Supabase Pro** (unos US$ 25 al mes), que se comería la mensualidad.

### Regenerar los PDFs

```bash
cd "$HOME/Desktop/Propuesta V'Lirio"
python3 -m venv .venv && .venv/bin/pip install reportlab pypdfium2 pillow
cd generador
../.venv/bin/python propuesta.py ../01-propuesta-comercial-vlirio.pdf
../.venv/bin/python contratos.py ..
../.venv/bin/python hoja_de_ruta.py ../fonts ../../floreria-vlirio/docs/hoja-de-ruta-seguridad-y-funcionalidades.pdf
```

Los precios, textos y alcance se cambian **solo** en `generador/marca.py` (`PAQUETES`, `ALCANCE`, `NO_INCLUYE`, `PLAZO_CONTRATO`, `LOCADOR`, `COMITENTE`). La propuesta y los contratos se recalculan solos. Después de regenerar, revisa las páginas como imagen (con pypdfium2): las tablas se pueden pasar de página.

## 7. Qué falta

### Del producto (si el proyecto continúa)
- **Panel admin** (paquete Profesional): login, CRUD de productos con fotos, categorías, promociones con fechas y productos del mes. El plan es mover el catálogo de Content Collections a **Cloudflare D1** (datos) y **R2** (imágenes) sin tocar los componentes: `src/lib/catalog.ts` es el único punto de acceso a los datos.
- **Premium:** registro de pedidos con número y estados, panel de métricas y análisis, y páginas por ocasión con SEO local.
- **Seguridad y funcionalidades:** ver la hoja de ruta en PDF. Seguridad S1–S10: cabeceras y CSP, XSS, dependencias, secretos, RLS, sesiones, validación en servidor, tokenización, webhooks firmados y rate limiting con Turnstile. Funcionalidades F1–F12.

### Mejoras pequeñas detectadas (sin hacer)
- Los favoritos no se sincronizan entre pestañas.
- A 900px el header corta "Mi canasta".
- En celular, los acordeones de filtros podrían empezar cerrados.
- El hero del home es muy alto (1868–2640px) y el CTA no se ve al cargar. Convendría subir "Los más pedidos" y que el CTA del hero lleve a `#categorias`.

### Pendientes con el cliente
Logo en SVG o PNG transparente, eslogan definitivo, usuarios de redes sociales, ofertas reales (hoy son `demo: true`), fotos que faltan, historia de la marca para "Nosotros" y dominio.

### Repo
- `.playwright-mcp/` tiene capturas de pruebas sin seguimiento. Conviene agregarla a `.gitignore`.
