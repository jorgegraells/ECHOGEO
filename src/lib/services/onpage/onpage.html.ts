// Helpers de lectura del HTML crudo. Sin dependencias: solo necesitamos
// unas pocas señales concretas, no un DOM completo. Trabajamos siempre sobre
// el HTML tal cual llega, que es exactamente lo que ven los crawlers de IA
// (no ejecutan JavaScript).

/** Texto visible aproximado: sin scripts, estilos ni etiquetas. */
export function extractText(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Número de etiquetas <script> del documento. */
export function countScripts(html: string): number {
  return (html.match(/<script\b/gi) ?? []).length;
}

/** Contenido de una etiqueta simple, p. ej. `title`. */
export function tagContent(html: string, tag: string): string | null {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i').exec(html);
  return match ? extractText(match[1] ?? '') : null;
}

/** Valor de un <meta name|property="..." content="..."> */
export function metaContent(html: string, name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)\\s*=\\s*["']${escaped}["'][^>]*>`,
    'i',
  );
  const tag = pattern.exec(html)?.[0];
  if (!tag) return null;
  return /content\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? null;
}

/** ¿Hay <link rel="canonical">? */
export function hasCanonical(html: string): boolean {
  return /<link[^>]+rel\s*=\s*["']canonical["'][^>]*>/i.test(html);
}

/** Bloques JSON-LD que parsean correctamente. */
export function jsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const pattern =
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    try {
      blocks.push(JSON.parse(match[1] ?? ''));
    } catch {
      // JSON-LD inválido: se ignora aquí; el check lo reporta aparte
    }
  }
  return blocks;
}

/** ¿Hay algún bloque JSON-LD, válido o no? */
export function hasJsonLdTag(html: string): boolean {
  return /<script\b[^>]*type\s*=\s*["']application\/ld\+json["']/i.test(html);
}

/**
 * Fecha de publicación o actualización más reciente que declare la página,
 * mirando meta de Open Graph, <time datetime> y JSON-LD.
 */
export function latestDate(html: string): Date | null {
  const candidates: string[] = [];

  for (const name of [
    'article:modified_time',
    'article:published_time',
    'og:updated_time',
    'date',
    'last-modified',
  ]) {
    const value = metaContent(html, name);
    if (value) candidates.push(value);
  }

  const timePattern = /<time[^>]+datetime\s*=\s*["']([^"']+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = timePattern.exec(html)) !== null) {
    if (match[1]) candidates.push(match[1]);
  }

  for (const block of jsonLdBlocks(html)) {
    collectJsonLdDates(block, candidates);
  }

  let latest: Date | null = null;
  for (const raw of candidates) {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    if (!latest || date > latest) latest = date;
  }
  return latest;
}

/** Recoge dateModified/datePublished de un árbol JSON-LD arbitrario. */
function collectJsonLdDates(node: unknown, out: string[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectJsonLdDates(item, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    if (
      (key === 'dateModified' || key === 'datePublished') &&
      typeof value === 'string'
    ) {
      out.push(value);
    } else if (typeof value === 'object') {
      collectJsonLdDates(value, out);
    }
  }
}
