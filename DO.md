# EchoGEO — Tareas hechas

Registro de lo cerrado, más reciente arriba. Al cerrar una tarea de
[TODO.md](TODO.md), moverla aquí con fecha (YYYY-MM-DD) y una descripción
breve. Lo hace el orquestador, nunca un subagente.

## 2026-07-15

- **Gobernanza del proyecto**: creados los `.md` de raíz con roles
  separados (CLAUDE, AGENTS, VISION, TODO, DO, TEST, COMPONENTS, README)
  según el estándar de arquitectura acordado.
- **Andamiaje de estructura**: preparada la base `src/` y la config
  transversal (Zod, i18n es/en, Vitest, orden de imports) sin migrar aún
  el código de producto.
- **Dashboard v0** (Next.js 16 + Tailwind v4): lista de mediciones y
  detalle con índice, desglose por prompt, estado de cada pasada y
  auditoría de fuentes citadas. Lee `data/runs/` directamente.
- **Primera medición real** con marcas reales de café de especialidad
  (Nomad Coffee vs competidores) contra Perplexity Sonar. Índice y
  varianza entre pasadas coherentes.

## 2026-07-14

- **Motor de medición v0** (TypeScript + tsx): adaptador de Perplexity
  Sonar, motor mock determinista y scoring reproducible. Guarda el crudo
  íntegro en `data/` y re-puntúa desde él. Validado contra la API real.
- **Setup inicial** del repositorio y primera dirección de diseño
  ("estación de medición") aprobada.
