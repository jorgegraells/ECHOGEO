import { FetchFailedError, InvalidDomainError } from './onpage.errors';

// Descarga de la web auditada. Un solo fetch por recurso, con user-agent
// identificable: auditamos la web del propio cliente, no rastreamos la red.

const TIMEOUT_MS = 15_000;
const USER_AGENT = 'EchoGEO-Audit/1.0';

export interface FetchedResource {
  status: number;
  text: string;
  finalUrl: string;
}

/** Normaliza un dominio ("acme.com", "https://acme.com/") a su origen. */
export function toOrigin(domain: string): string {
  const trimmed = domain.trim();
  if (!trimmed) throw new InvalidDomainError(domain);
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).origin;
  } catch {
    throw new InvalidDomainError(domain);
  }
}

async function get(url: string): Promise<FetchedResource> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,text/plain,*/*' },
    });
    return { status: res.status, text: await res.text(), finalUrl: res.url || url };
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new FetchFailedError(url, null, detail);
  } finally {
    clearTimeout(timer);
  }
}

/** Descarga la página. Un status no-OK es un fallo de auditoría en sí mismo. */
export async function fetchPage(origin: string): Promise<FetchedResource> {
  const res = await get(origin);
  if (res.status >= 400) {
    throw new FetchFailedError(origin, res.status, 'la página no responde correctamente');
  }
  return res;
}

/**
 * Descarga robots.txt. No lanza si falta o falla: la ausencia y el error de
 * servidor son hallazgos con significado propio (un 5xx implica, según la
 * RFC 9309, que los bots deben asumir bloqueo total).
 */
export async function fetchRobots(origin: string): Promise<FetchedResource | null> {
  try {
    return await get(`${origin}/robots.txt`);
  } catch {
    return null;
  }
}
