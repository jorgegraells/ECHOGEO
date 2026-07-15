import type { MessageNode, Messages } from './messages';

export type TranslationValues = Record<string, string | number>;

/** Traductor ligado a un diccionario: `t(clave)` y `t.plural(clave, n)`. */
export interface Translator {
  (key: string, values?: TranslationValues): string;
  plural(key: string, count: number, values?: TranslationValues): string;
}

/** Resuelve una clave con puntos ("a.b.c") dentro del diccionario. */
function resolve(dict: Messages, path: string): MessageNode | undefined {
  let node: MessageNode | undefined = dict;
  for (const key of path.split('.')) {
    if (node && typeof node === 'object' && !('one' in node)) {
      node = (node as Messages)[key];
    } else {
      return undefined;
    }
  }
  return node;
}

/** Sustituye los marcadores {var} por sus valores. */
function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}

function isPlural(node: MessageNode | undefined): node is { one: string; other: string } {
  return typeof node === 'object' && node !== null && 'one' in node && 'other' in node;
}

/** Crea un traductor sobre un diccionario concreto. */
export function createTranslator(dict: Messages): Translator {
  // Si falta la clave o no es texto, se devuelve la propia clave: un fallo
  // de traducción se ve en pantalla en vez de romper el render.
  const t = ((key, values) => {
    const node = resolve(dict, key);
    return typeof node === 'string' ? interpolate(node, values) : key;
  }) as Translator;

  t.plural = (key, count, values) => {
    const node = resolve(dict, key);
    if (!isPlural(node)) return key;
    const template = count === 1 ? node.one : node.other;
    return interpolate(template, { ...values, count });
  };

  return t;
}
