import {
  createGeminiAdapter,
  createMockAdapter,
  createOpenAIAdapter,
  createPerplexityAdapter,
} from '@/lib/integrations';
import { auditDomain, type OnPageAudit } from '@/lib/services/onpage';
import type {
  EngineAdapter,
  EngineFailure,
  MeasurementConfig,
  MeasurementFile,
  Report,
  RunRecord,
} from '@/types';

import {
  AllEnginesFailedError,
  EngineNotConfiguredError,
  MeasurementNotFoundError,
  UnknownEngineError,
} from './measurement.errors';
import {
  listRunIds,
  readAudit,
  readMeasurement,
  saveAudit,
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

/** Longitud máxima del motivo de un fallo: esto lo lee un cliente. */
const FAILURE_MESSAGE_MAX = 200;

/**
 * Convierte el error de un motor en un motivo legible. Las APIs devuelven el
 * cuerpo del error entero (JSON de varias líneas); aquí se rescata solo el
 * mensaje, porque el volcado crudo no le dice nada a quien lee el informe.
 */
function failureMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const jsonStart = raw.indexOf('{');
  if (jsonStart === -1) return raw.slice(0, FAILURE_MESSAGE_MAX);

  const prefix = raw.slice(0, jsonStart).trim();
  const body = raw.slice(jsonStart);

  try {
    const parsed: unknown = JSON.parse(body);
    const detail =
      parsed && typeof parsed === 'object'
        ? ((parsed as { error?: { message?: unknown }; message?: unknown }).error
            ?.message ?? (parsed as { message?: unknown }).message)
        : undefined;
    if (typeof detail === 'string') {
      return `${prefix} ${detail}`.trim().slice(0, FAILURE_MESSAGE_MAX);
    }
  } catch {
    // El cuerpo del error llega truncado por el adaptador, así que casi nunca
    // parsea: se rescata el mensaje del texto tal cual.
    const match = /"message"\s*:\s*"([^"]+)"/.exec(body);
    if (match?.[1]) return `${prefix} ${match[1]}`.trim().slice(0, FAILURE_MESSAGE_MAX);
  }

  return raw.slice(0, FAILURE_MESSAGE_MAX);
}

/**
 * Audita la web de la marca sin que un fallo tumbe la medición: si la web no
 * responde, la medición sigue siendo válida y simplemente no hay auditoría.
 */
async function tryAudit(config: MeasurementConfig): Promise<OnPageAudit | null> {
  if (!config.brand.domain) return null;
  try {
    return await auditDomain(config.brand.domain, config.brand.name);
  } catch {
    return null;
  }
}

/**
 * Motores reales soportados: su variable de entorno y la fábrica del
 * adaptador. Añadir un motor nuevo es una línea aquí.
 */
const REAL_ENGINES: Record<
  string,
  { envVar: string; create: (apiKey: string) => EngineAdapter }
> = {
  perplexity: {
    envVar: 'PERPLEXITY_API_KEY',
    create: (key) => createPerplexityAdapter(key),
  },
  openai: { envVar: 'OPENAI_API_KEY', create: (key) => createOpenAIAdapter(key) },
  gemini: { envVar: 'GEMINI_API_KEY', create: (key) => createGeminiAdapter(key) },
};

/** Resuelve el adaptador de un motor concreto (o su mock si se pide). */
function resolveAdapter(
  engine: string,
  config: MeasurementConfig,
  useMock: boolean,
): EngineAdapter {
  if (useMock || engine === 'mock') return createMockAdapter(config, engine);

  const def = REAL_ENGINES[engine];
  if (!def) throw new UnknownEngineError(engine);

  const key = process.env[def.envVar];
  if (!key) {
    throw new EngineNotConfiguredError(engine, `falta ${def.envVar} en .env.local`);
  }
  return def.create(key);
}

/**
 * Lanza una medición completa: N pasadas por prompt contra el motor,
 * guarda el crudo, lo puntúa y guarda el reporte. Devuelve el resultado.
 */
export async function runMeasurement(
  config: MeasurementConfig,
  options: RunMeasurementOptions = {},
): Promise<MeasurementResult> {
  const useMock = options.useMock ?? false;
  const total = config.prompts.length * config.runsPerPrompt * config.engines.length;
  const runs: RunRecord[] = [];
  const failures: EngineFailure[] = [];
  let done = 0;

  // Cada motor se mide por separado; el crudo mezcla las pasadas de todos,
  // etiquetadas con su motor. El scoring las separa luego en byEngine.
  //
  // Un motor que falla (sin cuota, caído, sin clave) NO tumba la medición:
  // se anota el motivo y se sigue con el resto. Lo ya consultado está pagado
  // y sigue siendo válido; perderlo entero por un motor sería absurdo.
  for (const engine of config.engines) {
    try {
      const adapter = resolveAdapter(engine, config, useMock);
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
          if (!useMock) await delay(THROTTLE_MS);
        }
      }
    } catch (err) {
      failures.push({ engine, message: failureMessage(err) });
    }
  }

  // Si no respondió ni un motor no hay medición que guardar.
  if (runs.length === 0) {
    throw new AllEnginesFailedError(failures.map((f) => f.engine));
  }

  const file: MeasurementFile = {
    version: 1,
    createdAt: new Date().toISOString(),
    config,
    runs,
    ...(failures.length > 0 ? { failures } : {}),
  };
  const id = `${file.createdAt.replace(/[:.]/g, '-')}-${config.engines.join('-')}`;

  saveMeasurement(id, file);
  const report = scoreMeasurement(file);
  saveReport(id, report);

  // La auditoría de la web acompaña a la medición: es lo que convierte el
  // diagnóstico en acciones concretas sobre el sitio del cliente.
  const audit = await tryAudit(config);
  if (audit) saveAudit(id, audit);

  return { id, file, report, audit };
}

/** Todas las mediciones guardadas, ya puntuadas, más recientes primero. */
export function listMeasurements(): MeasurementResult[] {
  return listRunIds()
    .map((id): MeasurementResult | null => {
      const file = readMeasurement(id);
      return file
        ? { id, file, report: scoreMeasurement(file), audit: readAudit(id) }
        : null;
    })
    .filter((x): x is MeasurementResult => x !== null)
    .sort((a, b) => b.file.createdAt.localeCompare(a.file.createdAt));
}

/** Una medición por id (validado, porque suele venir de la URL); null si no existe. */
export function getMeasurement(id: string): MeasurementResult | null {
  if (!ID_PATTERN.test(id)) return null;
  const file = readMeasurement(id);
  if (!file) return null;
  return { id, file, report: scoreMeasurement(file), audit: readAudit(id) };
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
