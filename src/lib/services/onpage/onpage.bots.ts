/**
 * Catálogo de bots de IA. SOLO se incluyen tokens verificados contra la
 * documentación oficial del proveedor (julio 2026). El token es el contrato
 * estable: los proveedores suben la versión del user-agent sin avisar
 * (GPTBot 1.1 → 1.4), así que se compara por token, nunca por UA completo.
 *
 * Deliberadamente FUERA por no tener fuente primaria: Bytespider y
 * TikTokSpider (ByteDance no publica documentación). No inventamos tokens.
 */

/**
 * Qué se pierde al bloquear un bot:
 * - `citation`: desapareces de las respuestas de esa IA. Es lo grave.
 * - `training`: solo entrena modelos. Bloquearlo NO te quita de las respuestas.
 * - `grounding`: caso mixto de Google-Extended (ver nota abajo).
 */
export type BotTier = 'citation' | 'training' | 'grounding';

export interface AiBot {
  /** Token tal y como se escribe en robots.txt (comparación case-insensitive). */
  token: string;
  tier: BotTier;
  /** Superficie afectada, para el mensaje de la recomendación. */
  surface: string;
  /**
   * Id del motor que EchoGEO mide y que depende de este bot, si lo hay. Sirve
   * para cruzar el hallazgo con lo medido: bloquear el bot afecta a la cita
   * enlazada de ese motor, no a que te mencionen.
   */
  engineId?: string;
  /** Documentación oficial que respalda la clasificación. */
  docs: string;
}

export const AI_BOTS: AiBot[] = [
  // --- Citación: bloquearlos = desaparecer de las respuestas ---
  {
    // OpenAI, verbatim: "Sites that are opted out of OAI-SearchBot will not
    // be shown in ChatGPT search answers".
    token: 'OAI-SearchBot',
    tier: 'citation',
    surface: 'ChatGPT',
    engineId: 'openai',
    docs: 'https://developers.openai.com/api/docs/bots',
  },
  {
    // Perplexity, verbatim: "designed to surface and link websites in search
    // results on Perplexity. It is not used to crawl content for AI
    // foundation models". Es la única vía a sus citas.
    token: 'PerplexityBot',
    tier: 'citation',
    surface: 'Perplexity',
    engineId: 'perplexity',
    docs: 'https://docs.perplexity.ai/docs/resources/perplexity-crawlers',
  },
  {
    token: 'Claude-SearchBot',
    tier: 'citation',
    surface: 'Claude',
    docs: 'https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler',
  },
  {
    // Ojo: las AI Overviews y el AI Mode se alimentan del índice de Búsqueda,
    // o sea de Googlebot. NO de Google-Extended.
    token: 'Googlebot',
    tier: 'citation',
    surface: 'Google AI Overviews',
    docs: 'https://developers.google.com/search/docs/appearance/ai-features',
  },
  {
    token: 'meta-webindexer',
    tier: 'citation',
    surface: 'Meta AI',
    docs: 'https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/',
  },

  // --- Entrenamiento: bloquearlos es una decisión legítima que NO afecta
  // a que te citen. Se informa, no se penaliza. ---
  {
    token: 'GPTBot',
    tier: 'training',
    surface: 'OpenAI',
    docs: 'https://developers.openai.com/api/docs/bots',
  },
  {
    token: 'ClaudeBot',
    tier: 'training',
    surface: 'Anthropic',
    docs: 'https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler',
  },
  {
    token: 'meta-externalagent',
    tier: 'training',
    surface: 'Meta',
    docs: 'https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/',
  },
  {
    token: 'Amazonbot',
    tier: 'training',
    surface: 'Amazon',
    docs: 'https://developer.amazon.com/amazonbot',
  },
  {
    token: 'CCBot',
    tier: 'training',
    surface: 'Common Crawl',
    docs: 'https://commoncrawl.org/ccbot',
  },
  {
    // Apple, verbatim: "Webpages that disallow Applebot-Extended can still be
    // included in search results". No rastrea: es solo una declaración.
    token: 'Applebot-Extended',
    tier: 'training',
    surface: 'Apple',
    docs: 'https://support.apple.com/en-us/119829',
  },

  // --- Mixto ---
  {
    // Google, verbatim: controla el uso "for training future generations of
    // Gemini models" Y "for grounding". Pero "does not impact a site's
    // inclusion in Google Search": las AI Overviews siguen funcionando.
    // Medio sector repite que es solo entrenamiento; es falso.
    token: 'Google-Extended',
    tier: 'grounding',
    surface: 'Gemini',
    engineId: 'gemini',
    docs: 'https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers',
  },
];

/** Bots cuyo bloqueo te saca de las respuestas de una IA. */
export const CITATION_BOTS = AI_BOTS.filter((b) => b.tier === 'citation');
