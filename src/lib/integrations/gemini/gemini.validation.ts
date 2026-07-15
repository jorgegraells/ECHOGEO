import { z } from 'zod';

/**
 * Forma tolerante de la respuesta de la Gemini API con grounding. Solo
 * validamos lo que consumimos; el resto del cuerpo se conserva crudo. Casi
 * todo es opcional porque el grounding no siempre rellena los mismos campos
 * (una respuesta sin fuentes carece de `groundingMetadata`).
 */
export const geminiResponseSchema = z.object({
  candidates: z
    .array(
      z.object({
        content: z
          .object({
            parts: z.array(z.object({ text: z.string().optional() })).optional(),
          })
          .optional(),
        groundingMetadata: z
          .object({
            groundingChunks: z
              .array(
                z.object({
                  web: z
                    .object({
                      uri: z.string().optional(),
                      title: z.string().optional(),
                    })
                    .optional(),
                }),
              )
              .optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

export type GeminiResponse = z.infer<typeof geminiResponseSchema>;
