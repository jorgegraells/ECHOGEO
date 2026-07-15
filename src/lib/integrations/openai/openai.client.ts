import type { EngineAdapter } from '@/types';

import { EngineRequestError, EngineResponseError } from '../integration.errors';
import { openaiResponseSchema, type OpenAIResponse } from './openai.validation';

// Integración con la Responses API de OpenAI. Forzamos la herramienta de
// búsqueda web (`web_search`) para que el modelo devuelva citas
// estructuradas (`url_citation`) en las anotaciones del texto.
// Docs: https://platform.openai.com/docs/api-reference/responses
// La clave se lee de la env var OPENAI_API_KEY; el registro del adaptador en
// el servicio lo hace el llamante, no este módulo.

const API_URL = 'https://api.openai.com/v1/responses';
const TIMEOUT_MS = 60_000;

/**
 * Crea un adaptador de OpenAI a partir de una clave de API.
 *
 * El modelo por defecto es un identificador de la familia GPT-5 con soporte
 * de búsqueda web; es configurable por si conviene fijar otra versión.
 */
export function createOpenAIAdapter(apiKey: string, model = 'gpt-5.4'): EngineAdapter {
  return {
    id: 'openai',
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
              input: prompt,
              tools: [{ type: 'web_search' }],
            }),
          });
        } catch (cause) {
          const detail = cause instanceof Error ? cause.message : String(cause);
          throw new EngineRequestError('openai', null, detail);
        }

        if (!res.ok) {
          const body = await res.text();
          throw new EngineRequestError('openai', res.status, body.slice(0, 500));
        }

        const json: unknown = await res.json();
        const parsed = openaiResponseSchema.safeParse(json);
        if (!parsed.success) {
          throw new EngineResponseError('openai', parsed.error.message);
        }

        const { text, citations } = extractAnswer(parsed.data);

        // Guardamos el cuerpo original íntegro, no el validado, para poder
        // re-puntuar en el futuro con cualquier campo que hoy ignoramos.
        return { text, citations, raw: json };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

/**
 * Recorre las partes `output_text` de la respuesta para juntar el texto y
 * las URLs únicas de las anotaciones `url_citation`. Es tolerante: si falta
 * cualquier nivel devuelve lo que haya sin romper, y cae al `output_text`
 * agregado de la raíz cuando no hay partes con texto.
 */
function extractAnswer(data: OpenAIResponse): {
  text: string;
  citations: string[];
} {
  const texts: string[] = [];
  const urls: string[] = [];

  for (const item of data.output ?? []) {
    for (const part of item.content ?? []) {
      if (part.type === 'output_text' && typeof part.text === 'string') {
        texts.push(part.text);
      }
      for (const annotation of part.annotations ?? []) {
        if (annotation.type === 'url_citation' && typeof annotation.url === 'string') {
          urls.push(annotation.url);
        }
      }
    }
  }

  const text = texts.length > 0 ? texts.join('') : (data.output_text ?? '');
  const citations = [...new Set(urls)];
  return { text, citations };
}
