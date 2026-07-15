// Tipos del dominio de medición. Todo lo que se persiste en disco está
// aquí para que re-puntuar un histórico nunca dependa de código que ya no
// existe.

/** Marca a rastrear, con las variantes con las que puede aparecer escrita. */
export interface BrandSpec {
  name: string;
  /** Variantes con las que puede aparecer escrita la marca */
  aliases?: string[];
  /** Dominio propio, sin protocolo (p. ej. "cafescandela.es") */
  domain?: string;
}

/** Parámetros de una medición: qué marca, contra quién y con qué prompts. */
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

/** Respuesta normalizada de un motor de IA, más su cuerpo crudo íntegro. */
export interface EngineAnswer {
  text: string;
  /** URLs de las fuentes citadas por el motor */
  citations: string[];
  /** Cuerpo completo de la respuesta de la API, sin tocar */
  raw: unknown;
}

/** Contrato común de cualquier integración de motor de IA. */
export interface EngineAdapter {
  id: string;
  query(prompt: string, runIndex: number): Promise<EngineAnswer>;
}

/** Una ejecución concreta de un prompt: la unidad que se guarda en disco. */
export interface RunRecord {
  promptIndex: number;
  prompt: string;
  runIndex: number;
  timestamp: string;
  engine: string;
  answer: EngineAnswer;
}

/** Fichero de medición: config + todas las respuestas crudas de las pasadas. */
export interface MeasurementFile {
  version: 1;
  createdAt: string;
  config: MeasurementConfig;
  runs: RunRecord[];
}
