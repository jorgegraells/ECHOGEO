import type { MeasurementFile, Report } from '@/types';

/** Una medición con su fichero crudo y su reporte puntuado. */
export interface MeasurementResult {
  id: string;
  file: MeasurementFile;
  report: Report;
}

/** Progreso de una medición en curso, pasada a pasada. */
export interface MeasurementProgress {
  promptIndex: number;
  runIndex: number;
  total: number;
  done: number;
}

/** Opciones de ejecución de una medición. */
export interface RunMeasurementOptions {
  /** Fuerza el motor simulado (sin coste de API) en lugar del configurado. */
  useMock?: boolean;
  /** Se invoca tras cada pasada completada. */
  onProgress?: (progress: MeasurementProgress) => void;
}
