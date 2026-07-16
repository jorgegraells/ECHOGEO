// Resultados del scoring. Son derivados: siempre recalculables desde el
// fichero de medición crudo, nunca la fuente de verdad.

/** Puntuación de una pasada concreta. */
export interface RunScore {
  promptIndex: number;
  runIndex: number;
  mentioned: boolean;
  /** Posición 1-based entre las marcas mencionadas; null si no aparece */
  position: number | null;
  brandsMentioned: number;
  /** El dominio propio está entre las fuentes citadas */
  domainCited: boolean;
}

/** Puntuación agregada de un prompt sobre todas sus pasadas. */
export interface PromptScore {
  promptIndex: number;
  prompt: string;
  runs: number;
  /** 0..1, frecuencia de aparición */
  presence: number;
  /** 0..1, frecuencia de cita enlazada */
  domainCited: number;
  avgPosition: number | null;
}

/** Puntuación agregada de un solo motor dentro de una medición. */
export interface EngineReport {
  engine: string;
  totalRuns: number;
  presence: number;
  domainCited: number;
  positionScore: number;
  index10: number;
}

/**
 * Reporte completo de una medición. Las métricas de primer nivel son
 * globales (agregadas sobre todos los motores medidos); `byEngine` lleva
 * el desglose por motor, que es lo accionable.
 */
export interface Report {
  brand: string;
  /** Motores medidos, en el orden en que aparecen en las pasadas */
  engines: string[];
  totalRuns: number;
  presence: number;
  domainCited: number;
  /** 0..1, mejor cuanto más arriba aparece la marca */
  positionScore: number;
  /** Índice compuesto global 0..10 */
  index10: number;
  prompts: PromptScore[];
  runScores: RunScore[];
  /** Desglose del Índice de Eco por motor */
  byEngine: EngineReport[];
}
