# EchoGEO — Guía operativa del agente

Instrucciones vivas para trabajar en este repo. Es la fuente de verdad
operativa: léelo antes de tocar nada. Para dudas de producto manda
[VISION.md](VISION.md); para orquestar subagentes, [AGENTS.md](AGENTS.md).

@AGENTS.md

## Qué es EchoGEO

Mide la visibilidad de una marca en las respuestas de las IAs (ChatGPT,
Perplexity, Gemini) y devuelve un Índice de Eco reproducible con acciones
para salir citado. Núcleo: motor de scoring determinista multi-motor,
auditoría de citas y checks on-page. Detalle en [VISION.md](VISION.md).

## Estado actual (2026-07-15)

**Motor migrado al estándar; dashboard aún por migrar.**
- Motor de medición en `src/lib/services/measurement/` (service,
  repository, scoring, validation con Zod, errores tipados) e
  integraciones en `src/lib/integrations/` (Perplexity, mock). Tipos de
  dominio en `src/types/`. Entrypoints CLI en `scripts/`. Validado contra
  la API real de Perplexity Sonar y con test unitario del scoring.
- Dashboard v0 (Next.js 16) que lee `data/runs/` vía el servicio y pinta
  las mediciones. Aún vive en `app/` (pendiente de migrar a `src/app/` y
  de partir en componentes e i18n según convención).
- Gobernanza y andamiaje de estructura establecidos. El resto de la
  migración está planificado por lotes en [TODO.md](TODO.md).

Al empezar cada sesión: leer [TODO.md](TODO.md) y las últimas líneas de
[DO.md](DO.md) para saber qué toca.

## Stack técnico

- **Framework**: Next.js 16 (App Router, Turbopack), React 19.2.
- **Lenguaje**: TypeScript 5.9 en modo strict. Ojo: Next 16 no funciona
  con TypeScript 7; mantener la 5.x.
- **Estilos**: Tailwind CSS v4 (config CSS-first con `@theme`). Los tokens
  de fuente van en `@theme inline` porque referencian variables que
  next/font define en el body; en `:root` se resolverían vacíos.
- **Validación**: Zod en cada borde del sistema.
- **i18n**: castellano (`es`) e inglés (`en`). Ningún texto hardcodeado.
- **Tests**: Vitest (unit) + Playwright (E2E). Ver [TEST.md](TEST.md).
- **Scripts de motor**: tsx.
- **Previsto (aún no integrado)**: Neon + Drizzle (persistencia), Better
  Auth (login), Trigger.dev o Inngest (mediciones programadas).

## Motores de IA

- **Perplexity Sonar** (integrado): citas nativas en metadatos, el más
  barato. Endpoint `chat/completions`.
- **OpenAI Responses API** y **Gemini con grounding**: previstos, ambos
  devuelven citas estructuradas.

## Modelo de datos (v0, filesystem)

Sin base de datos todavía. Cada medición se guarda en
`data/runs/<timestamp>-<engine>/`:
- `measurement.json`: config + respuestas crudas íntegras de cada pasada.
  Es la fuente de verdad; permite re-puntuar sin volver a llamar a la API.
- `report.json`: resultado del scoring, siempre recalculable desde el
  crudo.

`data/` está en `.gitignore`. Los tipos viven en el motor y son el
contrato de lo que se persiste.

## Reglas de negocio

- **Muestreo**: cada prompt se ejecuta N veces (`runsPerPrompt`). La
  respuesta de una IA varía entre ejecuciones; las métricas son
  frecuencias observadas, no valores únicos.
- **Reproducibilidad**: el scoring es determinista. Misma entrada, mismo
  resultado. El crudo se guarda íntegro para re-puntuar históricos si la
  fórmula cambia.
- **Índice de Eco v0** = 10 × (0,5·presencia + 0,3·cita_enlazada +
  0,2·posición). Documentado en el código de scoring.
- **Detección de marca**: por nombre y alias, normalizando mayúsculas y
  acentos, con límites de palabra.
- **Cita enlazada**: el dominio propio aparece entre las fuentes citadas
  por el motor.

## Estructura de carpetas (objetivo)

```
src/
├── app/              rutas y composición de páginas
├── components/
│   ├── ui/           primitivos del sistema de diseño
│   ├── shared/       reutilizables entre vistas
│   └── features/     específicos de una feature
├── lib/
│   ├── services/     lógica de negocio pura, por dominio
│   ├── db/           acceso a datos
│   ├── integrations/ wrappers de APIs externas (motores de IA)
│   └── utils/        helpers genéricos
├── types/            tipos de dominio compartidos
├── messages/         i18n (un JSON por idioma)
└── styles/           globals + tokens
tests/                unit + E2E
```

