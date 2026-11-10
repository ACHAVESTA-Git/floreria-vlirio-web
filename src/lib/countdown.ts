// Cuenta regresiva de las promos: cálculos puros (sin DOM). Las promos cierran el domingo a las 23:59:59.

const SEGUNDOS_DIA = 86400;
const SEGUNDOS_HORA = 3600;
const SEGUNDOS_MINUTO = 60;
const DIAS_SEMANA = 7;
const HORA_CIERRE = 23;
const MINUTO_CIERRE = 59;
const SEGUNDO_CIERRE = 59;

export interface Desglose {
  dias: number;
  horas: number;
  min: number;
}

/** Próximo domingo a las 23:59:59 (hora local). Si ya pasó, el de la semana siguiente. */
export function proximoCierre(ahora: Date): Date {
  const fin = new Date(ahora);
  fin.setDate(ahora.getDate() + ((DIAS_SEMANA - ahora.getDay()) % DIAS_SEMANA));
  fin.setHours(HORA_CIERRE, MINUTO_CIERRE, SEGUNDO_CIERRE, 0);
  if (fin.getTime() <= ahora.getTime()) fin.setDate(fin.getDate() + DIAS_SEMANA);
  return fin;
}

/** Segundos que faltan para `cierre`, nunca negativos. */
export function segundosHasta(cierre: Date, ahora: Date): number {
  return Math.max(0, Math.floor((cierre.getTime() - ahora.getTime()) / 1000));
}

/** Reparte los segundos en días, horas y minutos (los segundos sueltos no se muestran). */
export function desglosar(segundos: number): Desglose {
  const dias = Math.floor(segundos / SEGUNDOS_DIA);
  const resto = segundos - dias * SEGUNDOS_DIA;
  const horas = Math.floor(resto / SEGUNDOS_HORA);
  const min = Math.floor((resto - horas * SEGUNDOS_HORA) / SEGUNDOS_MINUTO);
  return { dias, horas, min };
}
