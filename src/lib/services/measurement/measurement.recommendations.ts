import type { MeasurementFile, Recommendation, Report } from '@/types';

// Recomendaciones deterministas: cada regla mira los datos de la medición y,
// si se cumple un patrón, emite un consejo concreto con su motivo. Sin LLM,
// sin coste, reproducible. Devuelve códigos i18n + valores para interpolar;
// el texto final lo pone la UI.

/** Umbrales de las reglas. Un prompt/motor por debajo dispara el consejo. */
const PROMPT_GAP = 0.5; // presencia mínima aceptable por prompt
const CITATION_LOW = 0.5; // cita enlazada mínima aceptable por motor
const DIVERGENCE = 1.5; // diferencia de índice entre motores que llama la atención
const POSITION_LOW = 0.5; // posición (0..1) por debajo de la cual conviene subir

interface HostCount {
  host: string;
  count: number;
}

/** Dominio ajeno más citado por el motor (excluye el propio y subdominios). */
function topAbsentSource(file: MeasurementFile): HostCount | null {
  const own = file.config.brand.domain?.replace(/^www\./, '').toLowerCase() ?? null;
  const counts = new Map<string, number>();

  for (const run of file.runs) {
    const hosts = new Set<string>();
    for (const url of run.answer.citations) {
      try {
        const host = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
        if (own && (host === own || host.endsWith(`.${own}`))) continue;
        hosts.add(host);
      } catch {
        // URL inválida: se ignora
      }
    }
    for (const host of hosts) counts.set(host, (counts.get(host) ?? 0) + 1);
  }

  let top: HostCount | null = null;
  for (const [host, count] of counts) {
    if (!top || count > top.count) top = { host, count };
  }
  return top;
}

/** Genera las recomendaciones de una medición, ordenadas por prioridad. */
export function buildRecommendations(
  file: MeasurementFile,
  report: Report,
): Recommendation[] {
  const recs: Recommendation[] = [];
  const hasDomain = !!file.config.brand.domain;

  // Sin dominio no se puede medir la cita enlazada: el consejo es añadirlo.
  if (!hasDomain) {
    recs.push({ code: 'recommendations.noDomain', priority: 30, values: {} });
  }

  // Prompts donde la marca aparece poco o nada: huecos donde trabajar.
  for (const prompt of report.prompts) {
    if (prompt.presence < PROMPT_GAP) {
      recs.push({
        code: 'recommendations.promptGap',
        priority: prompt.presence === 0 ? 95 : 60,
        values: { prompt: prompt.prompt, presence: prompt.presence },
      });
    }
  }

  // Te nombran pero no enlazan tu web: por motor, para localizar dónde.
  if (hasDomain) {
    for (const engine of report.byEngine) {
      if (engine.presence > 0 && engine.domainCited < CITATION_LOW) {
        recs.push({
          code: 'recommendations.linkedCitationLow',
          priority: 85,
          values: { engine: engine.engine, citation: engine.domainCited },
        });
      }
    }
  }

  // Divergencia entre motores: dónde está el trabajo pendiente.
  if (report.byEngine.length > 1) {
    const sorted = [...report.byEngine].sort((a, b) => b.index10 - a.index10);
    const best = sorted[0]!;
    const worst = sorted[sorted.length - 1]!;
    if (best.index10 - worst.index10 >= DIVERGENCE) {
      recs.push({
        code: 'recommendations.engineDivergence',
        priority: 70,
        values: {
          bestEngine: best.engine,
          best: best.index10,
          worstEngine: worst.engine,
          worst: worst.index10,
        },
      });
    }
  }

  // Una fuente concreta donde la marca no está: un objetivo tangible.
  const absent = topAbsentSource(file);
  if (absent) {
    recs.push({
      code: 'recommendations.absentSource',
      priority: 65,
      values: { domain: absent.host, frequency: absent.count / (report.totalRuns || 1) },
    });
  }

  // Apareces pero por detrás de otras marcas: gana posición.
  if (report.presence > 0 && report.positionScore < POSITION_LOW) {
    recs.push({ code: 'recommendations.positionLow', priority: 45, values: {} });
  }

  return recs.sort((a, b) => b.priority - a.priority);
}
