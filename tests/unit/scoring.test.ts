import { describe, expect, it } from 'vitest';

import { scoreMeasurement } from '@/lib/services/measurement/measurement.scoring';
import type { MeasurementConfig, MeasurementFile, RunRecord } from '@/types';

// Construye una medición con respuestas controladas para verificar el
// scoring de forma determinista, sin llamar a ningún motor de IA.
function makeFile(
  config: Partial<MeasurementConfig>,
  answers: { text: string; citations: string[] }[],
): MeasurementFile {
  const fullConfig: MeasurementConfig = {
    brand: { name: 'Acme', aliases: ['ACME Corp'], domain: 'acme.com' },
    competitors: [{ name: 'Globex' }, { name: 'Initech' }],
    prompts: ['¿mejor opción?'],
    runsPerPrompt: answers.length,
    engines: ['test'],
    ...config,
  };
  const runs: RunRecord[] = answers.map((a, i) => ({
    promptIndex: 0,
    prompt: fullConfig.prompts[0]!,
    runIndex: i,
    timestamp: '2026-07-15T00:00:00.000Z',
    engine: 'test',
    answer: { text: a.text, citations: a.citations, raw: null },
  }));
  return { version: 1, createdAt: '2026-07-15T00:00:00.000Z', config: fullConfig, runs };
}

describe('scoreMeasurement', () => {
  it('agrega presencia, posición, cita e índice sobre varias pasadas', () => {
    const file = makeFile({}, [
      // Marca en 2.ª posición de 3, con el dominio entre las fuentes
      {
        text: 'Globex es sólida, Acme destaca e Initech cierra.',
        citations: ['https://acme.com/guia'],
      },
      // Sin mención de la marca ni cita del dominio
      {
        text: 'Solo Globex e Initech merecen la pena.',
        citations: ['https://globex.com'],
      },
    ]);
    const report = scoreMeasurement(file);

    expect(report.runScores[0]).toMatchObject({
      mentioned: true,
      position: 2,
      brandsMentioned: 3,
      domainCited: true,
    });
    expect(report.runScores[1]).toMatchObject({
      mentioned: false,
      position: null,
      domainCited: false,
    });

    expect(report.presence).toBe(0.5);
    expect(report.domainCited).toBe(0.5);
    // pasada 1: 1 - (2-1)/(3-1) = 0,5 · pasada 2: 0 · media = 0,25
    expect(report.positionScore).toBe(0.25);
    // 10 × (0,5·0,5 + 0,3·0,5 + 0,2·0,25) = 4,5
    expect(report.index10).toBe(4.5);
  });

  it('detecta la marca por alias', () => {
    const file = makeFile({}, [
      { text: 'La recomendación es ACME Corp por encima del resto.', citations: [] },
    ]);
    expect(scoreMeasurement(file).runScores[0]?.mentioned).toBe(true);
  });

  it('normaliza acentos y mayúsculas al detectar la marca', () => {
    const file = makeFile(
      { brand: { name: 'Cafés Candela', domain: 'cafescandela.es' } },
      [{ text: 'cafes candela es la mejor tienda online.', citations: [] }],
    );
    expect(scoreMeasurement(file).runScores[0]?.mentioned).toBe(true);
  });

  it('reconoce el dominio propio en subdominios de las fuentes', () => {
    const file = makeFile({}, [
      { text: 'Acme lidera el sector.', citations: ['https://blog.acme.com/post'] },
    ]);
    expect(scoreMeasurement(file).runScores[0]?.domainCited).toBe(true);
  });

  it('desglosa el índice por motor y agrega el global', () => {
    // Dos motores, una pasada cada uno: uno menciona la marca, el otro no.
    const config: MeasurementConfig = {
      brand: { name: 'Acme', domain: 'acme.com' },
      competitors: [{ name: 'Globex' }],
      prompts: ['¿mejor opción?'],
      runsPerPrompt: 1,
      engines: ['perplexity', 'openai'],
    };
    const base = {
      promptIndex: 0,
      prompt: '¿mejor opción?',
      runIndex: 0,
      timestamp: 'x',
    };
    const file: MeasurementFile = {
      version: 1,
      createdAt: 'x',
      config,
      runs: [
        {
          ...base,
          engine: 'perplexity',
          answer: {
            text: 'Acme es la mejor.',
            citations: ['https://acme.com'],
            raw: null,
          },
        },
        {
          ...base,
          engine: 'openai',
          answer: { text: 'Recomiendo Globex.', citations: [], raw: null },
        },
      ],
    };
    const report = scoreMeasurement(file);

    expect(report.engines).toEqual(['perplexity', 'openai']);
    expect(report.totalRuns).toBe(2);
    // Global: la marca aparece en 1 de 2 pasadas
    expect(report.presence).toBe(0.5);
    // Desglose: perplexity 100 % presencia, openai 0 %
    expect(report.byEngine).toHaveLength(2);
    const perplexity = report.byEngine.find((e) => e.engine === 'perplexity');
    const openai = report.byEngine.find((e) => e.engine === 'openai');
    expect(perplexity?.presence).toBe(1);
    expect(openai?.presence).toBe(0);
    expect(perplexity?.index10).toBeGreaterThan(openai?.index10 ?? 0);
  });
});
