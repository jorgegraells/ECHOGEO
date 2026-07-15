# EchoGEO — Tareas pendientes

Leer al empezar cada sesión. Al cerrar una tarea, moverla a
[DO.md](DO.md) con fecha. Las tareas grandes se parten en subtareas antes
de empezar.

## Migración del prototipo al estándar (por lotes)

El motor y el dashboard funcionan pero no cumplen la estructura ni las
convenciones de [CLAUDE.md](CLAUDE.md). Migrar en lotes pequeños y
verificables, sin romper el build entre uno y otro.

- [x] **Andamiaje base**: estructura `src/`, alias `@/…`, orden de imports
      (Prettier), Vitest, i18n (es, en). *(Falta config de ESLint y de
      Playwright; ver más abajo.)*
- [x] **Motor → `src/lib/services/measurement/`**: partido en service,
      repository, scoring, validation (Zod), types, errors e index. Errores
      tipados en vez de strings.
- [x] **Adaptadores de IA → `src/lib/integrations/`**: Perplexity y mock
      como wrappers, con validación Zod de la respuesta de Perplexity.
- [x] **Scoring → servicio**: puro y determinista en
      `measurement.scoring.ts`, con test unitario.
- [ ] **Dashboard → `src/app/`**: mover el App Router; partir
      `runs/[id]/page.tsx` (201 líneas) en componentes según convención
      (`.tsx` / `.styles.ts` / `.logic.ts` / `.types.ts`). Mover
      `app/globals.css` a `src/styles/`.
- [ ] **i18n de la UI**: conectar next-intl y sacar todos los textos
      hardcodeados a `src/messages/es.json` y `en.json` (claves ya creadas).
- [ ] **`data-component`**: añadir a los componentes de UI y registrarlos
      en [COMPONENTS.md](COMPONENTS.md).
- [ ] **ESLint**: configurar flat config con el orden de imports como regla
      y añadir `npm run lint` al checklist de commit.
- [ ] **Playwright**: configurar el runner E2E y un primer flujo del
      dashboard.
- [ ] **Más tests**: cubrir el parseo de la integración de Perplexity con
      fixtures de crudo, y la validación Zod, según [TEST.md](TEST.md).

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
