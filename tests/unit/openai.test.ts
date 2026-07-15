import { afterEach, describe, expect, it, vi } from 'vitest';

import { createOpenAIAdapter } from '@/lib/integrations/openai';

// Fixture realista de la Responses API con web search: un item de mensaje
// con dos partes `output_text`, cada una con anotaciones `url_citation`.
// Incluye una URL repetida para verificar que se deduplican y una anotación
// de otro tipo que debe ignorarse.
const fixture = {
  id: 'resp_123',
  object: 'response',
  model: 'gpt-5.4',
  output: [
    {
      type: 'message',
      role: 'assistant',
      content: [
        {
          type: 'output_text',
          text: 'Cafés Candela destaca entre las tiendas online. ',
          annotations: [
            { type: 'url_citation', url: 'https://cafescandela.es/guia', title: 'Guía' },
            { type: 'file_citation', file_id: 'file_x' },
          ],
        },
        {
          type: 'output_text',
          text: 'También la citan medios especializados.',
          annotations: [
            { type: 'url_citation', url: 'https://elpais.com/cafe', title: 'El País' },
            { type: 'url_citation', url: 'https://cafescandela.es/guia', title: 'Guía' },
          ],
        },
      ],
    },
  ],
  output_text: 'texto agregado que no debería usarse si hay partes',
};

function mockFetchOnceWith(body: unknown, ok = true, status = 200): void {
  const response = new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => response),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createOpenAIAdapter', () => {
  it('extrae el texto concatenado y las citas únicas de varias anotaciones', async () => {
    mockFetchOnceWith(fixture);

    const adapter = createOpenAIAdapter('k');
    const answer = await adapter.query('¿mejor café online?', 0);

    expect(adapter.id).toBe('openai');
    expect(answer.text).toBe(
      'Cafés Candela destaca entre las tiendas online. También la citan medios especializados.',
    );
    // URLs únicas, en orden de aparición; la anotación no-url y la duplicada
    // quedan fuera.
    expect(answer.citations).toEqual([
      'https://cafescandela.es/guia',
      'https://elpais.com/cafe',
    ]);
    // El crudo se conserva íntegro, incluido el campo que ignoramos.
    expect(answer.raw).toMatchObject({ id: 'resp_123' });
  });

  it('cae al output_text agregado cuando no hay partes con texto', async () => {
    mockFetchOnceWith({ output: [], output_text: 'respaldo agregado' });

    const answer = await createOpenAIAdapter('k').query('hola', 0);

    expect(answer.text).toBe('respaldo agregado');
    expect(answer.citations).toEqual([]);
  });

  it('no rompe ante un cuerpo casi vacío', async () => {
    mockFetchOnceWith({});

    const answer = await createOpenAIAdapter('k').query('hola', 0);

    expect(answer.text).toBe('');
    expect(answer.citations).toEqual([]);
  });
});
