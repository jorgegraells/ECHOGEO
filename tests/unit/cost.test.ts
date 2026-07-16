import { describe, expect, it } from 'vitest';

import { computeCost } from '@/lib/services/measurement';
import type { MeasurementConfig, MeasurementFile, RunRecord } from '@/types';

// Los crudos de estos tests son recortes de mediciones reales (2026-07-16),
// así que las cifras esperadas son las que de verdad nos cobraron.

const config: MeasurementConfig = {
  brand: { name: 'Acme' },
  competitors: [],
  prompts: ['¿mejor opción?'],
  runsPerPrompt: 1,
  engines: ['perplexity', 'openai'],
};

function run(engine: string, raw: unknown): RunRecord {
  return {
    promptIndex: 0,
    prompt: '¿mejor opción?',
    runIndex: 0,
    timestamp: 'x',
    engine,
    answer: { text: '', citations: [], raw },
  };
}

function file(runs: RunRecord[]): MeasurementFile {
  return { version: 1, createdAt: 'x', config, runs };
}

/** Crudo real de Perplexity: la API nos da el coste ya calculado. */
const perplexityRaw = {
  usage: {
    prompt_tokens: 13,
    completion_tokens: 670,
    cost: { total_cost: 0.00568, request_cost: 0.005 },
  },
};

/** Crudo real de OpenAI: tokens y número de búsquedas. */
const openaiRaw = {
  model: 'gpt-5.4-2026-03-05',
  usage: { input_tokens: 16836, output_tokens: 1139 },
  tool_usage: { web_search: { num_requests: 3 } },
};

describe('computeCost', () => {
  it('toma el coste exacto que devuelve Perplexity', () => {
    const cost = computeCost(file([run('perplexity', perplexityRaw)]));
    const engine = cost.byEngine[0];
    expect(engine?.basis).toBe('exact');
    expect(engine?.costUsd).toBeCloseTo(0.00568, 5);
  });

  it('calcula el de OpenAI con tokens y búsquedas', () => {
    // 16836 × 2,50/M + 1139 × 15/M + 3 búsquedas × 0,01 = 0,0892
    const cost = computeCost(file([run('openai', openaiRaw)]));
    const engine = cost.byEngine[0];
    expect(engine?.basis).toBe('estimated');
    expect(engine?.costUsd).toBeCloseTo(0.08917, 4);
  });

  it('distingue la familia del modelo para no cobrar de más', () => {
    const mini = { ...openaiRaw, model: 'gpt-5.4-mini-2026-03-05' };
    const cost = computeCost(file([run('openai', mini)]));
    // mini es bastante más barato que el modelo base
    expect(cost.byEngine[0]?.costUsd).toBeLessThan(0.05);
  });

  it('suma varios motores y agrupa por motor', () => {
    const cost = computeCost(
      file([run('perplexity', perplexityRaw), run('openai', openaiRaw)]),
    );
    expect(cost.byEngine).toHaveLength(2);
    expect(cost.totalUsd).toBeCloseTo(0.00568 + 0.08917, 4);
    expect(cost.hasUnknown).toBe(false);
  });

  it('el motor simulado no cuesta nada', () => {
    const cost = computeCost(file([run('mock', { mock: true })]));
    expect(cost.byEngine[0]?.basis).toBe('free');
    expect(cost.totalUsd).toBe(0);
  });

  it('marca como desconocido el motor cuyo coste no sabemos leer', () => {
    const cost = computeCost(file([run('gemini', { candidates: [] })]));
    expect(cost.byEngine[0]?.basis).toBe('unknown');
    expect(cost.hasUnknown).toBe(true);
  });

  it('no inventa un coste si el crudo no trae los datos', () => {
    const cost = computeCost(file([run('openai', { model: 'gpt-5.4' })]));
    expect(cost.byEngine[0]?.costUsd).toBeNull();
    expect(cost.hasUnknown).toBe(true);
  });
});
