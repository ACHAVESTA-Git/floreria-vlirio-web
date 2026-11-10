/**
 * Nodos del drawer "Mi canasta" que usa el JS. Se buscan una vez al iniciar;
 * si falta alguno, must() lanza un error que nombra el selector.
 */
import { must } from '../../lib/dom';

export interface BasketNodes {
  drawer: HTMLElement;
  scrim: HTMLElement;
  closeBtn: HTMLButtonElement;
  items: HTMLUListElement;
  vacio: HTMLElement;
  upsell: HTMLElement;
  upsellOpts: HTMLElement;
  total: HTMLElement;
  checkout: HTMLAnchorElement;
  cardMsg: HTMLTextAreaElement;
}

export function leerNodosCanasta(): BasketNodes {
  return {
    drawer: must('#drawer'),
    scrim: must('#scrim'),
    closeBtn: must<HTMLButtonElement>('#closeDrawer'),
    items: must<HTMLUListElement>('#items'),
    vacio: must('#vacio'),
    upsell: must('#upsell'),
    upsellOpts: must('#upsellOpts'),
    total: must('#total'),
    checkout: must<HTMLAnchorElement>('#checkout'),
    cardMsg: must<HTMLTextAreaElement>('#cardMsg'),
  };
}
