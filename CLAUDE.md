# EchoGEO

Herramienta que mide la visibilidad de una marca dentro de las respuestas
de las IAs (ChatGPT, Perplexity, Gemini) y devuelve un score con acciones
concretas para salir citado.

Núcleo del producto:
- Motor de scoring determinista propio sobre varios motores de IA.
- Auditoría de citas (qué fuentes cita cada motor y si la marca aparece).
- Checks on-page automáticos (qué le falta a la web para ser citable).

## Estado actual (2026-07-14)

**Proyecto greenfield. No hay código todavía.** No hay package.json, ni
git init, ni estructura de carpetas. Cualquier afirmación en este archivo
sobre arquitectura es intención, no realidad; actualízalo cuando se
construya algo.

Stack previsto: Next.js + APIs de SERP/IA. Nada decidido en firme sobre
base de datos, hosting ni proveedores concretos de API.

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
