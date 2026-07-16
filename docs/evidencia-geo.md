# Evidencia detrás de los checks on-page

## Caso de referencia: The New York Times (medición real, 2026-07-16)

El NYT bloquea en su `robots.txt` a `OAI-SearchBot`, `PerplexityBot`,
`Claude-SearchBot` y `Google-Extended`. Medición real contra Perplexity y
OpenAI, 2 prompts sobre periódicos de referencia:

| Métrica | Resultado |
|---|---|
| Presencia | **100 %** en ambos motores, siempre en 1.ª posición |
| Cita enlazada | **0 %** en ambos |
| Fuentes citadas por Perplexity | 15 y 12 por respuesta, **ninguna de nytimes.com** |
| Fuentes citadas por OpenAI | **0**: respondió de memoria, sin buscar |

**La lección, y es la clave de todo el producto**: bloquear un bot de citación
**no te borra de las respuestas**, te borra de las **fuentes**. El modelo
menciona al NYT porque lo conoce de su entrenamiento y de las miles de páginas
que hablan de él; lo que no puede es enlazar su web. Por eso presencia y cita
enlazada se miden por separado, y por eso una recomendación jamás debe decir
"no apareces" basándose solo en el robots.txt: hay que cruzarlo con lo medido.

Investigación de julio de 2026. Este documento justifica **qué medimos y qué
no**, con fuentes. Si alguien pregunta por qué EchoGEO no puntúa `llms.txt` o
el schema, la respuesta está aquí.

Regla de la casa: preferimos 4 checks con evidencia a 20 a ojo.

## Lo que SÍ medimos

### 1. Acceso de los crawlers (evidencia fuerte)

Documentación oficial de todos los motores. **La distinción que casi todo el
sector confunde**: hay bots de citación y bots de entrenamiento.

| Bot | Qué pasa si lo bloqueas |
|---|---|
| `OAI-SearchBot` | Desapareces de ChatGPT. OpenAI, literal: *"Sites that are opted out of OAI-SearchBot will not be shown in ChatGPT search answers"* |
| `PerplexityBot` | Desapareces de Perplexity. Es su única vía de citación; *"is not used to crawl content for AI foundation models"* |
| `Claude-SearchBot` | Desapareces de Claude |
| `Googlebot` | Desapareces de las AI Overviews (se alimentan del índice de Búsqueda) |
| `meta-webindexer` | Desapareces de Meta AI |
| `GPTBot`, `ClaudeBot`, `Amazonbot`, `CCBot`, `Applebot-Extended` | **Nada**: son solo entrenamiento. Apple lo dice literal: *"Webpages that disallow Applebot-Extended can still be included in search results"* |
| `Google-Extended` | Pierdes el grounding de Gemini, **pero no** las AI Overviews. Google: *"does not impact a site's inclusion in Google Search"* |

**Consecuencia**: el template de "bloquea todos los bots de IA" que circula por
internet **te borra de las respuestas** mientras apenas frena el entrenamiento.
Detectarlo es de lo más valioso que puede decir EchoGEO.

