import { describe, expect, it } from 'vitest';

import type { Messages } from '@/lib/i18n/messages';
import { createTranslator } from '@/lib/i18n/translate';

// Diccionario de prueba: clave anidada, una entrada plural {one, other} y
// una cadena con marcador {name} para probar la interpolación.
const dict: Messages = {
  a: { b: 'valor anidado' },
  greeting: 'Hola {name}',
  count: { one: '{count} medición', other: '{count} mediciones' },
};

describe('createTranslator', () => {
  const t = createTranslator(dict);

  it('resuelve una clave anidada con puntos', () => {
    expect(t('a.b')).toBe('valor anidado');
  });

  it('interpola los marcadores {var} con los valores dados', () => {
    expect(t('greeting', { name: 'X' })).toBe('Hola X');
  });

  it('devuelve la propia clave si no existe (fallback)', () => {
    expect(t('no.existe')).toBe('no.existe');
  });

  it('usa la forma "one" para count = 1 e interpola {count}', () => {
    expect(t.plural('count', 1)).toBe('1 medición');
  });

  it('usa la forma "other" para count = 5 e interpola {count}', () => {
    expect(t.plural('count', 5)).toBe('5 mediciones');
  });
});
