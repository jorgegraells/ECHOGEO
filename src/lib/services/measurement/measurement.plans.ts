import type { MeasurementConfig } from '@/types';

import { InvalidConfigError } from './measurement.errors';

// Tamaños de una medición puntual. Aquí viven solo los LÍMITES TÉCNICOS: los
// precios no se guardan en el repositorio (es público) ni en el código, sino
// en la pasarela de pago, que además permite cambiarlos sin desplegar.

export type MeasurementSizeId = 'basic' | 'medium' | 'full';

export interface MeasurementSize {
  id: MeasurementSizeId;
  /** Máximo de preguntas que se miden en este tamaño. */
  maxPrompts: number;
  /**
   * Pasadas por prompt. Van fijas: son la garantía de que el índice refleja la
   * varianza real del motor y no una foto suelta, así que no se recortan para
   * abaratar.
   */
  runsPerPrompt: number;
}

export const MEASUREMENT_SIZES: Record<MeasurementSizeId, MeasurementSize> = {
  basic: { id: 'basic', maxPrompts: 5, runsPerPrompt: 3 },
  medium: { id: 'medium', maxPrompts: 10, runsPerPrompt: 3 },
  full: { id: 'full', maxPrompts: 15, runsPerPrompt: 3 },
};

/** Comprueba si un valor arbitrario es un tamaño válido. */
export function isMeasurementSize(value: string | undefined): value is MeasurementSizeId {
  return value !== undefined && value in MEASUREMENT_SIZES;
}

/**
 * Ajusta una config al tamaño contratado y valida que cabe. El límite se
 * aplica en el servidor: el formulario ayuda, pero no es la autoridad.
 */
export function applySize(
  config: MeasurementConfig,
  size: MeasurementSize,
): MeasurementConfig {
  if (config.prompts.length > size.maxPrompts) {
    throw new InvalidConfigError(
      `el tamaño ${size.id} admite ${size.maxPrompts} prompts y se han enviado ${config.prompts.length}`,
    );
  }
  // Las pasadas las fija el tamaño, no el cliente.
  return { ...config, runsPerPrompt: size.runsPerPrompt };
}

/** Número de consultas que costará una medición: es lo que mueve el coste. */
export function countQueries(config: MeasurementConfig): number {
  return config.prompts.length * config.runsPerPrompt * config.engines.length;
}
