import { describe, expect, it } from 'vitest';

import { buildRecommendations } from '@/lib/services/measurement';
import { scoreMeasurement } from '@/lib/services/measurement/measurement.scoring';
import type { MeasurementConfig, MeasurementFile, RunRecord } from '@/types';

// Construye una medición con pasadas controladas para probar las reglas.
function makeFile(
  config: Partial<MeasurementConfig>,
  runs: Partial<RunRecord>[],
): MeasurementFile {
  const fullConfig: MeasurementConfig = {
    brand: { name: 'Acme', domain: 'acme.com' },
    competitors: [{ name: 'Globex' }],
    prompts: ['¿mejor opción?'],
    runsPerPrompt: 1,
    engines: ['perplexity'],
    ...config,
  };
  const fullRuns: RunRecord[] = runs.map((r, i) => ({
    promptIndex: 0,
    prompt: fullConfig.prompts[0]!,
    runIndex: i,
    timestamp: 'x',
    engine: 'perplexity',
    answer: { text: '', citations: [], raw: null },
    ...r,
  }));
  return { version: 1, createdAt: 'x', config: fullConfig, runs: fullRuns };
}

function codes(file: MeasurementFile): string[] {
  return buildRecommendations(file, scoreMeasurement(file)).map((r) => r.code);
}

