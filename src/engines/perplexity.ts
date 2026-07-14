import type { EngineAdapter, EngineAnswer } from '../types.js';

// Adaptador de Perplexity Sonar. Devuelve las citas como metadatos de la
// respuesta sin coste extra de tokens, por eso es el primer motor.
// Docs: https://docs.perplexity.ai

const API_URL = 'https://api.perplexity.ai/chat/completions';
const TIMEOUT_MS = 60_000;

interface PerplexityBody {
  choices?: { message?: { content?: string } }[];
  citations?: string[];
  search_results?: { url?: string }[];
}

export function createPerplexityAdapter(apiKey: string, model = 'sonar'): EngineAdapter {
  return {
    id: 'perplexity',
    async query(prompt: string): Promise<EngineAnswer> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`Perplexity ${res.status}: ${body.slice(0, 500)}`);
        }
        const raw = (await res.json()) as PerplexityBody;
        const text = raw.choices?.[0]?.message?.content ?? '';
        // Las citas han vivido en "citations" y ahora también en
        // "search_results"; capturamos ambas por si cambia el formato.
        const fromCitations = raw.citations ?? [];
        const fromSearch = (raw.search_results ?? [])
          .map((r) => r.url)
          .filter((u): u is string => typeof u === 'string');
        const citations = [...new Set([...fromCitations, ...fromSearch])];
        return { text, citations, raw };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
