import { cookies } from 'next/headers';
import { cache } from 'react';

import { defaultLocale, isLocale, type Locale } from './config';
import { getDictionary } from './messages';
import { createTranslator, type Translator } from './translate';

/**
 * Idioma y traductor de la petición actual. El idioma sale de la cookie
 * `locale` (por defecto castellano). `cache` deduplica la resolución dentro
 * del mismo render, así que cada componente puede llamarlo sin coste.
 */
export const getI18n = cache(async (): Promise<{ locale: Locale; t: Translator }> => {
  const store = await cookies();
  const cookieLocale = store.get('locale')?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  return { locale, t: createTranslator(getDictionary(locale)) };
});
