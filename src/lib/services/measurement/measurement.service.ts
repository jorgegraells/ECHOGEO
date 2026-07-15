import { createMockAdapter, createPerplexityAdapter } from '@/lib/integrations';
import type {
  EngineAdapter,
  MeasurementConfig,
  MeasurementFile,
  Report,
  RunRecord,
} from '@/types';

import {
  EngineNotConfiguredError,
  MeasurementNotFoundError,
  UnknownEngineError,
} from './measurement.errors';
import {
  listRunIds,
  readMeasurement,
  saveMeasurement,
  saveReport,
} from './measurement.repository';
import { scoreMeasurement } from './measurement.scoring';
import type { MeasurementResult, RunMeasurementOptions } from './measurement.types';

// Lógica de negocio de la medición: orquesta la integración de IA, el
// repositorio y el scoring. No toca el sistema de archivos directamente
// (eso es del repositorio) ni sabe de HTTP (eso es de la integración).

/** Pausa entre pasadas reales, para no ametrallar la API del motor. */
const THROTTLE_MS = 400;

/** Identificadores válidos: nombres de carpeta, sin separadores de ruta. */
const ID_PATTERN = /^[A-Za-z0-9._-]+$/;

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Elige la integración según la config, o el mock si se pide. */
function resolveAdapter(config: MeasurementConfig, useMock: boolean): EngineAdapter {
  if (useMock || config.engine === 'mock') return createMockAdapter(config);
  if (config.engine === 'perplexity') {
    const key = process.env['PERPLEXITY_API_KEY'];
    if (!key) {
      throw new EngineNotConfiguredError(
        'perplexity',
        'falta PERPLEXITY_API_KEY en .env.local',
      );
    }
    return createPerplexityAdapter(key);
  }
  throw new UnknownEngineError(config.engine);
}

/**
 * Lanza una medición completa: N pasadas por prompt contra el motor,
 * guarda el crudo, lo puntúa y guarda el reporte. Devuelve el resultado.
 */
export async function runMeasurement(
  config: MeasurementConfig,
  options: RunMeasurementOptions = {},
): Promise<MeasurementResult> {
  const adapter = resolveAdapter(config, options.useMock ?? false);
  const total = config.prompts.length * config.runsPerPrompt;
  const runs: RunRecord[] = [];
  let done = 0;

  for (let p = 0; p < config.prompts.length; p++) {
    const prompt = config.prompts[p]!;
    for (let r = 0; r < config.runsPerPrompt; r++) {
      const answer = await adapter.query(prompt, r);
      runs.push({
        promptIndex: p,
        prompt,
        runIndex: r,
        timestamp: new Date().toISOString(),
        engine: adapter.id,
        answer,
      });
      done++;
      options.onProgress?.({ promptIndex: p, runIndex: r, total, done });
      if (adapter.id !== 'mock') await delay(THROTTLE_MS);
    }
  }

  const file: MeasurementFile = {
    version: 1,
    createdAt: new Date().toISOString(),
    config,
    runs,
  };
  const id = `${file.createdAt.replace(/[:.]/g, '-')}-${adapter.id}`;

  saveMeasurement(id, file);
  const report = scoreMeasurement(file);
  saveReport(id, report);
  return { id, file, report };
}

/** Todas las mediciones guardadas, ya puntuadas, más recientes primero. */
export function listMeasurements(): MeasurementResult[] {
  return listRunIds()
    .map((id): MeasurementResult | null => {
      const file = readMeasurement(id);
      return file ? { id, file, report: scoreMeasurement(file) } : null;
    })
    .filter((x): x is MeasurementResult => x !== null)
    .sort((a, b) => b.file.createdAt.localeCompare(a.file.createdAt));
}

/** Una medición por id (validado, porque suele venir de la URL); null si no existe. */
export function getMeasurement(id: string): MeasurementResult | null {
  if (!ID_PATTERN.test(id)) return null;
  const file = readMeasurement(id);
  if (!file) return null;
  return { id, file, report: scoreMeasurement(file) };
}

/**
 * Re-puntúa una medición desde su crudo, sin llamar a ninguna API, y
 * reescribe su reporte. Garantía de reproducibilidad del scoring.
 */
export function rescoreMeasurement(id: string): Report {
  const file = readMeasurement(id);
  if (!file) throw new MeasurementNotFoundError(id);
  const report = scoreMeasurement(file);
  saveReport(id, report);
  return report;
}
