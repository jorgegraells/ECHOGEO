# EchoGEO — Tareas pendientes

Leer al empezar cada sesión. Al cerrar una tarea, moverla a
[DO.md](DO.md) con fecha. Las tareas grandes se parten en subtareas antes
de empezar.

## Migración del prototipo al estándar (por lotes)

El motor y el dashboard funcionan pero no cumplen la estructura ni las
convenciones de [CLAUDE.md](CLAUDE.md). Migrar en lotes pequeños y
verificables, sin romper el build entre uno y otro.

- [ ] **Andamiaje base**: mover a `src/` la estructura de carpetas
      (`components/`, `lib/`, `types/`, `messages/`, `styles/`), configurar
      alias `@/…`, orden de imports (ESLint/Prettier), Vitest y Playwright,
      y la infraestructura i18n (es, en). *(Parcial: hecho el andamiaje de
      config; falta mover el código.)*
- [ ] **Motor → `src/lib/services/measurement/`**: partir en
      `measurement.service.ts`, `measurement.repository.ts` (lee/escribe
      `data/runs/`), `measurement.validation.ts` (Zod), `measurement.types.ts`,
      `measurement.errors.ts`, `index.ts`. Sustituir los
      `throw new Error('string')` por errores tipados.
- [ ] **Adaptadores de IA → `src/lib/integrations/`**: Perplexity y el
      mock como wrappers, con validación Zod de la respuesta cruda.
- [ ] **Scoring → servicio o `lib`**: mantener la pureza y determinismo;
      añadir tests unitarios (es lo primero que debe tener test).
- [ ] **Dashboard → `src/app/`**: mover el App Router; partir
      `runs/[id]/page.tsx` (201 líneas) en componentes según convención
      (`.tsx` / `.styles.ts` / `.logic.ts` / `.types.ts`).
- [ ] **i18n de la UI**: sacar todos los textos hardcodeados a
      `messages/es.json` y `messages/en.json`.
- [ ] **`data-component`**: añadir a los componentes de UI y registrarlos
      en [COMPONENTS.md](COMPONENTS.md).
- [ ] **Tests**: cubrir scoring, servicios y parseo de adaptadores según
      [TEST.md](TEST.md); un flujo E2E del dashboard.

## Producto (después de la migración)

- [ ] Fórmula del Índice de Eco v1 con la varianza entre pasadas
      declarada en el propio índice, no solo en las métricas.
- [ ] Segundo motor de IA (OpenAI Responses API con web search).
- [ ] Tercer motor (Gemini con grounding).
- [ ] Checks on-page automáticos (fetch de la web + auditoría de
      citabilidad).
- [ ] Landing pública sobre los tokens de la estación de medición.
- [ ] Vista de comparación entre mediciones (evolución en el tiempo).

## Higiene

- [ ] Rotar la clave de Perplexity: quedó expuesta en un chat. Generar una
      nueva en el panel, actualizar `.env.local`, revocar la vieja.
