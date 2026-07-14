# EchoGEO

Herramienta que mide la visibilidad de una marca dentro de las respuestas
de las IAs (ChatGPT, Perplexity, Gemini) y devuelve un score con acciones
concretas para salir citado.

Núcleo del producto:
- Motor de scoring determinista propio sobre varios motores de IA.
- Auditoría de citas (qué fuentes cita cada motor y si la marca aparece).
- Checks on-page automáticos (qué le falta a la web para ser citable).

## Estado actual (2026-07-14)

**Motor v0 funcionando en modo script** (TypeScript + tsx, sin UI):
- `npm run measure -- --mock` → medición completa simulada, sin coste.
- `npm run measure` → contra Perplexity Sonar (necesita `.env.local`
  con `PERPLEXITY_API_KEY`; ver `.env.example`).
- `npm run score -- data/runs/<carpeta>` → re-puntúa desde el crudo
  guardado sin llamar a la API (garantía de reproducibilidad).
- Config de la medición en `measurement.config.json` (marca, alias,
  dominio, competidores, prompts, pasadas).
- Fórmula v0 documentada en `src/scoring.ts`. El crudo se guarda
  íntegro en `data/` (gitignored) para poder re-puntuar históricos.

**Pendiente**: validar contra la API real con una marca de Jorge (falta
la API key), luego landing y dashboard.

## Decisiones tomadas

- Un solo proyecto Next.js alojará landing pública + app con login +
  API. Los jobs de medición irán en runner externo (Trigger.dev o
  Inngest, sin decidir cuál). El motor se construye primero.
- Primer motor de IA: Perplexity Sonar (citas nativas en metadatos,
  el más barato). OpenAI y Gemini después.
- Dirección de diseño aprobada: "estación de medición" (instrumento
  científico + boletín editorial). Instrument Serif + Newsreader +
  IBM Plex Mono; papel #F2F1EA, tinta #1B1F1C, señal #175E45, alarma
  #B3402E. Nada de look IA genérico (morados, glassmorphism, bento).
- Stack de referencia: Next.js 16.3, React 19.2, Tailwind v4,
  shadcn/ui sobre Base UI, Neon + Drizzle, Better Auth cuando toque.

## Convenciones de trabajo (obligatorias)

- Comunicación con Jorge en castellano, natural y directo.
- Código en inglés; comentarios y commits en castellano, imperativo.
- Commits terminan en: `Co-Authored-By: Claude <noreply@anthropic.com>`
- Antes de cada commit: typecheck y build en verde, y verificar en el
  navegador real lo que se pueda, no solo compilar.
- Honestidad total: si algo falla o no se pudo verificar, decirlo.
- Nunca dejar en textos públicos cifras de negocio (precios, usuarios)
  ni datos personales de Jorge.
- Jorge marca el objetivo de cada sesión; no implementar sin que lo pida.

## Mantenimiento de este archivo

Mantenerlo barato en tokens: estado real, decisiones tomadas y cómo
arrancar el proyecto. Nada de historiales largos ni duplicar lo que ya
cuenta el código o el git log.