Documentación adicional (ADRs, auditorías, notas) en `docs/`, no en la
raíz. La migración del código actual (`app/`, `src/` monolítico) a esta
estructura está en [TODO.md](TODO.md).

## Convenciones de código

### Componentes (si tienen lógica o estado)

Un componente con lógica se parte en su carpeta:
- `Nombre.tsx` — solo JSX y composición.
- `Nombre.styles.ts` — clases agrupadas por elemento (`as const`) o `cva`.
- `Nombre.logic.ts` — hooks, estado, handlers, efectos. Aquí el
  `'use client'` si aplica.
- `Nombre.types.ts` — tipos propios del componente.
- `index.ts` — fachada: `export { Nombre } from './Nombre'`.

Server Components por defecto. `'use client'` solo cuando hace falta y lo
más abajo posible en el árbol. Componentes triviales pueden ir en un solo
archivo.

Todo elemento de UI relevante lleva `data-component` en kebab-case inglés,
registrado en [COMPONENTS.md](COMPONENTS.md).

### Servicios (`lib/services/<dominio>/`)

- `<dom>.service.ts` — lógica de negocio; orquesta repositorio y reglas.
- `<dom>.repository.ts` — acceso a datos, sin reglas de negocio.
- `<dom>.validation.ts` — schemas Zod de entrada/salida.
- `<dom>.types.ts` — tipos del dominio.
- `<dom>.errors.ts` — clases de error con `readonly code`. Nunca
  `throw new Error('string')`.
- `index.ts` — API pública del módulo.

Validar en cada borde (endpoints, server actions, webhooks). Un Client
Component nunca importa del `index.ts` de un servicio que reexporte código
server con acceso a Node: arrastra dependencias nativas al bundle.

### Idioma

| Elemento | Idioma |
|---|---|
| Variables, funciones, tipos, archivos | Inglés |
| Comentarios y JSDoc | Castellano |
| Textos visibles al usuario | i18n (es, en) |
| Commits | Conventional Commits, prefijo inglés, mensaje castellano |
| Logs técnicos | Inglés |
| Documentación `.md` | Castellano |

### Comentarios

Explican el *por qué*, no el *qué*. Comentar siempre: funciones públicas
exportadas (JSDoc en castellano), decisiones no obvias, workarounds (con
TODO si hay que revisarlos) y lógica de negocio compleja. No comentar lo
que el código ya dice.

### Reglas no negociables

- TypeScript strict. Sin `any` salvo justificación en comentario.
- Ningún archivo pasa de ~250 líneas. Si crece, dividir por
  responsabilidades.
- Errores tipados, no strings genéricos.
- Sin secretos hardcodeados: todo en `.env.local`, nunca commiteado.
- Sin `localStorage`/`sessionStorage` en producción salvo caso justificado.
- Lógica de APIs externas en `lib/integrations`, nunca en componentes.
- Sin endpoints sin auth check, salvo que sean explícitamente públicos.
- Imports en 3 grupos con línea en blanco: externos, alias `@/…`,
  relativos `./…`.
- Nombres: componentes React `PascalCase.tsx`; servicios/utils/hooks
  `kebab-case.ts`; tipos `*.types.ts`; estilos `*.styles.ts`.
- El consumidor importa desde la fachada `index.ts`, nunca de archivos
  internos.

## Comandos

```
npm run dev        # dashboard en http://localhost:3000
npm run build      # build de producción
npm run measure    # medición real (necesita PERPLEXITY_API_KEY)
npm run measure -- --mock   # medición simulada, sin coste
npm run score -- data/runs/<carpeta>   # re-puntúa desde el crudo
npm run typecheck  # tsc --noEmit
npm run test       # Vitest (cuando haya tests)
npm run lint       # ESLint (cuando esté configurado)
```

Antes de cada commit: `typecheck` + `lint` + `build` + tests relevantes en
verde. Verificar en el navegador real lo que se pueda, no solo compilar.

## Variables de entorno

En `.env.local` (nunca commiteado; plantilla en `.env.example`):
- `PERPLEXITY_API_KEY` — clave de la API de Perplexity.

## Trabajo con Jorge

- Comunicación en castellano, natural y directo, sin tics de IA (nada de
  guiones largos, "no es solo X sino Y", ni tríos pulidos).
- Honestidad total: si algo falla o no se pudo verificar, decirlo.
  Avisar antes de ejecutar si su idea tiene un problema.
- Jorge marca el objetivo de cada sesión; no implementar sin que lo pida.
- Commits terminan en:
  `Co-Authored-By: Claude <noreply@anthropic.com>`

## Mantenimiento de este archivo

Barato en tokens: estado real, decisiones y cómo arrancar. Nada de
historiales largos ni duplicar lo que ya cuentan el código, el git log o
los otros `.md`.
