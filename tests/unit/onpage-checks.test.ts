import { describe, expect, it } from 'vitest';

import {
  checkCrawlerAccess,
  checkFreshness,
  checkHygiene,
  checkRawHtmlContent,
  type AuditContext,
} from '@/lib/services/onpage/onpage.checks';

function context(overrides: Partial<AuditContext>): AuditContext {
  return {
    origin: 'https://acme.com',
    html: '<html><body>' + 'contenido real '.repeat(60) + '</body></html>',
    robots: null,
    ...overrides,
  };
}

function robots(text: string, status = 200) {
  return { status, text, finalUrl: 'https://acme.com/robots.txt' };
}

function codes(findings: { code: string }[]): string[] {
  return findings.map((f) => f.code);
}

describe('checkCrawlerAccess', () => {
  it('marca como crítico bloquear un bot de citación', () => {
    const ctx = context({ robots: robots('User-agent: PerplexityBot\nDisallow: /') });
    const findings = checkCrawlerAccess(ctx);
    const blocked = findings.find((f) => f.code === 'onpage.citationBotBlocked');
    expect(blocked?.severity).toBe('critical');
    expect(blocked?.values.bot).toBe('PerplexityBot');
  });

  it('informa sin penalizar cuando solo se bloquea el entrenamiento', () => {
    const ctx = context({ robots: robots('User-agent: GPTBot\nDisallow: /') });
    const findings = checkCrawlerAccess(ctx);
    // GPTBot es de entrenamiento: no debe generar un crítico.
    expect(codes(findings)).not.toContain('onpage.citationBotBlocked');
    const info = findings.find((f) => f.code === 'onpage.trainingBotsBlocked');
    expect(info?.severity).toBe('info');
    expect(codes(findings)).toContain('onpage.citationBotsAllowed');
  });

  it('detecta el bloqueo masivo que borra la visibilidad', () => {
    // El típico "bloquea todos los bots de IA" que circula por internet.
    const ctx = context({ robots: robots('User-agent: *\nDisallow: /') });
    const criticals = checkCrawlerAccess(ctx).filter((f) => f.severity === 'critical');
    expect(criticals.length).toBeGreaterThanOrEqual(4);
  });

  it('avisa de Google-Extended como aviso, no como crítico', () => {
    const ctx = context({ robots: robots('User-agent: Google-Extended\nDisallow: /') });
    const findings = checkCrawlerAccess(ctx);
    const grounding = findings.find((f) => f.code === 'onpage.groundingBotBlocked');
    expect(grounding?.severity).toBe('warning');
    // No debe reportarse como pérdida de las AI Overviews.
    expect(codes(findings)).not.toContain('onpage.citationBotBlocked');
  });

  it('trata un robots.txt con error de servidor como bloqueo total', () => {
    const ctx = context({ robots: robots('', 503) });
    const finding = checkCrawlerAccess(ctx)[0];
    expect(finding?.code).toBe('onpage.robotsServerError');
    expect(finding?.severity).toBe('critical');
  });

  it('acepta la ausencia de robots.txt como correcta', () => {
    const ctx = context({ robots: robots('', 404) });
    expect(codes(checkCrawlerAccess(ctx))).toContain('onpage.robotsMissing');
  });
});

describe('checkRawHtmlContent', () => {
  it('marca como crítica una SPA sin contenido en el HTML crudo', () => {
    const ctx = context({
      html: '<html><body><div id="root"></div><script src="/app.js"></script></body></html>',
    });
    const finding = checkRawHtmlContent(ctx)[0];
    expect(finding?.code).toBe('onpage.clientRendered');
    expect(finding?.severity).toBe('critical');
  });

  it('acepta una página con contenido servido en HTML', () => {
    expect(codes(checkRawHtmlContent(context({})))).toContain('onpage.rawHtmlOk');
  });

  it('avisa si la marca no aparece en el HTML crudo', () => {
    const ctx = context({ brandName: 'Acme' });
    expect(codes(checkRawHtmlContent(ctx))).toContain('onpage.brandMissingInHtml');
  });
});

describe('checkFreshness', () => {
  it('avisa cuando no hay ninguna fecha', () => {
    expect(codes(checkFreshness(context({})))).toContain('onpage.noDate');
  });

  it('acepta una fecha reciente en JSON-LD', () => {
    const recent = new Date(Date.now() - 86_400_000).toISOString();
    const html = `<html><head><script type="application/ld+json">{"@type":"Article","dateModified":"${recent}"}</script></head><body>x</body></html>`;
    expect(codes(checkFreshness(context({ html })))).toContain('onpage.dateOk');
  });

  it('marca contenido envejecido', () => {
    const html = '<html><body><time datetime="2020-01-01">antiguo</time></body></html>';
    expect(codes(checkFreshness(context({ html })))).toContain('onpage.staleContent');
  });
});

describe('checkHygiene', () => {
  it('detecta title, description y canonical ausentes', () => {
    const found = codes(checkHygiene(context({})));
    expect(found).toContain('onpage.noTitle');
    expect(found).toContain('onpage.noDescription');
    expect(found).toContain('onpage.noCanonical');
  });

  it('no se queja cuando la higiene está bien', () => {
    const html = [
      '<html><head><title>Acme</title>',
      '<meta name="description" content="Café de especialidad">',
      '<link rel="canonical" href="https://acme.com/">',
      '</head><body>contenido</body></html>',
    ].join('');
    const found = codes(
      checkHygiene(
        context({ html, robots: robots('Sitemap: https://acme.com/sitemap.xml') }),
      ),
    );
    expect(found).not.toContain('onpage.noTitle');
    expect(found).not.toContain('onpage.noDescription');
    expect(found).not.toContain('onpage.noCanonical');
    expect(found).not.toContain('onpage.noSitemap');
  });

  it('avisa de un JSON-LD roto', () => {
    const html =
      '<html><body><script type="application/ld+json">{roto</script></body></html>';
    expect(codes(checkHygiene(context({ html })))).toContain('onpage.invalidJsonLd');
  });
});
