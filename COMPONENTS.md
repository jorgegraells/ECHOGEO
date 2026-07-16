# EchoGEO — Glosario de componentes

Identificadores `data-component` para localizar cualquier elemento de UI
desde las devtools. Convención: kebab-case en inglés. Cada componente con
entidad propia lleva su `data-component` y se registra aquí.

## Registro

| data-component | Ubicación | Descripción |
|---|---|---|
| `section-heading` | `src/components/ui/SectionHeading` | Cabecera de sección: código de registro, título e info lateral |
| `measurement-list` | `src/components/features/measurements/MeasurementList` | Lista de mediciones guardadas con su Índice de Eco |
| `measurement-report` | `src/components/features/measurements/MeasurementReport` | Boletín completo de una medición |
| `echo-index-panel` | `src/components/features/measurements/EchoIndexPanel` | Índice de Eco compuesto y su desglose |
| `prompt-log` | `src/components/features/measurements/PromptLog` | Registro por prompt y estado de cada pasada |
| `source-audit` | `src/components/features/measurements/SourceAudit` | Auditoría de fuentes citadas |
| `measurement-form` | `src/components/features/measurements/MeasurementForm` | Formulario para crear y lanzar una medición |
| `engine-breakdown` | `src/components/features/measurements/EngineBreakdown` | Desglose del Índice de Eco por motor |
| `prescription` | `src/components/features/measurements/Prescription` | Recomendaciones accionables priorizadas |
| `locale-switcher` | `src/components/shared/LocaleSwitcher` | Selector de idioma ES/EN de la cabecera |

## Cómo registrar uno

1. Añadir `data-component="nombre-en-kebab-case"` al elemento raíz del
   componente.
2. Añadir una fila a la tabla con su ubicación (ruta del archivo) y una
   descripción de una línea.
