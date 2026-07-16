/** Fuerza de la evidencia que respalda un check. Se muestra en la UI para
 * que nadie confunda un hecho documentado con una correlación. */
export type Evidence = 'strong' | 'moderate';

/**
 * Gravedad de un hallazgo:
 * - `critical`: impide que las IAs te citen (o te lean).
 * - `warning`: mejorable, con evidencia razonable.
 * - `info`: dato de contexto, no es un fallo.
 * - `ok`: comprobado y correcto.
 */
export type FindingSeverity = 'critical' | 'warning' | 'info' | 'ok';

/** Hallazgo de un check. `code` es la clave i18n; `values` interpola datos. */
export interface Finding {
  code: string;
  severity: FindingSeverity;
  evidence: Evidence;
  values: Record<string, string | number>;
}

/** Resultado completo de auditar una web. */
export interface OnPageAudit {
  url: string;
  fetchedAt: string;
  findings: Finding[];
}
