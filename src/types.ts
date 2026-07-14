// Tipos del motor de medición. Todo lo que se guarda en disco está aquí
// para que re-puntuar un histórico nunca dependa de código que ya no existe.

export interface BrandSpec {
  name: string;
  /** Variantes con las que puede aparecer escrita la marca */
  aliases?: string[];
  /** Dominio propio, sin protocolo (p. ej. "cafescandela.es") */
  domain?: string;
}

export interface MeasurementConfig {
  /** Marca objetivo de la medición */
  brand: BrandSpec;
  /** Marcas competidoras, para calcular la posición relativa */
  competitors: BrandSpec[];
  /** Preguntas tal y como las haría un cliente */
  prompts: string[];
  /** Pasadas por prompt: la respuesta de una IA cambia entre ejecuciones */
  runsPerPrompt: number;
  /** Identificador del motor de IA ("perplexity" | "mock") */
  engine: string;
}

/** Respuesta normalizada de un motor de IA, más su cuerpo crudo íntegro */
export interface EngineAnswer {
  text: string;
  /** URLs de las fuentes citadas por el motor */
  citations: string[];
  /** Cuerpo completo de la respuesta de la API, sin tocar */
  raw: unknown;
}

export interface EngineAdapter {
  id: string;
  query(prompt: string, runIndex: number): Promise<EngineAnswer>;
}

/** Una ejecución concreta de un prompt: la unidad que se guarda en disco */
export interface RunRecord {
  promptIndex: number;
  prompt: string;
  runIndex: number;
  timestamp: string;
  engine: string;
  answer: EngineAnswer;
}

export interface MeasurementFile {
  version: 1;
  createdAt: string;
  config: MeasurementConfig;
  runs: RunRecord[];
}

// ---- Resultados del scoring (derivados, siempre recalculables) ----

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

export interface PromptScore {
  promptIndex: number;
  prompt: string;
  runs: number;
  presence: number;      // 0..1 frecuencia de aparición
  domainCited: number;   // 0..1 frecuencia de cita enlazada
  avgPosition: number | null;
}

export interface Report {
  brand: string;
  engine: string;
  totalRuns: number;
  presence: number;
  domainCited: number;
  positionScore: number; // 0..1, mejor cuanto más arriba
  index10: number;       // índice compuesto 0..10
  prompts: PromptScore[];
  runScores: RunScore[];
}
