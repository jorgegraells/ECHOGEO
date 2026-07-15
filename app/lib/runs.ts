import { getMeasurement, listMeasurements } from '@/lib/services/measurement';
import type { MeasurementFile, Report } from '@/types';

// Capa fina entre el dashboard y el servicio de medición: adapta el
// resultado del servicio a las formas que consume la UI.

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

/** Resumen de todas las mediciones para la lista del dashboard. */
export function listRuns(): RunSummary[] {
  return listMeasurements().map(({ id, file, report }) => ({
    id,
    createdAt: file.createdAt,
    brand: file.config.brand.name,
    engine: report.engine,
    prompts: file.config.prompts.length,
    totalRuns: report.totalRuns,
    index10: report.index10,
    presence: report.presence,
  }));
}

/** Detalle de una medición para la vista de boletín; null si no existe. */
export function getRun(id: string): RunDetail | null {
  const result = getMeasurement(id);
  return result ? { id: result.id, file: result.file, report: result.report } : null;
}
