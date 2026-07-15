# EchoGEO — Glosario de componentes

Identificadores `data-component` para localizar cualquier elemento de UI
desde las devtools. Convención: kebab-case en inglés. Cada componente con
entidad propia lleva su `data-component` y se registra aquí.

> Todavía vacío en la práctica: el dashboard actual (`app/`) se creó antes
> de esta convención y aún no lleva `data-component`. Se irán registrando
> al migrar cada vista a la estructura y convención de componentes (ver
> [TODO.md](TODO.md)).

## Registro

| data-component | Ubicación | Descripción |
|---|---|---|
| _(pendiente)_ | — | — |

## Cómo registrar uno

1. Añadir `data-component="nombre-en-kebab-case"` al elemento raíz del
   componente.
2. Añadir una fila a la tabla con su ubicación (ruta del archivo) y una
   descripción de una línea.
