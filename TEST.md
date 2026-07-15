# EchoGEO — Estrategia de testing

## Runners

- **Unit / integración**: Vitest. Encaja con el ecosistema Vite/TS y
  arranca rápido.
- **E2E**: Playwright. Recorre el dashboard en un navegador real.

## Qué se testea (y con qué prioridad)

1. **Scoring (máxima prioridad).** Es el corazón del producto y es
   determinista, así que es el candidato ideal a tests unitarios: dada una
   medición cruda fija, el reporte debe ser exacto y estable. Cubrir
   detección de marca por alias, normalización de acentos, cálculo de
   posición, cita de dominio y el índice compuesto.
2. **Servicios de dominio.** Reglas de negocio con entradas controladas.
   El repositorio se mockea o se apunta a un directorio de fixtures.
3. **Integraciones de motores de IA.** Nunca se llama a la API real en
   los tests. Se prueba el parseo de respuestas con cuerpos crudos
   guardados como fixtures (incluidos formatos raros: sin citas, con
   `search_results` en vez de `citations`, etc.).
4. **Validación (Zod).** Que los schemas rechazan lo que deben rechazar
   en cada borde.
5. **UI crítica (E2E).** Los flujos que importan: ver la lista de
   mediciones, abrir un detalle, que el índice y la auditoría de fuentes
   se pintan. No perseguir cobertura de píxeles.

## Política

- Todo desarrollo nuevo lleva tests según esta guía. Un servicio o una
  función de negocio sin test no se da por cerrado.
- Los tests no tocan red ni APIs de pago. Las respuestas de motores de IA
  se sirven desde fixtures.
- Los fixtures de crudo se pueden generar guardando una respuesta real y
  anonimizando lo que haga falta.

## Entorno

- Tests en `tests/`, separando `unit/` y `e2e/`.
- `npm run test` ejecuta Vitest; `npm run test:e2e` ejecuta Playwright
  (se añaden al configurar cada runner).
- E2E arranca el dev server o un build de preview según convenga; no
  depende de `data/runs/` del desarrollador, usa fixtures propios.
