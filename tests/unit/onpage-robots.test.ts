import { describe, expect, it } from 'vitest';

import { isAllowed, parseRobots } from '@/lib/services/onpage';

describe('parseRobots / isAllowed', () => {
  it('permite todo cuando no hay reglas para el bot', () => {
    const groups = parseRobots('User-agent: *\nDisallow:');
    expect(isAllowed(groups, 'GPTBot', '/')).toBe(true);
  });

  it('aplica el grupo * a un bot sin grupo propio', () => {
    const groups = parseRobots('User-agent: *\nDisallow: /');
    expect(isAllowed(groups, 'PerplexityBot', '/')).toBe(false);
  });

  it('un bot con grupo propio ignora por completo el grupo *', () => {
    // Regla clave de la RFC 9309: aunque * bloquee todo, GPTBot tiene su
    // propio grupo y solo obedece a ese.
    const groups = parseRobots(
      ['User-agent: *', 'Disallow: /', '', 'User-agent: GPTBot', 'Allow: /'].join('\n'),
    );
    expect(isAllowed(groups, 'GPTBot', '/')).toBe(true);
    expect(isAllowed(groups, 'PerplexityBot', '/')).toBe(false);
  });

  it('el grupo propio manda aunque sea más permisivo el asterisco', () => {
    const groups = parseRobots(
      ['User-agent: *', 'Allow: /', '', 'User-agent: OAI-SearchBot', 'Disallow: /'].join(
        '\n',
      ),
    );
    expect(isAllowed(groups, 'OAI-SearchBot', '/')).toBe(false);
  });

  it('compara el token sin distinguir mayúsculas', () => {
    const groups = parseRobots('User-agent: gptbot\nDisallow: /');
    expect(isAllowed(groups, 'GPTBot', '/')).toBe(false);
  });

  it('agrupa varios user-agent seguidos bajo las mismas reglas', () => {
    const groups = parseRobots(
      ['User-agent: GPTBot', 'User-agent: CCBot', 'Disallow: /'].join('\n'),
    );
    expect(isAllowed(groups, 'GPTBot', '/')).toBe(false);
    expect(isAllowed(groups, 'CCBot', '/')).toBe(false);
  });

  it('gana la regla más específica, no Allow por defecto', () => {
    const groups = parseRobots(
      ['User-agent: *', 'Allow: /', 'Disallow: /privado'].join('\n'),
    );
    expect(isAllowed(groups, 'GPTBot', '/privado/x')).toBe(false);
    expect(isAllowed(groups, 'GPTBot', '/publico')).toBe(true);
  });

  it('en empate de especificidad gana Allow', () => {
    const groups = parseRobots(
      ['User-agent: *', 'Disallow: /docs', 'Allow: /docs'].join('\n'),
    );
    expect(isAllowed(groups, 'GPTBot', '/docs')).toBe(true);
  });

  it('entiende los comodines * y el anclaje $', () => {
    const groups = parseRobots(
      ['User-agent: *', 'Disallow: /*.pdf$', 'Disallow: /tmp/*/logs'].join('\n'),
    );
    expect(isAllowed(groups, 'GPTBot', '/manual.pdf')).toBe(false);
    expect(isAllowed(groups, 'GPTBot', '/manual.pdf?x=1')).toBe(true);
    expect(isAllowed(groups, 'GPTBot', '/tmp/a/logs')).toBe(false);
  });

  it('ignora comentarios y líneas sueltas', () => {
    const groups = parseRobots(
      ['# comentario', 'User-agent: *  # otro', 'Disallow: / # bloquea'].join('\n'),
    );
    expect(isAllowed(groups, 'GPTBot', '/')).toBe(false);
  });

  it('un Disallow vacío no bloquea nada', () => {
    const groups = parseRobots('User-agent: PerplexityBot\nDisallow:');
    expect(isAllowed(groups, 'PerplexityBot', '/cualquiera')).toBe(true);
  });
});
