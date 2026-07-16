'use server';

import { redirect } from 'next/navigation';

import type { CreateMeasurementState } from '@/components/features/measurements';
import { getI18n } from '@/lib/i18n';
import {
  applySize,
  isMeasurementSize,
  MEASUREMENT_SIZES,
  measurementConfigSchema,
  MeasurementError,
  runMeasurement,
} from '@/lib/services/measurement';

/** Parte un texto en elementos no vacíos, por líneas o por comas. */
function splitList(value: FormDataEntryValue | null, by: 'line' | 'comma'): string[] {
  return String(value ?? '')
    .split(by === 'line' ? /\r?\n/ : ',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Crea y lanza una medición desde el formulario web. Valida la entrada en
 * el borde (Zod) y delega la ejecución en el servicio. Redirige al detalle
 * de la medición creada.
 */
export async function createMeasurement(
  _state: CreateMeasurementState,
  formData: FormData,
): Promise<CreateMeasurementState> {
  const { t } = await getI18n();
  const useMock = formData.get('mock') === 'on';

  // El tamaño contratado manda: fija las pasadas y limita los prompts. Lo
  // aplica el servidor, no el formulario, que solo acompaña al usuario.
  const sizeId = String(formData.get('size') ?? '');
  if (!isMeasurementSize(sizeId)) {
    return { status: 'error', message: t('newMeasurement.errorSize') };
  }
  const size = MEASUREMENT_SIZES[sizeId];

  const parsed = measurementConfigSchema.safeParse({
    brand: {
      name: String(formData.get('name') ?? '').trim(),
      domain: String(formData.get('domain') ?? '').trim() || undefined,
      aliases: splitList(formData.get('aliases'), 'comma'),
    },
    competitors: splitList(formData.get('competitors'), 'line').map((name) => ({ name })),
    prompts: splitList(formData.get('prompts'), 'line'),
    runsPerPrompt: size.runsPerPrompt,
    engines: formData.getAll('engines').map(String),
  });

  if (!parsed.success) {
    return { status: 'error', message: t('newMeasurement.errorRequired') };
  }

  let id: string;
  try {
    // .env.local lo carga Next automáticamente, así que los motores reales
    // encuentran su clave sin llamar a loadEnvLocal.
    const config = applySize(parsed.data, size);
    const result = await runMeasurement(config, { useMock });
    id = result.id;
  } catch (err) {
    const detail = err instanceof MeasurementError ? err.message : String(err);
    return { status: 'error', message: t('newMeasurement.errorEngine', { detail }) };
  }

  redirect(`/runs/${id}`);
}
