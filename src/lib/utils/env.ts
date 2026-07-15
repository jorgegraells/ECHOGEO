import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Carga .env.local sin dependencias: formato KEY=VALOR por línea, con `#`
 * para comentarios. No pisa variables que ya existan en el entorno. Sin
 * .env.local no hace nada: el modo mock no necesita claves.
 */
export function loadEnvLocal(cwd = process.cwd()): void {
  let content: string;
  try {
    content = readFileSync(resolve(cwd, '.env.local'), 'utf8');
  } catch {
    return;
  }
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = value;
  }
}
