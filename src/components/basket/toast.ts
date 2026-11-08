export interface ToastAccion {
  label: string;
  onClick: () => void;
}

const DURACION_MS = 3200;
let temporizador: number | undefined;

/** Muestra el toast. El texto se escribe con textContent (nunca innerHTML). */
export function showToast(texto: string, accion?: ToastAccion): void {
  const el = document.getElementById('toast');
  if (!el) return;

  el.replaceChildren();
  const span = document.createElement('span');
  span.textContent = texto;
  el.append(span);

  if (accion) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = accion.label;
    boton.addEventListener('click', () => {
      ocultar();
      accion.onClick();
    });
    el.append(boton);
  }

  el.classList.add('on');
  window.clearTimeout(temporizador);
  temporizador = window.setTimeout(ocultar, DURACION_MS);
}

function ocultar(): void {
  document.getElementById('toast')?.classList.remove('on');
}
