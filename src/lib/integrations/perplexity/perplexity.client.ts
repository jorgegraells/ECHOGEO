import type { EngineAdapter } from '@/types';

import { EngineRequestError, EngineResponseError } from '../integration.errors';
import { perplexityResponseSchema } from './perplexity.validation';

// Integración con Perplexity Sonar. Devuelve las citas como metadatos de
// la respuesta sin coste extra de tokens, por eso es el primer motor.
// Docs: https://docs.perplexity.ai

const API_URL = 'https://api.perplexity.ai/chat/completions';
const TIMEOUT_MS = 60_000;

/** Crea un adaptador de Perplexity a partir de una clave de API. */
export function createPerplexityAdapter(apiKey: string, model = 'sonar'): EngineAdapter {
  return {
    id: 'perplexity',
    async query(prompt) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        let res: Response;
        try {
          res = await fetch(API_URL, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: prompt }],
            }),
          });
        } catch (cause) {
          const detail = cause instanceof Error ? cause.message : String(cause);
          throw new EngineRequestError('perplexity', null, detail);
        }

        if (!res.ok) {
          const body = await res.text();
          throw new EngineRequestError('perplexity', res.status, body.slice(0, 500));
        }

        const json: unknown = await res.json();
        const parsed = perplexityResponseSchema.safeParse(json);
        if (!parsed.success) {
          throw new EngineResponseError('perplexity', parsed.error.message);
        }

        const data = parsed.data;
        const text = data.choices?.[0]?.message?.content ?? '';
        const fromCitations = data.citations ?? [];
        const fromSearch = (data.search_results ?? [])
          .map((r) => r.url)
          .filter((u): u is string => typeof u === 'string');
        const citations = [...new Set([...fromCitations, ...fromSearch])];

        // Guardamos el cuerpo original íntegro, no el validado, para poder
        // re-puntuar en el futuro con cualquier campo que hoy ignoramos.
        return { text, citations, raw: json };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
