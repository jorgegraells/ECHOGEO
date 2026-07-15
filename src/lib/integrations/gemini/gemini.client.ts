import type { EngineAdapter } from '@/types';

import { EngineRequestError, EngineResponseError } from '../integration.errors';
import { geminiResponseSchema } from './gemini.validation';

// Integración con la Gemini API usando grounding con Google Search. Con la
// herramienta `google_search` activada, la respuesta trae las fuentes en
// `groundingMetadata.groundingChunks[]`, cada una con `web.uri`.
// Clave en la env var GEMINI_API_KEY.
// Docs: https://ai.google.dev/gemini-api/docs/grounding

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 60_000;

/**
 * Crea un adaptador de Gemini a partir de una clave de API. El modelo es
 * configurable; por defecto uno con grounding disponible.
 */
export function createGeminiAdapter(
  apiKey: string,
  model = 'gemini-3.5-flash',
): EngineAdapter {
  const url = `${API_BASE}/${model}:generateContent`;

  return {
    id: 'gemini',
    async query(prompt) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      try {
        let res: Response;
        try {
          res = await fetch(url, {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'x-goog-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              // Activa el grounding con Google Search para obtener citas.
              tools: [{ google_search: {} }],
            }),
          });
        } catch (cause) {
          const detail = cause instanceof Error ? cause.message : String(cause);
          throw new EngineRequestError('gemini', null, detail);
        }

        if (!res.ok) {
          const body = await res.text();
          throw new EngineRequestError('gemini', res.status, body.slice(0, 500));
        }

        const json: unknown = await res.json();
        const parsed = geminiResponseSchema.safeParse(json);
        if (!parsed.success) {
          throw new EngineResponseError('gemini', parsed.error.message);
        }

        const candidate = parsed.data.candidates?.[0];
        const text = (candidate?.content?.parts ?? []).map((p) => p.text ?? '').join('');
        const uris = (candidate?.groundingMetadata?.groundingChunks ?? [])
          .map((c) => c.web?.uri)
          .filter((u): u is string => typeof u === 'string');
        const citations = [...new Set(uris)];

        // Guardamos el cuerpo original íntegro, no el validado, para poder
        // re-puntuar en el futuro con cualquier campo que hoy ignoramos.
        return { text, citations, raw: json };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
