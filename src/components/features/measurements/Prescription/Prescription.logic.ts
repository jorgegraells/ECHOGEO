import { formatNumber, formatPercent } from '@/lib/utils';

// Claves de los valores de una recomendación que son fracciones (0..1) a
// mostrar como porcentaje, o números a mostrar con decimales por locale.
const PERCENT_KEYS = new Set(['presence', 'citation', 'frequency']);
const NUMBER_KEYS = new Set(['best', 'worst', 'index']);

/**
 * Formatea los valores de una recomendación según el idioma antes de
 * interpolarlos en el texto. Mantiene el servicio libre de presentación:
 * él devuelve números crudos y aquí se les da forma.
 */
export function formatValues(
  values: Record<string, string | number>,
  locale: string,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'number' && PERCENT_KEYS.has(key)) {
      out[key] = formatPercent(value, locale);
    } else if (typeof value === 'number' && NUMBER_KEYS.has(key)) {
      out[key] = formatNumber(value, locale);
    } else {
      out[key] = String(value);
    }
  }
  return out;
}
