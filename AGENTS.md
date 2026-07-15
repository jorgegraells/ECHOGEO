# EchoGEO — Orquestación de subagentes

Playbooks para lanzar subagentes desde el orquestador (la sesión
principal). Importado por [CLAUDE.md](CLAUDE.md).

## Reglas fijas

- **Los subagentes NUNCA commitean.** Solo el orquestador hace `git
  commit`, y solo tras validar. Un subagente que toca código devuelve su
  resultado; el orquestador revisa, integra y commitea.
- **El orquestador valida entre lotes.** Después de cada tanda de trabajo
  de subagentes: `typecheck` + `lint` + `build` + tests relevantes en
  verde antes de seguir o commitear.
- **Los prompts a subagente son siempre autocontenidos.** Incluyen rutas,
  contexto y criterio de aceptación. Un subagente no ve la conversación;
  asume que arranca en frío.
- **Un subagente de solo lectura no escribe.** Para explorar o planificar
  se usan agentes sin permisos de escritura (Explore, Plan).

## Cuándo lanzar cada tipo

- **Explore** — búsquedas amplias de solo lectura: barrer muchos archivos
  o convenciones cuando solo interesa la conclusión, no volcar los
  archivos. Especificar amplitud ("medium", "very thorough").
- **Plan** — diseñar la estrategia de una tarea grande antes de tocar
  código: pasos, archivos críticos, trade-offs. No implementa.
- **general-purpose** — tareas multi-paso o búsquedas donde no se confía
  en acertar a la primera. Puede escribir; su salida la valida el
  orquestador.

## Cuándo en paralelo

Lanzar subagentes en paralelo (varias llamadas en un mismo mensaje) cuando
el trabajo es independiente y no comparte archivos: p. ej. investigar tres
temas a la vez, o migrar módulos que no se tocan entre sí. Si hay
dependencia entre las tareas, secuenciar.

## Cuándo en worktrees

Usar aislamiento en worktree solo cuando varios subagentes modifican
archivos en paralelo y chocarían entre sí. Tiene coste (setup + disco);
para trabajo secuencial o de solo lectura no hace falta.

## Flujo típico de una tarea grande

1. Explore/Plan para entender y diseñar (solo lectura).
2. El orquestador parte la tarea en lotes pequeños y verificables, y los
   añade a [TODO.md](TODO.md).
3. Subagentes implementan lote a lote con prompts autocontenidos.
4. El orquestador valida cada lote y commitea (Conventional Commits).
5. Al cerrar la tarea, moverla de [TODO.md](TODO.md) a [DO.md](DO.md) con
   fecha. Esto lo hace el orquestador, nunca un subagente.
