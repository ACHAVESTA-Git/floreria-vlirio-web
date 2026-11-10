import { flipUpdate } from './flip';

type Orden = 'relevancia' | 'menor' | 'mayor';

interface Estado {
  categoria: string;
  ocasiones: Set<string>;
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
  const cells = all<HTMLElement>('[data-cell]', grid);
  const sort = must<HTMLSelectElement>('#sort');
  const minInput = must<HTMLInputElement>('#min');
  const maxInput = must<HTMLInputElement>('#max');
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
  const subBase = sub.textContent ?? '';

  const estadoInicial = (): Estado => ({
    categoria: TODOS,
    ocasiones: new Set<string>(),
    orden: 'relevancia',
    min: null,
    max: null,
  });

  const clonar = (e: Estado): Estado => ({ ...e, ocasiones: new Set(e.ocasiones) });

  function leerUrl(): Estado {
    const p = new URLSearchParams(window.location.search);
    const cat = p.get('categoria') ?? TODOS;
    const ocasiones = new Set<string>();
    for (const raw of p.getAll('ocasion')) {
      for (const parte of raw.split(',')) {
        const slug = parte.trim();
        if (ocasionesValidas.includes(slug)) ocasiones.add(slug);
      }
    }
    const ordenRaw = p.get('orden');
    return {
      categoria: categoriasValidas.has(cat) ? cat : TODOS,
      ocasiones,
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
    if (e.orden !== 'relevancia') partes.push(`orden=${e.orden}`);
    if (e.min !== null) partes.push(`min=${e.min}`);
    if (e.max !== null) partes.push(`max=${e.max}`);
    const qs = partes.length > 0 ? `?${partes.join('&')}` : '';
    history.replaceState(history.state, '', `${window.location.pathname}${qs}${window.location.hash}`);
  }

  function hayFiltros(e: Estado): boolean {
    return e.categoria !== TODOS || e.ocasiones.size > 0 || e.orden !== 'relevancia' || e.min !== null || e.max !== null;
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

  function setInput(input: HTMLInputElement, v: number | null): void {
    const txt = v === null ? '' : String(v);
    // No pisar lo que el usuario está escribiendo
    if (document.activeElement !== input && input.value !== txt) input.value = txt;
  }

  function sincronizar(e: Estado): void {
    for (const b of catBtns) {
      b.setAttribute('aria-pressed', String(b.dataset.filterCat === e.categoria));
    }
    for (const c of chips) {
      c.setAttribute('aria-pressed', String(e.ocasiones.has(c.dataset.filterOca ?? '')));
    }
    sort.value = e.orden;
    setInput(minInput, e.min);
    setInput(maxInput, e.max);

    const visibles = cells.filter((c) => !c.hidden).length;
    const etiqueta =
      visibles === 0 ? 'Sin resultados' : visibles === 1 ? '1 producto' : `${visibles} productos`;
    count.textContent = etiqueta;
    empty.hidden = visibles > 0;
    clearBtn.hidden = !hayFiltros(e);

    // Contador del título (mismo valor que #results-count) y del botón "Ver N" del panel móvil
    contadorCat.textContent = `· ${visibles} ${visibles === 1 ? 'detalle' : 'detalles'}`;
    aplicarBtn.textContent = visibles === 0 ? 'Ver sin resultados' : `Ver ${etiqueta.toLowerCase()}`;

    // Badge del botón "Filtrar y ordenar": ocasiones + precio + orden distinto de relevancia
    const activos =
      e.ocasiones.size + (e.min !== null || e.max !== null ? 1 : 0) + (e.orden !== 'relevancia' ? 1 : 0);
    filtrosN.textContent = String(activos);
    filtrosN.hidden = activos === 0;

    const nombre = e.categoria === TODOS ? TITULO_BASE : nombreCategoria(e.categoria);
    nombreCat.textContent = nombre;
    document.title = `${nombre}${SUFIJO_TITULO}`;
    sub.textContent =
      e.categoria === TODOS
        ? subBase
        : `Mostrando ${visibles} ${visibles === 1 ? 'producto' : 'productos'} de ${nombre}`;
  }

  let estado: Estado = estadoInicial();

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

  const escucharPrecio = (input: HTMLInputElement, campo: 'min' | 'max'): void => {
    input.addEventListener('input', () => {
      conDebounce(() => {
        const valor = parseLimite(input.value);
        cambiar((e) => {
          e[campo] = valor;
        });
      });
    });
  };
  escucharPrecio(minInput, 'min');
  escucharPrecio(maxInput, 'max');

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
