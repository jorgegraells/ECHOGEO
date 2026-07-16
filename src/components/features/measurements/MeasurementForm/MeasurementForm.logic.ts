/** Cuenta las preguntas escritas: una por línea, sin contar las vacías. */
export function countPrompts(text: string): number {
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

/**
 * Interpola {marcadores} en el cliente. El i18n vive en el servidor, así que
 * aquí llegan las plantillas ya traducidas y solo hay que rellenarlas.
 */
export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in values ? String(values[key]) : `{${key}}`,
  );
}
