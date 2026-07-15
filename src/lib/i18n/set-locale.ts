'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { isLocale } from './config';

/**
 * Cambia el idioma de la sesión escribiendo la cookie `locale`. Ignora valores
 * no soportados para no dejar la cookie en un estado inválido. Revalida el
 * layout para que la UI se repinte en el nuevo idioma sin recarga manual.
 */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;

  const store = await cookies();
  // Un año de vigencia: la preferencia de idioma no debería caducar pronto.
  store.set('locale', locale, { path: '/', maxAge: 60 * 60 * 24 * 365 });

  revalidatePath('/', 'layout');
}
