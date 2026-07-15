// Formato numérico y de fechas según el idioma activo. Usa Intl para que
// la coma decimal, el símbolo de porcentaje y el mes salgan en su idioma.

/** Porcentaje a partir de una fracción 0..1 (0,58 → "58 %"). */
export function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(value);
}

/** Número con decimales fijos (6,1 en es · 6.1 en en). */
export function formatNumber(value: number, locale: string, decimals = 1): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Fecha y hora legibles a partir de un ISO string. */
export function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}
