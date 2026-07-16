# EchoGEO — Tareas hechas

Registro de lo cerrado, más reciente arriba. Al cerrar una tarea de
[TODO.md](TODO.md), moverla aquí con fecha (YYYY-MM-DD) y una descripción
breve. Lo hace el orquestador, nunca un subagente.

## 2026-07-16

- **El formulario ya no elige motores ni simula**: se mide siempre en los
  tres (es lo que se cobra por pregunta, así que elegir no abarataba nada) y
  el modo simulado sale de la UI (es herramienta de desarrollo, queda en el
  CLI con `--mock`). El textarea pasa a estar controlado para que el contador
  no se desincronice si el navegador restaura el formulario.
- **Un motor caído ya no tumba la medición**: al forzar los tres motores,
  Gemini (sin cuota) habría hecho fallar todas las mediciones **después** de
  pagar Perplexity y OpenAI. Ahora el fallo se anota en `failures` del crudo,
  el informe sale con los motores que respondieron y el boletín avisa de que
  a ese motor no se le pudo preguntar (para no dar a entender que la marca no
  aparece en él). Si no responde ninguno, `AllEnginesFailedError`. El motivo
  del fallo se limpia: se rescata el mensaje de la API en vez de volcar su
  JSON. Verificado con una medición real: Perplexity y OpenAI completaron,
  Gemini quedó anotado con su 429 legible.
- **Tamaños de medición** (`measurement.plans.ts`): básica, media y completa,
  con su límite de preguntas y las pasadas fijas (no se recortan para
  abaratar: son la garantía de varianza). El formulario ofrece el tamaño y
  avisa del límite en vivo, pero **la autoridad es el servidor**: se verificó
  saltándose el bloqueo del cliente y la Server Action rechazó 30 prompts con
  tamaño básico sin lanzar ninguna medición. Los precios NO están en el repo
  (es público): viven en la pasarela de pago.
- **Coste por medición** (`computeCost`): exacto en Perplexity (lo da la API),
  calculado en OpenAI con tokens y número de búsquedas. Con datos reales:
  Perplexity 0,0057 $/consulta y OpenAI ~0,0775 $/consulta cuando busca, o
  sea unas 14 veces más. Sirve para controlar el margen desde la primera
  venta.
- **fix: las recomendaciones de bots bloqueados contradecían la medición**.
  Jorge detectó que la prescripción decía "bloqueas OAI-SearchBot: por eso no
  apareces en ChatGPT" mientras el desglose medía 100 % de presencia en
  OpenAI. Dos errores: (1) el texto confundía **mención** con **cita
  enlazada** —bloquear el bot impide que tu web sea fuente citada, no que el
  modelo te nombre por lo que ya sabe—, y (2) la recomendación no cruzaba con
  los datos medidos. Ahora el hallazgo se contrasta con el motor
  correspondiente (`engineId` en el catálogo de bots): si ese motor no cita el
  dominio, el bloqueo se presenta como causa raíz; si sí lo cita pese al
  bloqueo, se reporta la contradicción para revisarla en vez de afirmar algo
  falso. 3 tests nuevos que fijan el caso.
- **Auditoría on-page integrada (Fase B)**: al medir, si hay dominio, se
  audita la web y se guarda `onpage.json` junto al crudo; un fallo de la web
  no tumba la medición. El detalle muestra la sección "Auditoría de tu web"
  con el nivel de evidencia de cada hallazgo, y la Prescripción se encabeza
  con los hallazgos graves (prioridad 100). Con esto llega el "nivel 2" de
  recomendación: en vez de "concéntrate en Perplexity", ahora dice "tu
  robots.txt bloquea a PerplexityBot: por eso no apareces". Verificado en
  navegador con una web que bloquea bots de citación.
- **Auditoría on-page, servicio (Fase A)**: nuevo `src/lib/services/onpage/`
  con 4 checks respaldados por evidencia y un parser propio de robots.txt
  (RFC 9309, incluida la regla de que un bot con grupo propio ignora el `*`).
  Catálogo de bots con la distinción crítica citación/entrenamiento: bloquear
  OAI-SearchBot o PerplexityBot te borra de las respuestas; bloquear GPTBot o
  ClaudeBot no. CLI `npm run audit -- <dominio>`. 26 tests. Verificado contra
  webs reales: nomadcoffee.es sale limpio; nytimes.com da 4 críticos (bloquea
  OAI-SearchBot, PerplexityBot, Claude-SearchBot y meta-webindexer) pero
  conserva las AI Overviews porque permite Googlebot, y su bloqueo de
  entrenamiento sale como info, no como fallo.
- **Investigación de evidencia GEO** documentada en
  [docs/evidencia-geo.md](docs/evidencia-geo.md): descartados llms.txt (97 %
  de los archivos no recibe una petición; Google documenta que lo ignora),
  el schema como palanca (estudio controlado sin efecto), velocidad y E-E-A-T.
  Registrado también el techo honesto: el 82-84 % de las citas son earned
  media, fuera de la web del cliente.
- **Recomendaciones deterministas ("Prescripción")**: capa nueva en el
  servicio (`buildRecommendations`) que deriva consejos accionables de los
  datos de la medición mediante reglas (cita enlazada baja por motor, hueco
  por prompt, divergencia entre motores, fuente ajena donde no apareces,
  posición baja, falta de dominio), con prioridad y códigos i18n. Sección
  "Prescripción" en el detalle (`Prescription`). Sin LLM: reproducible y
  sin coste. Verificado con la medición real de Nomad: generó "el trabajo
  está en perplexity" (por el 8,5 vs 10,0) y "cita ineffablecoffee.com y no
  te incluye". 6 tests. Las recomendaciones potentes de verdad
  (qué cambiar en la web) necesitan los checks on-page, aún pendientes.
- **Verificación multi-motor real (Perplexity + OpenAI)**: medición de
  Nomad Coffee en los dos motores a la vez. El desglose diverge de verdad:
  índice 8,5 en Perplexity vs 10,0 en OpenAI, porque Perplexity solo enlaza
  su web en la mitad de las respuestas y OpenAI en todas. Confirma que el
  multi-motor aporta el insight accionable que se perdía con un solo motor.
  Gemini sigue fuera por falta de cuota.
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
