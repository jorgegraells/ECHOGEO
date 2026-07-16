import { describe, expect, it } from 'vitest';

import { measurementFileSchema, parseMeasurementFile } from '@/lib/services/measurement';
import type { MeasurementFile } from '@/types';

// Un motor caído no puede tumbar una medición ya pagada: se anota el motivo
// y el informe sale con los motores que sí respondieron.

function fileWithFailure(): unknown {
  return {
    version: 1,
    createdAt: 'x',
    config: {
      brand: { name: 'Acme' },
      competitors: [],
      prompts: ['¿mejor opción?'],
      runsPerPrompt: 3,
      engines: ['perplexity', 'openai', 'gemini'],
    },
    runs: [
      {
        promptIndex: 0,
        prompt: '¿mejor opción?',
        runIndex: 0,
        timestamp: 'x',
        engine: 'perplexity',
        answer: { text: 'Acme.', citations: [], raw: null },
      },
    ],
    failures: [{ engine: 'gemini', message: 'El motor gemini falló (429): sin cuota' }],
  };
}

describe('measurementFile con fallos de motor', () => {
  it('acepta y conserva los fallos registrados', () => {
    const file: MeasurementFile = parseMeasurementFile(fileWithFailure());
    expect(file.failures).toHaveLength(1);
    expect(file.failures?.[0]?.engine).toBe('gemini');
  });

  it('sigue leyendo mediciones anteriores, que no tienen el campo', () => {
    const { failures: _omit, ...legacy } = fileWithFailure() as Record<string, unknown>;
    const file = parseMeasurementFile(legacy);
    expect(file.failures).toBeUndefined();
    expect(file.runs).toHaveLength(1);
  });

  it('rechaza un fallo mal formado', () => {
    const broken = { ...(fileWithFailure() as object), failures: [{ engine: 'gemini' }] };
    expect(measurementFileSchema.safeParse(broken).success).toBe(false);
  });
});
