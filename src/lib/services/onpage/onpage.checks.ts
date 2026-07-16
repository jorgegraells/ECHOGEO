import { AI_BOTS, CITATION_BOTS } from './onpage.bots';
import type { FetchedResource } from './onpage.fetcher';
import {
  countScripts,
  extractText,
  hasCanonical,
  hasJsonLdTag,
  jsonLdBlocks,
  latestDate,
  metaContent,
  tagContent,
} from './onpage.html';
import { isAllowed, parseRobots } from './onpage.robots';
import type { Finding } from './onpage.types';

// Los cuatro checks que sobreviven a la evidencia. Deliberadamente NO se
// comprueba llms.txt (ningún motor ha confirmado usarlo; Google documenta que
// lo ignora, y el 97 % de esos archivos no recibe una sola petición), ni la
// velocidad de página ni señales de E-E-A-T: son folclore SEO reciclado.

/** Contexto que comparten todos los checks. */
export interface AuditContext {
  origin: string;
  html: string;
  robots: FetchedResource | null;
  brandName?: string;
}

/** Por debajo de este texto en el HTML crudo, la página se considera vacía. */
const MIN_RAW_TEXT = 500;

/** Antigüedad a partir de la cual el contenido se marca como envejecido. */
const STALE_DAYS = 730;

/**
 * Check 1 — Acceso de los crawlers (evidencia fuerte: documentación oficial
 * de todos los motores). Distingue bots de citación de bots de entrenamiento:
 * bloquear los primeros te borra de las respuestas, bloquear los segundos no.
 */
export function checkCrawlerAccess(ctx: AuditContext): Finding[] {
  const findings: Finding[] = [];

  if (!ctx.robots || ctx.robots.status === 404) {
    // Sin robots.txt no hay restricciones: es un resultado correcto.
    findings.push({
      code: 'onpage.robotsMissing',
      severity: 'ok',
      evidence: 'strong',
      values: {},
    });
    return findings;
  }

  if (ctx.robots.status >= 500) {
    // RFC 9309: ante un 5xx los bots deben asumir bloqueo total.
    findings.push({
      code: 'onpage.robotsServerError',
      severity: 'critical',
      evidence: 'strong',
      values: { status: ctx.robots.status },
    });
    return findings;
  }

  const groups = parseRobots(ctx.robots.text);

  const blockedCitation = CITATION_BOTS.filter(
    (bot) => !isAllowed(groups, bot.token, '/'),
  );
  for (const bot of blockedCitation) {
    findings.push({
      code: 'onpage.citationBotBlocked',
      severity: 'critical',
      evidence: 'strong',
      values: { bot: bot.token, surface: bot.surface },
    });
  }

  const blockedTraining = AI_BOTS.filter(
    (bot) => bot.tier === 'training' && !isAllowed(groups, bot.token, '/'),
  );
  if (blockedTraining.length > 0) {
    // Bloquear el entrenamiento es una decisión legítima: se informa, no se
    // penaliza. No afecta a que te citen.
    findings.push({
      code: 'onpage.trainingBotsBlocked',
      severity: 'info',
      evidence: 'strong',
      values: { bots: blockedTraining.map((b) => b.token).join(', ') },
    });
  }

  const grounding = AI_BOTS.find((bot) => bot.tier === 'grounding');
  if (grounding && !isAllowed(groups, grounding.token, '/')) {
    findings.push({
      code: 'onpage.groundingBotBlocked',
      severity: 'warning',
      evidence: 'strong',
      values: { bot: grounding.token, surface: grounding.surface },
    });
  }

  if (blockedCitation.length === 0) {
    findings.push({
      code: 'onpage.citationBotsAllowed',
      severity: 'ok',
      evidence: 'strong',
      values: {},
    });
  }

  return findings;
}

/**
 * Check 2 — ¿Se te ve sin JavaScript? (evidencia fuerte: los crawlers de IA
 * no ejecutan JS; medido sobre 500M+ peticiones). Si la web pinta el
 * contenido en el cliente, para ChatGPT, Claude o Perplexity está vacía.
 * Excepciones conocidas: Gemini y AppleBot sí renderizan.
 */
export function checkRawHtmlContent(ctx: AuditContext): Finding[] {
  const findings: Finding[] = [];
  const text = extractText(ctx.html);

  if (text.length < MIN_RAW_TEXT && countScripts(ctx.html) > 0) {
    findings.push({
      code: 'onpage.clientRendered',
      severity: 'critical',
      evidence: 'strong',
      values: { chars: text.length },
    });
    return findings;
  }

  findings.push({
    code: 'onpage.rawHtmlOk',
    severity: 'ok',
    evidence: 'strong',
    values: { chars: text.length },
  });

  // Si la marca no está en el HTML crudo, el motor no puede asociarte la página.
  if (ctx.brandName) {
    const needle = ctx.brandName.toLowerCase();
    if (!text.toLowerCase().includes(needle)) {
      findings.push({
        code: 'onpage.brandMissingInHtml',
        severity: 'warning',
        evidence: 'strong',
        values: { brand: ctx.brandName },
      });
    }
  }

  return findings;
}

/**
 * Check 3 — Frescura (evidencia moderada: las páginas citadas son un 25,7 %
 * más recientes que las orgánicas, pero es correlación, y las AI Overviews
 * incluso prefieren contenido algo más antiguo).
 */
export function checkFreshness(ctx: AuditContext): Finding[] {
  const date = latestDate(ctx.html);

  if (!date) {
    return [
      { code: 'onpage.noDate', severity: 'warning', evidence: 'moderate', values: {} },
    ];
  }

  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days > STALE_DAYS) {
    return [
      {
        code: 'onpage.staleContent',
        severity: 'warning',
        evidence: 'moderate',
        values: { days },
      },
    ];
  }

  return [
    { code: 'onpage.dateOk', severity: 'ok', evidence: 'moderate', values: { days } },
  ];
}

/**
 * Check 4 — Higiene técnica (evidencia moderada). El schema se comprueba por
 * validez, no como palanca de citación: un estudio controlado no encontró
 * mejora, y Google documenta que no hace falta ninguno especial. Sí lo usa
 * Bing/Copilot, y sirve para los rich results.
 */
export function checkHygiene(ctx: AuditContext): Finding[] {
  const findings: Finding[] = [];

  if (!tagContent(ctx.html, 'title')) {
    findings.push({
      code: 'onpage.noTitle',
      severity: 'warning',
      evidence: 'moderate',
      values: {},
    });
  }
  if (!metaContent(ctx.html, 'description')) {
    findings.push({
      code: 'onpage.noDescription',
      severity: 'warning',
      evidence: 'moderate',
      values: {},
    });
  }
  if (!hasCanonical(ctx.html)) {
    findings.push({
      code: 'onpage.noCanonical',
      severity: 'info',
      evidence: 'moderate',
      values: {},
    });
  }

  // Schema: solo se avisa si está roto. Su ausencia no es un fallo de citación.
  if (hasJsonLdTag(ctx.html) && jsonLdBlocks(ctx.html).length === 0) {
    findings.push({
      code: 'onpage.invalidJsonLd',
      severity: 'warning',
      evidence: 'moderate',
      values: {},
    });
  }

  const hasSitemap = ctx.robots ? /^\s*sitemap\s*:/im.test(ctx.robots.text) : false;
  if (!hasSitemap) {
    findings.push({
      code: 'onpage.noSitemap',
      severity: 'info',
      evidence: 'moderate',
      values: {},
    });
  }

  return findings;
}
