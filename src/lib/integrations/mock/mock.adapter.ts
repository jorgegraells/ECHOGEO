import type { EngineAdapter, MeasurementConfig } from '@/types';

// Motor simulado: valida la tubería completa (consulta → crudo → scoring →
// reporte) sin gastar créditos de API. Determinista: mismas entradas,
// misma salida, para que los tests y las verificaciones sean estables.

/** Hash FNV-1a de 32 bits: siembra pseudoaleatoria estable por prompt. */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Crea un adaptador simulado a partir de la config, para pruebas sin coste. */
export function createMockAdapter(config: MeasurementConfig): EngineAdapter {
  return {
    id: 'mock',
    async query(prompt, runIndex) {
      const seed = hash(`${prompt}::${runIndex}`);
      const brand = config.brand.name;
      const competitors = config.competitors.map((c) => c.name);

      // La marca aparece en ~60% de las pasadas, para simular la
      // variabilidad real entre ejecuciones del mismo prompt.
      const mentionsBrand = seed % 10 < 6;
      const citesDomain = mentionsBrand && seed % 10 < 4 && !!config.brand.domain;

      const names = [...competitors];
      if (mentionsBrand) names.splice(seed % (competitors.length + 1), 0, brand);

      const list = names
        .map((n, i) => `${i + 1}. **${n}**: opción destacada según varias fuentes.`)
        .join('\n');
      const text = `Estas son las opciones más recomendadas:\n\n${list}\n\nLa elección depende de tus prioridades.`;

      const citations = [
        'https://ejemplo-comparador.com/ranking',
        'https://es.wikipedia.org/wiki/Ejemplo',
        ...(citesDomain ? [`https://${config.brand.domain}/guia`] : []),
      ];

      return { text, citations, raw: { mock: true, seed } };
    },
  };
}
