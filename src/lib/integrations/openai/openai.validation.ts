import { z } from 'zod';

/**
 * Forma tolerante de la respuesta de la Responses API de OpenAI. Solo
 * validamos lo que consumimos y casi todo es opcional: la API evoluciona y
 * el cuerpo crudo se conserva íntegro para re-puntuar en el futuro.
 *
 * El texto y las citas viven anidados en `output[].content[]`: cada parte de
 * tipo `output_text` lleva su `text` y una lista de `annotations`, de las que
 * nos interesan las de tipo `url_citation` (con `url` y `title`). Puede
 * existir además un `output_text` agregado a nivel raíz que usamos como
 * respaldo si no encontramos partes.
 */
const annotationSchema = z.object({
  type: z.string().optional(),
  url: z.string().optional(),
  title: z.string().optional(),
});

const contentPartSchema = z.object({
  type: z.string().optional(),
  text: z.string().optional(),
  annotations: z.array(annotationSchema).optional(),
});

const outputItemSchema = z.object({
  type: z.string().optional(),
  content: z.array(contentPartSchema).optional(),
});

export const openaiResponseSchema = z.object({
  output: z.array(outputItemSchema).optional(),
  // Texto agregado que algunas variantes devuelven en la raíz.
  output_text: z.string().optional(),
});

export type OpenAIResponse = z.infer<typeof openaiResponseSchema>;
