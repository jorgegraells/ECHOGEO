// Clases del selector de idioma de la cabecera.
export const styles = {
  root: 'flex items-center gap-1',
  option: {
    // El idioma activo resalta en tinta plena; el inactivo queda apagado.
    active: 'text-ink',
    inactive: 'text-ink-soft transition-colors hover:text-ink disabled:opacity-50',
  },
  separator: 'text-ink-faint',
} as const;
