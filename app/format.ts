// Formato castellano: coma decimal y fechas legibles.

export const pct = (v: number) => `${Math.round(v * 100)} %`;

export const num = (v: number, decimals = 1) =>
  v.toFixed(decimals).replace('.', ',');

export const fecha = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
