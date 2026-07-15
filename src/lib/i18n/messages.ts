import en from '@/messages/en.json';
import es from '@/messages/es.json';

import type { Locale } from './config';

// Nodo del diccionario: una cadena, un conjunto de formas plurales, o un
// grupo anidado de más nodos.
export type MessageNode = string | { one: string; other: string } | Messages;

export interface Messages {
  [key: string]: MessageNode;
}

// Los JSON cumplen la forma Messages en runtime; el cast salva que TS
// infiere tipos con claves fijas en vez del índice recursivo.
const dictionaries: Record<Locale, Messages> = {
  es: es as Messages,
  en: en as Messages,
};

/** Devuelve el diccionario de mensajes de un idioma. */
export function getDictionary(locale: Locale): Messages {
  return dictionaries[locale];
}
