# EchoGEO

Mide la visibilidad de una marca dentro de las respuestas de las IAs
(ChatGPT, Perplexity, Gemini) y devuelve un Índice de Eco reproducible con
acciones concretas para salir citado.

Visión de producto en [VISION.md](VISION.md). Guía de trabajo y
convenciones en [CLAUDE.md](CLAUDE.md).

## Requisitos

- Node.js 22+
- Una clave de la API de Perplexity (para mediciones reales)

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena PERPLEXITY_API_KEY
```

## Comandos

```bash
npm run dev                          # dashboard en http://localhost:3000
npm run measure                      # medición real (gasta créditos de API)
npm run measure -- --mock            # medición simulada, sin coste
npm run score -- data/runs/<carpeta> # re-puntúa una medición guardada
npm run build                        # build de producción
npm run typecheck                    # comprobación de tipos
```

## Cómo funciona

1. `measurement.config.json` define la marca, sus alias, su dominio, los
   competidores, los prompts y cuántas pasadas por prompt.
2. `npm run measure` lanza cada prompt N veces contra el motor de IA,
   guarda las respuestas crudas en `data/runs/<carpeta>/` y calcula el
   Índice de Eco.
3. El dashboard (`npm run dev`) lee esas mediciones y las presenta:
   índice, desglose por prompt y auditoría de las fuentes citadas.

El crudo se guarda íntegro, así que `npm run score` puede recalcular
cualquier medición sin volver a llamar a la API. `data/` no se commitea.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `PERPLEXITY_API_KEY` | Clave de la API de Perplexity Sonar |
