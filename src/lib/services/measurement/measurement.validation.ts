import { z } from 'zod';

import type { MeasurementConfig, MeasurementFile } from '@/types';

import { InvalidConfigError } from './measurement.errors';

// Schemas Zod para validar en los bordes: la config que entra por CLI o
// UI, y el fichero de medición que se relee de disco (puede estar en un
// formato antiguo o corrupto).

const brandSpecSchema = z.object({
  name: z.string().min(1),
  aliases: z.array(z.string()).optional(),
  domain: z.string().optional(),
});

export const measurementConfigSchema = z.object({
  brand: brandSpecSchema,
  competitors: z.array(brandSpecSchema).default([]),
  prompts: z.array(z.string().min(1)).min(1),
  runsPerPrompt: z.number().int().min(1),
  engine: z.string().min(1),
});

const engineAnswerSchema = z.object({
  text: z.string(),
  citations: z.array(z.string()),
  raw: z.unknown(),
});

const runRecordSchema = z.object({
  promptIndex: z.number().int(),
  prompt: z.string(),
  runIndex: z.number().int(),
  timestamp: z.string(),
  engine: z.string(),
  answer: engineAnswerSchema,
});

export const measurementFileSchema = z.object({
  version: z.literal(1),
  createdAt: z.string(),
  config: measurementConfigSchema,
  runs: z.array(runRecordSchema),
});

/** Valida una config de entrada; lanza InvalidConfigError si no cuadra. */
export function parseMeasurementConfig(input: unknown): MeasurementConfig {
  const result = measurementConfigSchema.safeParse(input);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`)
      .join('; ');
    throw new InvalidConfigError(detail);
  }
  return result.data;
}

/**
 * Valida un fichero de medición leído de disco. Lanza InvalidConfigError
 * tipado (no un ZodError crudo) para ser coherente con el resto del borde.
 * El cast final salva la única diferencia con el tipo de dominio: Zod
 * infiere `raw` como opcional (unknown incluye undefined), pero
 * semánticamente siempre está presente.
 */
export function parseMeasurementFile(input: unknown): MeasurementFile {
  const result = measurementFileSchema.safeParse(input);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`)
      .join('; ');
    throw new InvalidConfigError(detail);
  }
  return result.data as MeasurementFile;
}
