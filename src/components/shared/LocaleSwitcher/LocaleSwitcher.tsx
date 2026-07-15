'use client';

import { Fragment, useTransition } from 'react';

// Import directo del submódulo (no de la fachada @/lib/i18n): la fachada
// reexporta getI18n, que usa next/headers y no puede entrar en el bundle
// de cliente. config solo tiene constantes client-safe.
import { locales, type Locale } from '@/lib/i18n/config';

import { styles } from './LocaleSwitcher.styles';

interface LocaleSwitcherProps {
  /** Idioma activo en la petición actual. */
  current: Locale;
  /** Server Action que persiste el idioma elegido en la cookie. */
  action: (locale: string) => Promise<void>;
}

/**
 * Selector ES | EN de la cabecera. Invoca la Server Action dentro de una
 * transición para no bloquear la UI mientras se reescribe la cookie y se
 * revalida el layout.
 */
export function LocaleSwitcher({ current, action }: LocaleSwitcherProps) {
  const [pending, startTransition] = useTransition();

  return (
    <div data-component="locale-switcher" className={styles.root}>
      {locales.map((locale, index) => {
        const isActive = locale === current;
        return (
          <Fragment key={locale}>
            {index > 0 ? <span className={styles.separator}>|</span> : null}
            <button
              type="button"
              aria-pressed={isActive}
              disabled={pending || isActive}
              onClick={() => startTransition(() => action(locale))}
              className={isActive ? styles.option.active : styles.option.inactive}
            >
              {locale.toUpperCase()}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
