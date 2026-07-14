import type {
  BrandSpec,
  MeasurementFile,
  PromptScore,
  Report,
  RunScore,
} from './types.js';

// Scoring determinista v0. La promesa del producto: con las mismas
// respuestas crudas, el mismo resultado, siempre. Si esta fórmula cambia,
// se re-puntúa el histórico completo (por eso el crudo se guarda íntegro).
//
// Índice v0 = 10 × (0,5·presencia + 0,3·cita_enlazada + 0,2·posición)
//   presencia:      en cuántas pasadas aparece la marca
//   cita_enlazada:  en cuántas pasadas el dominio propio está en las fuentes
//   posición:       qué lugar ocupa entre las marcas mencionadas (1.º = 1,0)

/** Normaliza para comparar: minúsculas y sin acentos */
function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Índice de la primera aparición de la marca (o alias) en el texto; -1 si no está */
function firstMentionIndex(text: string, brand: BrandSpec): number {
  const haystack = normalize(text);
  const needles = [brand.name, ...(brand.aliases ?? [])].map(normalize);
  let best = -1;
  for (const needle of needles) {
    if (!needle) continue;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(needle)}(?![\\p{L}\\p{N}])`, 'u');
    const m = re.exec(haystack);
    if (m && (best === -1 || m.index < best)) best = m.index;
  }
  return best;
}

function domainInCitations(citations: string[], domain: string | undefined): boolean {
  if (!domain) return false;
  const target = normalize(domain).replace(/^www\./, '');
  return citations.some((url) => {
    try {
      const host = normalize(new URL(url).hostname).replace(/^www\./, '');
      return host === target || host.endsWith(`.${target}`);
    } catch {
      return false;
    }
  });
}

export function scoreMeasurement(file: MeasurementFile): Report {
  const { config, runs } = file;
  const allBrands = [config.brand, ...config.competitors];

  const runScores: RunScore[] = runs.map((run) => {
    // Posición: orden de primera mención entre todas las marcas presentes
    const present = allBrands
      .map((b) => ({ brand: b, index: firstMentionIndex(run.answer.text, b) }))
      .filter((x) => x.index !== -1)
      .sort((a, b) => a.index - b.index);

    const rank = present.findIndex((x) => x.brand === config.brand);
    return {
      promptIndex: run.promptIndex,
      runIndex: run.runIndex,
      mentioned: rank !== -1,
      position: rank === -1 ? null : rank + 1,
      brandsMentioned: present.length,
      domainCited: domainInCitations(run.answer.citations, config.brand.domain),
    };
  });

  const prompts: PromptScore[] = config.prompts.map((prompt, promptIndex) => {
    const scores = runScores.filter((s) => s.promptIndex === promptIndex);
    const mentioned = scores.filter((s) => s.mentioned);
    return {
      promptIndex,
      prompt,
      runs: scores.length,
      presence: scores.length ? mentioned.length / scores.length : 0,
      domainCited: scores.length
        ? scores.filter((s) => s.domainCited).length / scores.length
        : 0,
      avgPosition: mentioned.length
        ? mentioned.reduce((acc, s) => acc + (s.position ?? 0), 0) / mentioned.length
        : null,
    };
  });

  const total = runScores.length;
  const presence = total ? runScores.filter((s) => s.mentioned).length / total : 0;
  const domainCited = total ? runScores.filter((s) => s.domainCited).length / total : 0;

  // Posición 0..1: primero entre N marcas = 1, último = 0; sin mención = 0
  const positionScores = runScores.map((s) => {
    if (s.position === null) return 0;
    if (s.brandsMentioned <= 1) return 1;
    return 1 - (s.position - 1) / (s.brandsMentioned - 1);
  });
  const positionScore = total
    ? positionScores.reduce((a, b) => a + b, 0) / total
    : 0;

  const index10 =
    Math.round(10 * (0.5 * presence + 0.3 * domainCited + 0.2 * positionScore) * 10) / 10;

  return {
    brand: config.brand.name,
    // El motor que respondió de verdad, no el configurado: una medición
    // con --mock debe decir "mock" en el reporte
    engine: runs[0]?.engine ?? config.engine,
    totalRuns: total,
    presence,
    domainCited,
    positionScore,
    index10,
    prompts,
    runScores,
  };
}
