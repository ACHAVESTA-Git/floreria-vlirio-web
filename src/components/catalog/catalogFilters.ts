import { flipUpdate } from './flip';

type Orden = 'relevancia' | 'menor' | 'mayor';

interface Estado {
  categoria: string;
  ocasiones: Set<string>;
  colores: Set<string>;
  orden: Orden;
  min: number | null;
  max: number | null;
}

const TODOS = 'todos';
const TITULO_BASE = 'Catálogo';
const SUFIJO_TITULO = " · Florería V'Lirio";
const DEBOUNCE_MS = 250;
const ORDENES: readonly Orden[] = ['relevancia', 'menor', 'mayor'];

/** Devuelve el elemento o lanza error si falta (evita nulos en closures). */
function must<T extends Element>(selector: string): T {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`[catalogo] Falta el elemento ${selector}`);
  return el as T;
}

function all<T extends HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

function isOrden(v: string | null): v is Orden {
  return v !== null && (ORDENES as readonly string[]).includes(v);
}

/** Límite de precio: vacío o inválido => null (sin límite). */
function parseLimite(raw: string | null): number | null {
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function precioDe(cell: HTMLElement): number {
  const n = Number.parseFloat(cell.dataset.precio ?? '');
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function relDe(cell: HTMLElement): number {
  const n = Number.parseFloat(cell.dataset.rel ?? '');
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

function coincide(cell: HTMLElement, e: Estado): boolean {
  if (e.categoria !== TODOS && cell.dataset.cat !== e.categoria) return false;
  if (e.ocasiones.size > 0) {
    // Cualquiera de las ocasiones seleccionadas
    const ocasionesCelda = (cell.dataset.oca ?? '').split(' ').filter(Boolean);
    if (!ocasionesCelda.some((o) => e.ocasiones.has(o))) return false;
  }
  if (e.colores.size > 0) {
    const coloresCelda = (cell.dataset.color ?? '').split(' ').filter(Boolean);
    if (!coloresCelda.some((c) => e.colores.has(c))) return false;
  }
  const precio = precioDe(cell);
  if (e.min !== null && precio < e.min) return false;
  if (e.max !== null && precio > e.max) return false;
  return true;
}

function comparador(orden: Orden): (a: HTMLElement, b: HTMLElement) => number {
  const porRel = (a: HTMLElement, b: HTMLElement): number => relDe(a) - relDe(b);
  if (orden === 'relevancia') return porRel;
  const dir = orden === 'menor' ? 1 : -1;
  return (a, b) => (precioDe(a) - precioDe(b)) * dir || porRel(a, b);
}

const initialized = new WeakSet<HTMLElement>();
let timer: number | undefined;

export function initCatalog(): void {
  const grid = must<HTMLUListElement>('#grid');
  if (initialized.has(grid)) return;
  initialized.add(grid);

  const catBtns = all<HTMLButtonElement>('[data-filter-cat]');
  const chips = all<HTMLButtonElement>('[data-filter-oca]');
  const colorBtns = all<HTMLButtonElement>('[data-filter-color]');
  const rangoBtns = all<HTMLButtonElement>('[data-rango-min]');
  const cells = all<HTMLElement>('[data-cell]', grid);
  const sort = must<HTMLSelectElement>('#sort');
  const slider = must<HTMLElement>('#slider');
  const pmin = must<HTMLInputElement>('#pmin');
  const pmax = must<HTMLInputElement>('#pmax');
  const sliderVal = must<HTMLElement>('#slider-val');
  const accN = {
    oca: must<HTMLElement>('[data-acc-n="oca"]'),
    color: must<HTMLElement>('[data-acc-n="color"]'),
    precio: must<HTMLElement>('[data-acc-n="precio"]'),
  };
  const BORDE_MIN = Number(slider.dataset.min ?? 0);
  const BORDE_MAX = Number(slider.dataset.max ?? 0);
  const clearBtn = must<HTMLButtonElement>('#clear');
  const emptyClearBtn = must<HTMLButtonElement>('#empty-clear');
  const empty = must<HTMLElement>('#empty');
  const count = must<HTMLElement>('#results-count');
  const nombreCat = must<HTMLElement>('#cat-name');
  const contadorCat = must<HTMLElement>('#cat-count');
  const sub = must<HTMLElement>('#cat-sub');
  const filtrosN = must<HTMLElement>('#filtros-n');
  const aplicarBtn = must<HTMLButtonElement>('#sheet-apply');

  const categoriasValidas = new Set<string>([TODOS, ...catBtns.map((b) => b.dataset.filterCat ?? '')]);
  const ocasionesValidas = chips.map((c) => c.dataset.filterOca ?? '').filter(Boolean);
  const coloresValidos = colorBtns.map((c) => c.dataset.filterColor ?? '').filter(Boolean);
  const subBase = sub.textContent ?? '';

  const estadoInicial = (): Estado => ({
    categoria: TODOS,
    ocasiones: new Set<string>(),
    colores: new Set<string>(),
    orden: 'relevancia',
    min: null,
    max: null,
  });

  const clonar = (e: Estado): Estado => ({ ...e, ocasiones: new Set(e.ocasiones), colores: new Set(e.colores) });

  /** Lee una lista separada por comas (?ocasion=amor,aniversario) quedándose con los valores válidos. */
  function leerLista(p: URLSearchParams, clave: string, validos: string[]): Set<string> {
    const out = new Set<string>();
    for (const raw of p.getAll(clave)) {
      for (const parte of raw.split(',')) {
        const slug = parte.trim();
        if (validos.includes(slug)) out.add(slug);
      }
    }
    return out;
  }

  function leerUrl(): Estado {
    const p = new URLSearchParams(window.location.search);
    const cat = p.get('categoria') ?? TODOS;
    const ocasiones = leerLista(p, 'ocasion', ocasionesValidas);
    const colores = leerLista(p, 'color', coloresValidos);
    const ordenRaw = p.get('orden');
    return {
      categoria: categoriasValidas.has(cat) ? cat : TODOS,
      ocasiones,
      colores,
      orden: isOrden(ordenRaw) ? ordenRaw : 'relevancia',
      min: parseLimite(p.get('min')),
      max: parseLimite(p.get('max')),
    };
  }

  function escribirUrl(e: Estado): void {
    const partes: string[] = [];
    if (e.categoria !== TODOS) partes.push(`categoria=${encodeURIComponent(e.categoria)}`);
    const oc = ocasionesValidas.filter((s) => e.ocasiones.has(s));
    if (oc.length > 0) partes.push(`ocasion=${oc.map(encodeURIComponent).join(',')}`);
    const col = coloresValidos.filter((s) => e.colores.has(s));
    if (col.length > 0) partes.push(`color=${col.map(encodeURIComponent).join(',')}`);
    if (e.orden !== 'relevancia') partes.push(`orden=${e.orden}`);
    if (e.min !== null) partes.push(`min=${e.min}`);
    if (e.max !== null) partes.push(`max=${e.max}`);
    const qs = partes.length > 0 ? `?${partes.join('&')}` : '';
    history.replaceState(history.state, '', `${window.location.pathname}${qs}${window.location.hash}`);
  }

  function hayFiltros(e: Estado): boolean {
    return e.categoria !== TODOS || e.ocasiones.size > 0 || e.colores.size > 0 || e.orden !== 'relevancia' || e.min !== null || e.max !== null;
  }

  function nombreCategoria(slug: string): string {
    const btn = catBtns.find((b) => b.dataset.filterCat === slug);
    return btn?.textContent?.trim() || slug;
  }

  /** Solo cambia hidden y order de las celdas (sin mover nodos). */
  function aplicarCeldas(e: Estado): void {
    const ordenadas = [...cells].sort(comparador(e.orden));
    ordenadas.forEach((cell, i) => {
      cell.style.order = String(i);
    });
    for (const cell of cells) {
      cell.hidden = !coincide(cell, e);
    }
  }

  /** Mueve el slider y su relleno al rango del estado (sin límite = el borde). */
  function pintarSlider(min: number | null, max: number | null): void {
    const a = min ?? BORDE_MIN;
    const b = max ?? BORDE_MAX;
    pmin.value = String(a);
    pmax.value = String(b);
    const pct = (v: number): string => `${((v - BORDE_MIN) / Math.max(1, BORDE_MAX - BORDE_MIN)) * 100}%`;
    slider.style.setProperty('--a', pct(a));
    slider.style.setProperty('--b', pct(b));
    sliderVal.textContent = `S/${a} – S/${b}`;
    pmin.setAttribute('aria-valuetext', `S/${a}`);
    pmax.setAttribute('aria-valuetext', `S/${b}`);
  }

  const leerRango = (raw: string | undefined): number | null => parseLimite(raw ?? null);

  function marcarBadge(el: HTMLElement, n: number): void {
    el.textContent = String(n);
    el.hidden = n === 0;
  }

  function sincronizar(e: Estado): void {
    for (const b of catBtns) {
      b.setAttribute('aria-pressed', String(b.dataset.filterCat === e.categoria));
    }
    for (const c of chips) {
      c.setAttribute('aria-pressed', String(e.ocasiones.has(c.dataset.filterOca ?? '')));
    }
    for (const c of colorBtns) {
      c.setAttribute('aria-pressed', String(e.colores.has(c.dataset.filterColor ?? '')));
    }
    for (const r of rangoBtns) {
      const activo =
        (e.min !== null || e.max !== null) &&
        leerRango(r.dataset.rangoMin) === e.min &&
        leerRango(r.dataset.rangoMax) === e.max;
      r.setAttribute('aria-pressed', String(activo));
    }
    sort.value = e.orden;
    // No mover el slider mientras se arrastra (lo pinta su propio evento)
    if (!arrastrando) pintarSlider(e.min, e.max);

    const visibles = cells.filter((c) => !c.hidden).length;
    const etiqueta =
      visibles === 0 ? 'Sin resultados' : visibles === 1 ? '1 producto' : `${visibles} productos`;
    count.textContent = etiqueta;
    empty.hidden = visibles > 0;
    clearBtn.hidden = !hayFiltros(e);

    // Contador del título (mismo valor que #results-count) y del botón "Ver N" del panel móvil
    contadorCat.textContent = `· ${visibles} ${visibles === 1 ? 'detalle' : 'detalles'}`;
    aplicarBtn.textContent = visibles === 0 ? 'Ver sin resultados' : `Ver ${etiqueta.toLowerCase()}`;

    // Badges: botón "Filtros" (todo lo del panel) y cada acordeón
    const conPrecio = e.min !== null || e.max !== null ? 1 : 0;
    marcarBadge(filtrosN, e.ocasiones.size + e.colores.size + conPrecio);
    marcarBadge(accN.oca, e.ocasiones.size);
    marcarBadge(accN.color, e.colores.size);
    marcarBadge(accN.precio, conPrecio);

    const nombre = e.categoria === TODOS ? TITULO_BASE : nombreCategoria(e.categoria);
    nombreCat.textContent = nombre;
    document.title = `${nombre}${SUFIJO_TITULO}`;
    sub.textContent =
      e.categoria === TODOS
        ? subBase
        : `Mostrando ${visibles} ${visibles === 1 ? 'producto' : 'productos'} de ${nombre}`;
  }

  let estado: Estado = estadoInicial();
  let arrastrando = false;

  function aplicar(e: Estado, animar: boolean): void {
    estado = e;
    if (animar) {
      flipUpdate(grid, () => aplicarCeldas(e));
    } else {
      aplicarCeldas(e);
    }
    sincronizar(e);
  }

  function cancelarDebounce(): void {
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timer = undefined;
    }
  }

  function conDebounce(fn: () => void): void {
    cancelarDebounce();
    timer = window.setTimeout(() => {
      timer = undefined;
      fn();
    }, DEBOUNCE_MS);
  }

  function cambiar(mod: (e: Estado) => void): void {
    const siguiente = clonar(estado);
    mod(siguiente);
    escribirUrl(siguiente);
    aplicar(siguiente, true);
  }

  function limpiar(): void {
    cancelarDebounce();
    const siguiente = estadoInicial();
    escribirUrl(siguiente);
    aplicar(siguiente, true);
  }

  // Estado inicial desde la URL, sin animación
  estado = leerUrl();
  aplicarCeldas(estado);
  sincronizar(estado);

  // Eventos
  for (const b of catBtns) {
    b.addEventListener('click', () => {
      const cat = b.dataset.filterCat ?? TODOS;
      cambiar((e) => {
        e.categoria = cat;
      });
    });
  }

  for (const c of chips) {
    c.addEventListener('click', () => {
      const oca = c.dataset.filterOca ?? '';
      if (!oca) return;
      cambiar((e) => {
        if (e.ocasiones.has(oca)) e.ocasiones.delete(oca);
        else e.ocasiones.add(oca);
      });
    });
  }

  sort.addEventListener('change', () => {
    const v = sort.value;
    if (!isOrden(v)) return;
    const orden: Orden = v;
    cambiar((e) => {
      e.orden = orden;
    });
  });

  for (const c of colorBtns) {
    c.addEventListener('click', () => {
      const color = c.dataset.filterColor ?? '';
      if (!color) return;
      cambiar((e) => {
        if (e.colores.has(color)) e.colores.delete(color);
        else e.colores.add(color);
      });
    });
  }

  // Rangos rápidos: tocar el activo lo quita
  for (const r of rangoBtns) {
    r.addEventListener('click', () => {
      const min = leerRango(r.dataset.rangoMin);
      const max = leerRango(r.dataset.rangoMax);
      const yaActivo = r.getAttribute('aria-pressed') === 'true';
      cambiar((e) => {
        e.min = yaActivo ? null : min;
        e.max = yaActivo ? null : max;
      });
    });
  }

  // Slider: los puntos no se cruzan; en el borde equivale a "sin límite"
  const escucharSlider = (input: HTMLInputElement, campo: 'min' | 'max'): void => {
    input.addEventListener('input', () => {
      let a = Number(pmin.value);
      let b = Number(pmax.value);
      if (a > b) {
        if (campo === 'min') a = b;
        else b = a;
      }
      arrastrando = true;
      pintarSlider(a, b);
      const min = a <= BORDE_MIN ? null : a;
      const max = b >= BORDE_MAX ? null : b;
      conDebounce(() => {
        cambiar((e) => {
          e.min = min;
          e.max = max;
        });
        arrastrando = false;
      });
    });
  };
  escucharSlider(pmin, 'min');
  escucharSlider(pmax, 'max');

  clearBtn.addEventListener('click', limpiar);
  emptyClearBtn.addEventListener('click', limpiar);

  // Botones atrás/adelante del navegador
  const onPopState = (): void => {
    if (!grid.isConnected) {
      window.removeEventListener('popstate', onPopState);
      return;
    }
    cancelarDebounce();
    aplicar(leerUrl(), true);
  };
  window.addEventListener('popstate', onPopState);
}
