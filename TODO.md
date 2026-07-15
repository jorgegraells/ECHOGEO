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
- [x] **Dashboard → `src/app/`**: App Router movido; `runs/[id]/page.tsx`
      partido en componentes de feature (MeasurementList, MeasurementReport,
      EchoIndexPanel, PromptLog, SourceAudit) con `.tsx`/`.styles.ts`/
      `.logic.ts` e index. `globals.css` en `src/styles/`.
- [x] **i18n de la UI**: módulo i18n propio (es, en) con traductor y
      formato por locale; cero texto hardcodeado. Idioma por cookie
      `locale`. *(Se puede cambiar a next-intl si hace falta reactividad
      cliente o selector de idioma; hoy no lo necesita.)*
- [x] **`data-component`**: añadido a los componentes y registrado en
      [COMPONENTS.md](COMPONENTS.md).
- [ ] **Selector de idioma**: un control en la UI que escriba la cookie
      `locale` (hoy solo se puede cambiar a mano).
- [ ] **ESLint**: configurar flat config con el orden de imports como regla
      y añadir `npm run lint` al checklist de commit.
- [ ] **Playwright**: configurar el runner E2E y un primer flujo del
      dashboard.
- [ ] **Más tests**: cubrir el parseo de la integración de Perplexity con
      fixtures de crudo, y la validación Zod, según [TEST.md](TEST.md).

## Producto (después de la migración)

- [x] **Crear mediciones desde la web**: formulario en `/runs/new` +
      Server Action que valida (Zod) y lanza la medición (mock o
      Perplexity), y redirige a su detalle.
- [ ] **Mediciones largas en background**: hoy la Server Action corre la
      medición síncrona; una medición real con muchos prompts tarda y no
      escala en producción. Mover a un job runner (Trigger.dev o Inngest)
      con estado "en curso / lista" en la UI.
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
