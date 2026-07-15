import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { MeasurementFile, Report } from '@/types';

import { parseMeasurementFile } from './measurement.validation';

// Acceso a datos de las mediciones. Sin reglas de negocio: solo lee y
// escribe en data/runs/. v0 sin base de datos; el sistema de archivos es
// la fuente de verdad. Migrar a Postgres tocará solo este archivo.

const RUNS_DIR = resolve(process.cwd(), 'data', 'runs');

/** Identificadores (nombres de carpeta) de todas las mediciones guardadas. */
export function listRunIds(): string[] {
  try {
    return readdirSync(RUNS_DIR);
  } catch {
    return []; // sin data/runs todavía: no es un error, es que aún no hay nada
  }
}

/** Lee y valida una medición; null si no existe, está corrupta o es formato viejo. */
export function readMeasurement(id: string): MeasurementFile | null {
  try {
    const raw = readFileSync(resolve(RUNS_DIR, id, 'measurement.json'), 'utf8');
    return parseMeasurementFile(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Guarda el fichero crudo de una medición y devuelve su carpeta. */
export function saveMeasurement(id: string, file: MeasurementFile): string {
  const dir = resolve(RUNS_DIR, id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'measurement.json'), JSON.stringify(file, null, 2), 'utf8');
  return dir;
}

/** Guarda el reporte puntuado junto a su medición. */
export function saveReport(id: string, report: Report): void {
  writeFileSync(
    resolve(RUNS_DIR, id, 'report.json'),
    JSON.stringify(report, null, 2),
    'utf8',
  );
}

/** Ruta absoluta de la carpeta de una medición. */
export function runDir(id: string): string {
  return resolve(RUNS_DIR, id);
}
