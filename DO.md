# EchoGEO — Tareas hechas

Registro de lo cerrado, más reciente arriba. Al cerrar una tarea de
[TODO.md](TODO.md), moverla aquí con fecha (YYYY-MM-DD) y una descripción
breve. Lo hace el orquestador, nunca un subagente.

## 2026-07-16

- **Multi-motor, Fase B (UI)**: el formulario pasa a checkboxes de motores
  (Perplexity/OpenAI/Gemini) más un toggle "Simular (sin coste)"; el detalle
  añade el desglose por motor (`EngineBreakdown`), que solo aparece si se
  midió en más de un motor. Verificado en navegador: creación multi-motor
  desde el formulario → detalle con índice global + desglose por los 3
  motores; con un solo motor el desglose no aparece. Arreglado de paso un
  key de React duplicado en el registro por prompt (varias pasadas con el
  mismo runIndex al haber varios motores).
- **Multi-motor, Fase A (backend)**: una medición pasa a medir en varios
  motores a la vez. `MeasurementConfig.engine` → `engines[]`; el scoring da
  un Índice de Eco global (sobre todas las pasadas de todos los motores) más
  el desglose `byEngine`; el servicio corre cada motor y etiqueta cada
  pasada. Compatibilidad hacia atrás: los crudos antiguos con `engine`
  singular se leen igual (preprocess Zod). Verificado con mock de 3 motores
  (18 pasadas, índice global + 3 byEngine) y el dashboard sigue renderizando.
  La UI del desglose por motor y el formulario con checkboxes van en la
  Fase B.

## 2026-07-15

- **Verificación de motores contra API real**: OpenAI validado end-to-end
  (texto + citas `url_citation` correctos). Gemini respondió con auth y
  endpoint bien, pero la clave dio 429 (cuota agotada): camino feliz sin
  confirmar. Perplexity ya estaba validado.
- **Lote en paralelo (4 subagentes)**: integraciones de OpenAI (Responses
  API) y Gemini (grounding) con test de parsing por fixture, registradas en
  el servicio (registro de motores) y ofrecidas en el formulario; selector
  de idioma ES/EN en la cabecera (LocaleSwitcher + Server Action setLocale);
  batería de tests unitarios (validación Zod, parseo Perplexity, traductor
  i18n). El orquestador integró el wiring, arregló `parseMeasurementFile`
  para lanzar error tipado y el import client-safe del LocaleSwitcher.
  25 tests en verde, typecheck y build OK, selector verificado en navegador.
  Pendiente: verificar OpenAI/Gemini contra API real (faltan claves).
- **Crear mediciones desde la web**: formulario en `/runs/new`
  (MeasurementForm, client) + Server Action `createMeasurement` que valida
  con Zod y delega en el servicio, con motor simulado por defecto y
  Perplexity real opcional. Cierra el bucle usable de punta a punta sin
  terminal. Verificado en navegador: creación → redirección al detalle,
  aparición en la lista y validación de error en el borde.
- **Migración del dashboard al estándar**: App Router a `src/app/`, vistas
  partidas en componentes de feature (MeasurementList, MeasurementReport,
  EchoIndexPanel, PromptLog, SourceAudit) con `.tsx`/`.styles.ts`/
  `.logic.ts`. i18n propio (es, en) con formato por locale y cero texto
  hardcodeado; idioma por cookie `locale`. `data-component` en cada
  componente. Verificado en navegador en ambos idiomas, sin regresión.
- **Migración del motor al estándar**: partido en
  `src/lib/services/measurement/` (service, repository, scoring,
  validation con Zod, errores tipados) e integraciones en
  `src/lib/integrations/` (Perplexity con validación de respuesta, mock).
  Tipos de dominio en `src/types/`, entrypoints CLI en `scripts/`, alias
  `@/…` hacia `src/`. Dashboard recableado al servicio. Verificado sin
  regresión (measure --mock idéntico, test del scoring, build, navegador).
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
