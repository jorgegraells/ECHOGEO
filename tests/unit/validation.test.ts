import { describe, expect, it } from 'vitest';

import {
  InvalidConfigError,
  parseMeasurementConfig,
  parseMeasurementFile,
} from '@/lib/services/measurement';
import type { MeasurementConfig, MeasurementFile } from '@/types';

// Config mínima válida reutilizable: marca con nombre, un prompt, una
// pasada y un motor. Sin `competitors` para comprobar el default a [].
function minimalConfig(): unknown {
  return {
    brand: { name: 'Acme' },
    prompts: ['¿mejor opción?'],
    runsPerPrompt: 1,
    engines: ['mock'],
  };
}

describe('parseMeasurementConfig', () => {
  it('acepta la config mínima y aplica competitors por defecto a []', () => {
    const config: MeasurementConfig = parseMeasurementConfig(minimalConfig());

    expect(config.brand.name).toBe('Acme');
    expect(config.prompts).toEqual(['¿mejor opción?']);
    expect(config.runsPerPrompt).toBe(1);
    expect(config.engines).toEqual(['mock']);
    // El schema rellena competitors ausente con un array vacío.
    expect(config.competitors).toEqual([]);
  });

  it('normaliza el campo antiguo `engine` (string) a `engines`', () => {
    const { engines: _omit, ...rest } = minimalConfig() as Record<string, unknown>;
    const config = parseMeasurementConfig({ ...rest, engine: 'perplexity' });
    expect(config.engines).toEqual(['perplexity']);
  });

  it('lanza InvalidConfigError con la marca vacía', () => {
    const input = { ...(minimalConfig() as object), brand: { name: '' } };
    expect(() => parseMeasurementConfig(input)).toThrow(InvalidConfigError);
  });

  it('lanza InvalidConfigError con prompts vacío', () => {
    const input = { ...(minimalConfig() as object), prompts: [] };
    expect(() => parseMeasurementConfig(input)).toThrow(InvalidConfigError);
  });

  it('lanza con runsPerPrompt = 0', () => {
    const input = { ...(minimalConfig() as object), runsPerPrompt: 0 };
    expect(() => parseMeasurementConfig(input)).toThrow(InvalidConfigError);
  });

  it('lanza con runsPerPrompt no entero', () => {
    const input = { ...(minimalConfig() as object), runsPerPrompt: 2.5 };
    expect(() => parseMeasurementConfig(input)).toThrow(InvalidConfigError);
  });
});

describe('parseMeasurementFile', () => {
  // Fichero de medición válido con una única pasada.
  function validFile(): unknown {
    return {
      version: 1,
      createdAt: '2026-07-15T00:00:00.000Z',
      config: parseMeasurementConfig(minimalConfig()),
      runs: [
        {
          promptIndex: 0,
          prompt: '¿mejor opción?',
          runIndex: 0,
          timestamp: '2026-07-15T00:00:00.000Z',
          engine: 'mock',
          answer: { text: 'Acme lidera.', citations: [], raw: null },
        },
      ],
    };
  }

  it('acepta un fichero de medición bien formado', () => {
    const file: MeasurementFile = parseMeasurementFile(validFile());
    expect(file.version).toBe(1);
    expect(file.runs).toHaveLength(1);
    expect(file.config.brand.name).toBe('Acme');
  });

  it('lanza con una version distinta de 1', () => {
    const input = { ...(validFile() as object), version: 2 };
    expect(() => parseMeasurementFile(input)).toThrow();
  });
});
