import { afterEach, describe, expect, it, vi } from 'vitest';

import { EngineRequestError } from '@/lib/integrations';
import { createPerplexityAdapter } from '@/lib/integrations/perplexity';

// Sirve un cuerpo JSON como respuesta 200 del fetch global. Evita la red:
// el adaptador solo parsea, nunca llama a Perplexity de verdad.
function stubFetchOk(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify(body), { status: 200 })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createPerplexityAdapter query', () => {
  it('devuelve texto y citas desde choices y citations', async () => {
    stubFetchOk({
      choices: [{ message: { content: 'Acme lidera el sector.' } }],
      citations: ['https://acme.com/guia', 'https://otra.com'],
    });

    const adapter = createPerplexityAdapter('fake-key');
    const answer = await adapter.query('¿mejor opción?', 0);

    expect(answer.text).toBe('Acme lidera el sector.');
    expect(answer.citations).toEqual(['https://acme.com/guia', 'https://otra.com']);
  });

  it('extrae las URLs desde search_results cuando no hay citations', async () => {
    stubFetchOk({
      choices: [{ message: { content: 'Respuesta.' } }],
      search_results: [{ url: 'https://acme.com' }, { url: 'https://globex.com' }],
    });

    const adapter = createPerplexityAdapter('fake-key');
    const answer = await adapter.query('prompt', 0);

    expect(answer.citations).toEqual(['https://acme.com', 'https://globex.com']);
  });

  it('combina y deduplica citas de citations y search_results', async () => {
    stubFetchOk({
      choices: [{ message: { content: 'Respuesta.' } }],
      citations: ['https://acme.com', 'https://globex.com'],
      search_results: [{ url: 'https://acme.com' }, { url: 'https://initech.com' }],
    });

    const adapter = createPerplexityAdapter('fake-key');
    const answer = await adapter.query('prompt', 0);

    // 'https://acme.com' aparece en ambas fuentes y no debe duplicarse.
    expect(answer.citations).toEqual([
      'https://acme.com',
      'https://globex.com',
      'https://initech.com',
    ]);
  });

  it('lanza EngineRequestError con un status 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('upstream error', { status: 500 })),
    );

    const adapter = createPerplexityAdapter('fake-key');
    await expect(adapter.query('prompt', 0)).rejects.toBeInstanceOf(EngineRequestError);
  });
});
