// Parser y evaluador de robots.txt según RFC 9309.
// https://www.rfc-editor.org/rfc/rfc9309.html
//
// Las dos reglas que casi todas las herramientas se saltan y que aquí sí se
// respetan:
//  1. Un bot con su PROPIO grupo ignora por completo el grupo `*`.
//  2. Gana la regla cuyo patrón es más específico (más largo en octetos), no
//     "Allow siempre gana". En empate, gana Allow.

/** Un grupo de robots.txt: los agentes a los que aplica y sus reglas. */
export interface RobotsGroup {
  agents: string[];
  rules: RobotsRule[];
}

export interface RobotsRule {
  allow: boolean;
  /** Patrón del path, admite `*` (cualquier cosa) y `$` (fin de cadena). */
  pattern: string;
}

/** Parsea el texto de un robots.txt en grupos. */
export function parseRobots(text: string): RobotsGroup[] {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;
  // Tras una regla, un nuevo User-agent abre grupo; varios User-agent
  // seguidos comparten el mismo grupo.
  let lastLineWasRule = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split('#')[0]!.trim();
    if (!line) continue;

    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();

    if (field === 'user-agent') {
      if (!current || lastLineWasRule) {
        current = { agents: [], rules: [] };
        groups.push(current);
        lastLineWasRule = false;
      }
      if (value) current.agents.push(value.toLowerCase());
      continue;
    }

    if (field === 'allow' || field === 'disallow') {
      if (!current) continue; // regla huérfana sin User-agent: se ignora
      // "Disallow:" vacío significa "no bloquea nada": no aporta regla.
      if (field === 'disallow' && value === '') {
        lastLineWasRule = true;
        continue;
      }
      if (value) current.rules.push({ allow: field === 'allow', pattern: value });
      lastLineWasRule = true;
    }
  }

  return groups;
}

/** Convierte un patrón de robots.txt en una expresión regular anclada al inicio. */
function patternToRegExp(pattern: string): RegExp {
  const endAnchored = pattern.endsWith('$');
  const body = endAnchored ? pattern.slice(0, -1) : pattern;
  const escaped = body
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${escaped}${endAnchored ? '$' : ''}`);
}

/** Longitud del patrón sin los comodines, para medir especificidad. */
function specificity(pattern: string): number {
  return pattern.replace(/\$$/, '').length;
}

/**
 * Grupos que aplican a un token. Si el bot tiene grupo propio, el grupo `*`
 * queda excluido (RFC 9309). Los grupos del mismo agente se fusionan.
 */
function groupsFor(groups: RobotsGroup[], token: string): RobotsGroup[] {
  const needle = token.toLowerCase();
  const own = groups.filter((g) => g.agents.includes(needle));
  if (own.length > 0) return own;
  return groups.filter((g) => g.agents.includes('*'));
}

/**
 * ¿Puede este bot rastrear esta ruta? Sin reglas aplicables, se permite
 * (es el comportamiento por defecto del protocolo).
 */
export function isAllowed(groups: RobotsGroup[], token: string, path: string): boolean {
  const rules = groupsFor(groups, token).flatMap((g) => g.rules);
  if (rules.length === 0) return true;

  let best: RobotsRule | null = null;
  for (const rule of rules) {
    if (!patternToRegExp(rule.pattern).test(path)) continue;
    if (!best) {
      best = rule;
      continue;
    }
    const diff = specificity(rule.pattern) - specificity(best.pattern);
    // Más específico gana; en empate, Allow gana sobre Disallow.
    if (diff > 0 || (diff === 0 && rule.allow && !best.allow)) best = rule;
  }
  return best ? best.allow : true;
}
