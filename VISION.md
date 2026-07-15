# EchoGEO — Visión de producto

> Documento de producto. Si una decisión técnica choca con lo que dice
> aquí, gana la visión. Consultar antes que CLAUDE.md cuando la duda sea
> de producto.

## El problema

Cada vez más gente pregunta a una IA (ChatGPT, Perplexity, Gemini) en
lugar de buscar en Google. Cuando alguien pregunta "¿cuál es el mejor X
para Y?", la IA nombra unas marcas y omite otras. Para una marca, aparecer
o no en esa respuesta empieza a pesar tanto como el SEO clásico. Hoy casi
nadie sabe si la IA le cita, cuándo, ni qué hacer para que le cite.

## Qué es EchoGEO

Una estación de medición de la visibilidad de una marca dentro de las
respuestas de las IAs. Tres piezas:

1. **Motor de scoring reproducible** sobre varios motores de IA. Mide
   presencia, posición, cita enlazada y sentimiento, y los resume en un
   Índice de Eco.
2. **Auditoría de citas**: qué fuentes cita cada motor y si la marca
   aparece en ellas. Convierte cada fuente ausente en un objetivo
   concreto.
3. **Checks on-page automáticos**: qué le falta a la web de la marca para
   ser citable, verificado contra la web real.

## Para quién

Marcas y agencias que ya se preocupan por su presencia online y notan que
el tráfico de IA crece. El producto habla su idioma (visibilidad, share
of voice, fuentes) pero sin humo.

## Principios (lo que nos diferencia)

- **Honestidad sobre el ruido.** La misma pregunta a la misma IA da
  respuestas distintas cada vez. No lo escondemos: muestreamos N pasadas y
  presentamos frecuencia observada con su varianza, no una foto única que
  mañana no se sostiene. La queja número uno del sector es la
  inconsistencia; nosotros la medimos en lugar de fingir que no existe.
- **Reproducibilidad.** Guardamos cada respuesta cruda íntegra. Con la
  misma entrada, el mismo score, siempre. Si la fórmula mejora,
  re-puntuamos el histórico para que las series sigan siendo comparables.
- **Del dato a la obra.** Un score sin acciones es teatro. Cada medición
  termina en una prescripción concreta: qué URL tocar, qué le falta y por
  qué.
- **Nada de look IA genérico.** El producto se ve como un instrumento
  científico y un boletín editorial, no como otra SaaS de IA con morados y
  glassmorphism. El diseño es parte del posicionamiento.

## Diferenciador defendible

La auditoría on-page continua ligada a la monitorización casi nadie la
tiene. Medir es tabla de mercado; decir exactamente qué cambiar en la web
para salir citado, y verificarlo contra la web real de forma recurrente,
es el hueco.

## Alcance por fases

- **Fase 1 (en curso)**: motor sobre un motor de IA (Perplexity Sonar) +
  dashboard de lectura. Valida el corazón del producto.
- **Fase 2**: más motores de IA (OpenAI, Gemini), fórmula del índice con
  varianza declarada, checks on-page.
- **Fase 3**: cuentas y login, mediciones programadas en runner externo,
  landing pública, histórico y comparativas.

## Reglas de comunicación pública

Nunca publicar cifras de negocio (precios, número de usuarios) ni datos
personales del equipo en textos visibles o en el repositorio.
