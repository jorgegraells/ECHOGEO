import {
  checkCrawlerAccess,
  checkFreshness,
  checkHygiene,
  checkRawHtmlContent,
  type AuditContext,
} from './onpage.checks';
import { fetchPage, fetchRobots, toOrigin } from './onpage.fetcher';
import type { OnPageAudit } from './onpage.types';

// Orquesta la auditoría: descarga la web y su robots.txt, y pasa el HTML
// crudo por los checks. Todo el análisis es determinista: mismo HTML, mismos
// hallazgos.

/** Orden de gravedad para presentar los hallazgos: lo grave primero. */
const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2, ok: 3 } as const;

/**
 * Audita la web de una marca. `domain` puede venir con o sin protocolo.
 * Lanza InvalidDomainError o FetchFailedError si no se puede auditar.
 */
export async function auditDomain(
  domain: string,
  brandName?: string,
): Promise<OnPageAudit> {
  const origin = toOrigin(domain);

  // El robots.txt no bloquea la auditoría: su ausencia o su error de servidor
  // son hallazgos en sí mismos.
  const [page, robots] = await Promise.all([fetchPage(origin), fetchRobots(origin)]);

  const context: AuditContext = {
    origin,
    html: page.text,
    robots,
    ...(brandName ? { brandName } : {}),
  };

  const findings = [
    ...checkCrawlerAccess(context),
    ...checkRawHtmlContent(context),
    ...checkFreshness(context),
    ...checkHygiene(context),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  return { url: page.finalUrl, fetchedAt: new Date().toISOString(), findings };
}
