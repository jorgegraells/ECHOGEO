import { afterEach, describe, expect, it, vi } from 'vitest';

import { createGeminiAdapter } from '@/lib/integrations/gemini';

// Cuerpo realista de la Gemini API con grounding: dos parts de texto y
// dos groundingChunks (uno repetido para verificar la deduplicación).
const fixture = {
  candidates: [
    {
      content: {
        parts: [{ text: 'Café Candela ' }, { text: 'es una buena opción.' }],
      },
      groundingMetadata: {
        groundingChunks: [
          { web: { uri: 'https://cafescandela.es/', title: 'Cafés Candela' } },
          { web: { uri: 'https://otra.com/review', title: 'Reseña' } },
          { web: { uri: 'https://cafescandela.es/', title: 'Cafés Candela (dup)' } },
        ],
      },
    },
  ],
};

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createGeminiAdapter', () => {
  it('extrae texto concatenado y citas únicas del grounding', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(fixture)));

    const adapter = createGeminiAdapter('k');
    const answer = await adapter.query('¿mejor café?', 0);

    expect(adapter.id).toBe('gemini');
    expect(answer.text).toBe('Café Candela es una buena opción.');
    expect(answer.citations).toEqual([
      'https://cafescandela.es/',
      'https://otra.com/review',
    ]);
    expect(answer.raw).toEqual(fixture);
  });

  it('no rompe si faltan grounding y parts', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ candidates: [{}] })));

    const answer = await createGeminiAdapter('k').query('hola', 0);

    expect(answer.text).toBe('');
    expect(answer.citations).toEqual([]);
  });
});
