import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { scoreMeasurement } from '../../src/scoring';
import type { MeasurementFile, Report } from '../../src/types';

// Acceso del dashboard a las mediciones guardadas en data/runs/.
// v0 sin base de datos: el sistema de archivos es la fuente de verdad,
// igual que para los scripts de terminal.

const RUNS_DIR = resolve(process.cwd(), 'data', 'runs');

export interface RunSummary {
  id: string;
  createdAt: string;
  brand: string;
  engine: string;
  prompts: number;
  totalRuns: number;
  index10: number;
  presence: number;
}

export interface RunDetail {
  id: string;
  file: MeasurementFile;
  report: Report;
}

function readMeasurement(id: string): MeasurementFile | null {
  try {
    const raw = readFileSync(resolve(RUNS_DIR, id, 'measurement.json'), 'utf8');
    return JSON.parse(raw) as MeasurementFile;
  } catch {
    return null; // carpeta sin measurement.json o JSON corrupto: se ignora
  }
}

export function listRuns(): RunSummary[] {
  let entries: string[];
  try {
    entries = readdirSync(RUNS_DIR);
  } catch {
    return []; // sin data/runs todavía: dashboard vacío, no un error
  }
  const summaries: RunSummary[] = [];
  for (const id of entries) {
    const file = readMeasurement(id);
    if (!file) continue;
    const report = scoreMeasurement(file);
    summaries.push({
      id,
      createdAt: file.createdAt,
      brand: file.config.brand.name,
      engine: report.engine,
      prompts: file.config.prompts.length,
      totalRuns: report.totalRuns,
      index10: report.index10,
      presence: report.presence,
    });
  }
  return summaries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRun(id: string): RunDetail | null {
  // El id viene de la URL: nada de separadores de ruta
  if (!/^[A-Za-z0-9._-]+$/.test(id)) return null;
  const file = readMeasurement(id);
  if (!file) return null;
  return { id, file, report: scoreMeasurement(file) };
}
