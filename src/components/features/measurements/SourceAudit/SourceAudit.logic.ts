import type { MeasurementFile } from '@/types';

export interface SourceCount {
  host: string;
  count: number;
}

/** Extrae el hostname de una URL, sin "www."; null si la URL es inválida. */
function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/**
 * Cuenta en cuántas pasadas aparece cada dominio citado, de más a menos.
 * Un dominio cuenta una vez por pasada aunque se cite varias veces en ella.
 */
export function aggregateSources(file: MeasurementFile): SourceCount[] {
  const counts = new Map<string, number>();
  for (const run of file.runs) {
    const hosts = new Set(
      run.answer.citations.map(hostnameOf).filter((h): h is string => h !== null),
    );
    for (const host of hosts) {
      counts.set(host, (counts.get(host) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count);
}

/** Normaliza el dominio propio de la config para comparar con los hosts. */
export function normalizeOwnDomain(domain: string | undefined): string | null {
  return domain ? domain.replace(/^www\./, '') : null;
}

/** El host es el dominio propio o un subdominio suyo. */
export function isOwnDomain(host: string, ownDomain: string | null): boolean {
  if (!ownDomain) return false;
  return host === ownDomain || host.endsWith(`.${ownDomain}`);
}
