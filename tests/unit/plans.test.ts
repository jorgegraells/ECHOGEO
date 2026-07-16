import { describe, expect, it } from 'vitest';

import {
  applySize,
  countQueries,
  InvalidConfigError,
  isMeasurementSize,
  MEASUREMENT_SIZES,
} from '@/lib/services/measurement';
import type { MeasurementConfig } from '@/types';

function config(prompts: number, runsPerPrompt = 3): MeasurementConfig {
  return {
    brand: { name: 'Acme' },
    competitors: [],
    prompts: Array.from({ length: prompts }, (_, i) => `pregunta ${i + 1}`),
    runsPerPrompt,
    engines: ['perplexity', 'openai', 'gemini'],
  };
}

describe('isMeasurementSize', () => {
  it('acepta los tamaños del catálogo y rechaza el resto', () => {
    expect(isMeasurementSize('basic')).toBe(true);
    expect(isMeasurementSize('full')).toBe(true);
    expect(isMeasurementSize('gratis')).toBe(false);
    expect(isMeasurementSize(undefined)).toBe(false);
  });
});

describe('applySize', () => {
  it('deja pasar una medición dentro del límite', () => {
    const result = applySize(config(5), MEASUREMENT_SIZES.basic);
    expect(result.prompts).toHaveLength(5);
  });

  it('rechaza más prompts de los contratados', () => {
    // Es lo que protege el margen: el tamaño lo hace cumplir el servidor.
    expect(() => applySize(config(6), MEASUREMENT_SIZES.basic)).toThrow(
      InvalidConfigError,
    );
  });

  it('impone las pasadas del tamaño aunque el cliente pida otras', () => {
    const result = applySize(config(5, 99), MEASUREMENT_SIZES.basic);
    expect(result.runsPerPrompt).toBe(MEASUREMENT_SIZES.basic.runsPerPrompt);
  });

  it('los tamaños crecen en preguntas y mantienen las pasadas', () => {
    expect(MEASUREMENT_SIZES.basic.maxPrompts).toBeLessThan(
      MEASUREMENT_SIZES.medium.maxPrompts,
    );
    expect(MEASUREMENT_SIZES.medium.maxPrompts).toBeLessThan(
      MEASUREMENT_SIZES.full.maxPrompts,
    );
    expect(MEASUREMENT_SIZES.full.runsPerPrompt).toBe(
      MEASUREMENT_SIZES.basic.runsPerPrompt,
    );
  });
});

describe('countQueries', () => {
  it('cuenta prompts × pasadas × motores, que es lo que se paga', () => {
    // 5 preguntas × 3 pasadas × 3 motores = 45 consultas
    expect(countQueries(config(5))).toBe(45);
    expect(countQueries(config(15))).toBe(135);
  });
});
