import { z } from 'zod';

import type { MeasurementFile, RunRecord } from '@/types';

// Coste de una medición, calculado desde el crudo. Es derivado y
// recalculable, como el scoring: si cambian los precios, se recalcula el
// histórico sin volver a llamar a ninguna API.

/**
 * Precios de OpenAI en USD por millón de tokens, verificados el 2026-07-16 en
 * https://developers.openai.com/api/docs/pricing
 *
 * OJO: esto envejece. Si los precios cambian, actualiza la tabla y los costes
 * históricos se recalculan solos. Por eso el coste de OpenAI se marca como
 * `estimated`: lo calculamos nosotros, no nos lo da la API.
 */
const OPENAI_PRICES: Record<string, { input: number; output: number }> = {
  'gpt-5.4-mini': { input: 0.75, output: 4.5 },
  'gpt-5.4-nano': { input: 0.2, output: 1.25 },
  'gpt-5.4': { input: 2.5, output: 15.0 },
};

/** $10 por cada 1.000 llamadas a la herramienta de búsqueda web. */
const OPENAI_WEB_SEARCH_PER_CALL = 0.01;

/** De dónde sale la cifra: la dio el motor, la calculamos, o no se sabe. */
export type CostBasis = 'exact' | 'estimated' | 'free' | 'unknown';

export interface EngineCost {
  engine: string;
  runs: number;
  /** Coste en USD; null si no sabemos calcularlo para ese motor. */
  costUsd: number | null;
  basis: CostBasis;
}

export interface MeasurementCost {
  /** Suma de lo que sabemos. Si hay motores desconocidos, es un mínimo. */
  totalUsd: number;
  byEngine: EngineCost[];
  /** Hay algún motor cuyo coste no sabemos calcular. */
  hasUnknown: boolean;
}

/** Perplexity devuelve el coste ya calculado en cada respuesta. */
const perplexityRawSchema = z.object({
  usage: z.object({ cost: z.object({ total_cost: z.number() }) }),
});

/** OpenAI da tokens y número de búsquedas; el precio lo ponemos nosotros. */
const openaiRawSchema = z.object({
  model: z.string().optional(),
  usage: z.object({ input_tokens: z.number(), output_tokens: z.number() }),
  tool_usage: z
    .object({ web_search: z.object({ num_requests: z.number() }).optional() })
    .optional(),
});

/** Precios de la familia del modelo ("gpt-5.4-2026-03-05" → "gpt-5.4"). */
function pricesFor(model: string | undefined): { input: number; output: number } | null {
  if (!model) return null;
  // La clave más larga que sea prefijo gana, para no confundir mini con base.
  const keys = Object.keys(OPENAI_PRICES).sort((a, b) => b.length - a.length);
  const match = keys.find((key) => model.startsWith(key));
  return match ? (OPENAI_PRICES[match] ?? null) : null;
}

/** Coste de una pasada de OpenAI: tokens + las búsquedas que haya hecho. */
function openaiRunCost(raw: unknown): number | null {
  const parsed = openaiRawSchema.safeParse(raw);
  if (!parsed.success) return null;
  const prices = pricesFor(parsed.data.model);
  if (!prices) return null;

  const { input_tokens, output_tokens } = parsed.data.usage;
  const searches = parsed.data.tool_usage?.web_search?.num_requests ?? 0;

  return (
    (input_tokens * prices.input) / 1_000_000 +
    (output_tokens * prices.output) / 1_000_000 +
    searches * OPENAI_WEB_SEARCH_PER_CALL
  );
}

/** Coste de una pasada de Perplexity: nos lo da la propia respuesta. */
function perplexityRunCost(raw: unknown): number | null {
  const parsed = perplexityRawSchema.safeParse(raw);
  return parsed.success ? parsed.data.usage.cost.total_cost : null;
}

/** Coste de un motor concreto sobre sus pasadas. */
function costForEngine(engine: string, runs: RunRecord[]): EngineCost {
  if (engine === 'mock') {
    return { engine, runs: runs.length, costUsd: 0, basis: 'free' };
  }

  if (engine === 'perplexity') {
    const costs = runs.map((run) => perplexityRunCost(run.answer.raw));
    if (costs.some((c) => c === null)) {
      return { engine, runs: runs.length, costUsd: null, basis: 'unknown' };
    }
    const total = costs.reduce((acc: number, c) => acc + (c ?? 0), 0);
    return { engine, runs: runs.length, costUsd: total, basis: 'exact' };
  }

  if (engine === 'openai') {
    const costs = runs.map((run) => openaiRunCost(run.answer.raw));
    if (costs.some((c) => c === null)) {
      return { engine, runs: runs.length, costUsd: null, basis: 'unknown' };
    }
    const total = costs.reduce((acc: number, c) => acc + (c ?? 0), 0);
    return { engine, runs: runs.length, costUsd: total, basis: 'estimated' };
  }

  // Gemini y cualquier motor futuro: aún no sabemos leer su coste.
  return { engine, runs: runs.length, costUsd: null, basis: 'unknown' };
}

/** Calcula el coste de una medición a partir de su crudo. Función pura. */
export function computeCost(file: MeasurementFile): MeasurementCost {
  const engines: string[] = [];
  for (const run of file.runs)
    if (!engines.includes(run.engine)) engines.push(run.engine);

  const byEngine = engines.map((engine) =>
    costForEngine(
      engine,
      file.runs.filter((run) => run.engine === engine),
    ),
  );

  return {
    totalUsd: byEngine.reduce((acc, e) => acc + (e.costUsd ?? 0), 0),
    byEngine,
    hasUnknown: byEngine.some((e) => e.costUsd === null),
  };
}
