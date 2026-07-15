import { z } from 'zod';

/**
 * Forma tolerante de la respuesta de Perplexity. Solo validamos lo que
 * consumimos; el resto del cuerpo se conserva crudo. Las citas han vivido
 * en `citations` y ahora también en `search_results`, así que ambos son
 * opcionales y se combinan al leer.
 */
export const perplexityResponseSchema = z.object({
  choices: z
    .array(z.object({ message: z.object({ content: z.string().optional() }).optional() }))
    .optional(),
  citations: z.array(z.string()).optional(),
  search_results: z.array(z.object({ url: z.string().optional() })).optional(),
});

export type PerplexityResponse = z.infer<typeof perplexityResponseSchema>;