Detalles que respetamos del [RFC 9309](https://www.rfc-editor.org/rfc/rfc9309.html):
- Un bot con **grupo propio ignora por completo el grupo `*`**. Es el error #1
  de las herramientas de auditoría.
- Gana la regla **más específica** (en octetos), no "Allow siempre gana".
- Un robots.txt que devuelve **5xx obliga a asumir bloqueo total**.
- Se compara por **token**, nunca por user-agent completo: los proveedores
  suben la versión sin avisar (GPTBot 1.1 → 1.4).

Bots deliberadamente **excluidos** del catálogo: `Bytespider` y `TikTokSpider`.
ByteDance no publica documentación; no inventamos tokens.

Fuentes: [OpenAI](https://developers.openai.com/api/docs/bots) ·
[Anthropic](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) ·
[Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers) ·
[Google](https://developers.google.com/search/docs/appearance/ai-features) ·
[Apple](https://support.apple.com/en-us/119829) ·
[Meta](https://developers.facebook.com/docs/sharing/webmasters/web-crawlers/)

### 2. Contenido visible sin JavaScript (evidencia fuerte)

**Los crawlers de IA no ejecutan JavaScript.** Vercel lo midió sobre 500M+
peticiones de GPTBot: cero ejecución. Confirmado de nuevo en 2026 para GPTBot,
OAI-SearchBot, ClaudeBot, Claude-SearchBot y PerplexityBot.

Una SPA renderizada en cliente es **invisible** para ChatGPT, Claude y
Perplexity. Excepciones: **Gemini** (usa el renderizador de Googlebot) y
**AppleBot** sí renderizan.

Fuente: [Vercel — The rise of the AI crawler](https://vercel.com/blog/the-rise-of-the-ai-crawler)

### 3. Frescura (evidencia moderada)

Ahrefs, 17M URLs citadas: el contenido citado es un **25,7 % más reciente** que
el orgánico. Pero es **correlación**, y no es universal: las AI Overviews
prefieren contenido ligeramente *más antiguo*. La media de una página citada
son ~3 años, lo que desmiente el "50 % de las citas tienen menos de 13 semanas"
que circula por ahí.

Fuente: [Ahrefs](https://ahrefs.com/blog/do-ai-assistants-prefer-to-cite-fresh-content/)

### 4. Higiene técnica (evidencia moderada)

Fetchable, title, description, canonical, sitemap y schema **válido**. Es
higiene, no palanca (ver abajo).

## Lo que NO medimos, y por qué

### llms.txt — no lo medimos

- **Ahrefs, 137.210 dominios**: el **97 %** de los archivos `llms.txt` **no
  recibe ni una petición**. Y los bots **no lo buscan**: cero peticiones a
  llms.txt en sitios que no lo tienen.
- **El 92 % del tráfico a llms.txt son herramientas de auditoría SEO**
  comprobando si existe. Las herramientas que te lo venden son las que lo leen.
- **Google, documentación oficial (15 jun 2026)**: *"You don't need to create
  new machine readable files, AI text files, or markup to appear in these
  features."* Mueller: *"purely speculative"*.
- Ningún motor ha confirmado usarlo. Que OpenAI o Anthropic publiquen su propio
  `llms.txt` en sus docs (para agentes de código) **no es adopción**.
- Ni siquiera su autor prometió esto: la propuesta original va de contexto para
  agentes de código, no de visibilidad en buscadores generativos.

Ponerlo en la UI implicaría que importa. Es más creíble explicar por qué no lo
medimos.

Fuentes: [Ahrefs](https://ahrefs.com/blog/llmstxt-study/) ·
[Otterly](https://otterly.ai/blog/the-llms-txt-experiment/) ·
[Google/Mueller](https://www.searchenginejournal.com/google-says-llms-txt-is-purely-speculative-for-now/577576/)

### Schema.org como palanca de citación — no

Estudio **controlado** de Ahrefs (1.885 páginas que añadieron JSON-LD, contra
4.000 de control): **sin mejora**; incluso un 4,6 % *menos* de citas en AI
Overviews. Google: *"There's also no special schema.org structured data that
you need to add."*

Matices honestos: **Bing/Copilot sí lo usa** (confirmado por Microsoft), sirve
para los rich results, y el estudio solo cubre páginas **ya citadas** (no dice
si ayuda a una página que aún no lo está). Por eso lo tratamos como **higiene**
(¿es válido?), no como palanca.

Fuente: [Ahrefs vía SEJ](https://www.searchenginejournal.com/schema-markup-didnt-move-ai-citations-in-ahrefs-test/574568/)

### "Answer-first" con multiplicadores — no

El famoso "+40 %" sale del paper de Princeton (KDD 2024), que corre sobre un
**benchmark sintético con GPT-3.5 y solo 5 fuentes**, y mide *cuota de la
respuesta generada*, no citas reales. La estructura respondible es
**mecánicamente plausible** (el RAG recupera pasajes), pero nadie ha medido su
efecto en motores de producción. Va como guía, sin puntuar y sin cifras
inventadas.

Las cifras de vendors del tipo "2,8× con jerarquía de headings limpia" no
tienen metodología publicada. No se codifican.

### Velocidad / Core Web Vitals y E-E-A-T — no

Sin evidencia de relación con la citación. Los crawlers hacen un fetch y se
van; no hay presupuesto de renderizado que agotar. E-E-A-T es un concepto de
las guías para evaluadores humanos de Google, no una señal auditable. Folclore
SEO reciclado como GEO.

## El techo honesto de la auditoría on-page

**El mayor predictor de citación no está en la web del cliente.** El **82-84 %
de las citas son earned media** (Muck Rack, dos datasets independientes de más
de un millón y de 25M de enlaces). Ahrefs, 75.000 marcas: las menciones de
marca correlacionan **3× más** con la visibilidad en AI Overviews que los
backlinks. Reddit solo ya es el ~21 % de las citas externas.

Una auditoría on-page **no puede arreglar eso**, y el producto debe decirlo:
parte de la solución es PR y presencia en terceros, no HTML. Encaja con medir
primero y ser honesto después.

Dato relacionado que mata otro mito: solo el **12 %** de las URLs citadas por
las IAs están en el top 10 de Google (Ahrefs, 15.000 consultas). "Posiciona
bien y la IA te seguirá" es falso.