describe('buildRecommendations', () => {
  it('avisa cuando te nombran pero no enlazan tu web', () => {
    // La marca aparece pero el dominio propio no está entre las fuentes.
    const file = makeFile({}, [
      {
        answer: { text: 'Acme es la mejor.', citations: ['https://otra.com'], raw: null },
      },
    ]);
    expect(codes(file)).toContain('recommendations.linkedCitationLow');
  });

  it('marca un hueco cuando no apareces en un prompt', () => {
    const file = makeFile({}, [
      { answer: { text: 'Solo Globex merece la pena.', citations: [], raw: null } },
    ]);
    expect(codes(file)).toContain('recommendations.promptGap');
  });

  it('propone una fuente ajena donde no estás', () => {
    const file = makeFile({}, [
      {
        answer: {
          text: 'Acme lidera.',
          citations: ['https://comparador.com'],
          raw: null,
        },
      },
    ]);
    const recs = buildRecommendations(file, scoreMeasurement(file));
    const absent = recs.find((r) => r.code === 'recommendations.absentSource');
    expect(absent?.values.domain).toBe('comparador.com');
  });

  it('detecta divergencia entre motores y aconseja el peor', () => {
    // openai cita el dominio (mejor), perplexity no (peor).
    const base = {
      promptIndex: 0,
      prompt: '¿mejor opción?',
      runIndex: 0,
      timestamp: 'x',
    };
    const file: MeasurementFile = {
      version: 1,
      createdAt: 'x',
      config: {
        brand: { name: 'Acme', domain: 'acme.com' },
        competitors: [],
        prompts: ['¿mejor opción?'],
        runsPerPrompt: 1,
        engines: ['perplexity', 'openai'],
      },
      runs: [
        {
          ...base,
          engine: 'perplexity',
          answer: { text: 'Acme.', citations: [], raw: null },
        },
        {
          ...base,
          engine: 'openai',
          answer: { text: 'Acme.', citations: ['https://acme.com'], raw: null },
        },
      ],
    };
    const divergence = buildRecommendations(file, scoreMeasurement(file)).find(
      (r) => r.code === 'recommendations.engineDivergence',
    );
    expect(divergence?.values.worstEngine).toBe('perplexity');
  });

  it('aconseja añadir el dominio si no está configurado', () => {
    const file = makeFile({ brand: { name: 'Acme' } }, [
      { answer: { text: 'Acme lidera.', citations: [], raw: null } },
    ]);
    expect(codes(file)).toContain('recommendations.noDomain');
  });

  /** Medición en dos motores donde openai cita el dominio y perplexity no. */
  function multiEngineFile(): MeasurementFile {
    const base = {
      promptIndex: 0,
      prompt: '¿mejor opción?',
      runIndex: 0,
      timestamp: 'x',
    };
    return {
      version: 1,
      createdAt: 'x',
      config: {
        brand: { name: 'Acme', domain: 'acme.com' },
        competitors: [],
        prompts: ['¿mejor opción?'],
        runsPerPrompt: 1,
        engines: ['perplexity', 'openai'],
      },
      runs: [
        {
          ...base,
          engine: 'perplexity',
          answer: { text: 'Acme lidera.', citations: ['https://otra.com'], raw: null },
        },
        {
          ...base,
          engine: 'openai',
          answer: { text: 'Acme lidera.', citations: ['https://acme.com'], raw: null },
        },
      ],
    };
  }

  function auditWith(bot: string) {
    return {
      url: 'https://acme.com/',
      fetchedAt: 'x',
      findings: [
        {
          code: 'onpage.citationBotBlocked',
          severity: 'critical' as const,
          evidence: 'strong' as const,
          values: { bot, surface: 'X' },
        },
      ],
    };
  }

  it('usa el bloqueo del bot para explicar la falta de citas medida', () => {
    // perplexity no cita el dominio y su bot está bloqueado: causa raíz.
    const file = multiEngineFile();
    const recs = buildRecommendations(
      file,
      scoreMeasurement(file),
      auditWith('PerplexityBot'),
    );
    const cause = recs.find(
      (r) => r.code === 'recommendations.botBlockExplainsNoCitation',
    );
    expect(cause?.priority).toBe(100);
    expect(cause?.values.engine).toBe('perplexity');
  });

  it('no afirma que no apareces si el motor sí cita tu web pese al bloqueo', () => {
    // openai SÍ cita el dominio: decir "no apareces" contradiría los datos.
    const file = multiEngineFile();
    const recs = buildRecommendations(
      file,
      scoreMeasurement(file),
      auditWith('OAI-SearchBot'),
    );
    expect(recs.map((r) => r.code)).not.toContain(
      'recommendations.botBlockExplainsNoCitation',
    );
    const contradiction = recs.find(
      (r) => r.code === 'recommendations.botBlockedButCited',
    );
    expect(contradiction?.values.engine).toBe('openai');
  });

  it('informa del efecto real cuando el motor del bot no se midió', () => {
    // Claude-SearchBot no tiene motor medido: se reporta el hallazgo tal cual.
    const file = multiEngineFile();
    const recs = buildRecommendations(
      file,
      scoreMeasurement(file),
      auditWith('Claude-SearchBot'),
    );
    expect(recs.map((r) => r.code)).toContain('onpage.citationBotBlocked');
  });

  it('pone los hallazgos on-page graves por encima de todo lo demás', () => {
    // De nada sirve trabajar el contenido si el robots.txt impide leerte.
    const file = makeFile({}, [
      { answer: { text: 'Solo Globex.', citations: ['https://otra.com'], raw: null } },
    ]);
    const recs = buildRecommendations(
      file,
      scoreMeasurement(file),
      auditWith('PerplexityBot'),
    );
    expect(recs[0]?.priority).toBe(100);
    // Encabeza la causa raíz on-page, no un consejo de contenido.
    expect(recs[0]?.code).toMatch(/^(onpage\.|recommendations\.botBlock)/);
  });

  it('funciona sin auditoría on-page', () => {
    const file = makeFile({}, [
      { answer: { text: 'Acme lidera.', citations: [], raw: null } },
    ]);
    expect(() => buildRecommendations(file, scoreMeasurement(file), null)).not.toThrow();
  });

  it('ordena las recomendaciones por prioridad descendente', () => {
    const file = makeFile({}, [
      { answer: { text: 'Solo Globex.', citations: ['https://otra.com'], raw: null } },
    ]);
    const recs = buildRecommendations(file, scoreMeasurement(file));
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1]!.priority).toBeGreaterThanOrEqual(recs[i]!.priority);
    }
  });
});
