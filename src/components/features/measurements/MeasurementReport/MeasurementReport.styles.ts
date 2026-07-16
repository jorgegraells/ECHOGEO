// Clases de la cabecera del boletín de una medición.
export const styles = {
  root: 'pt-10',
  crumb: 'kicker',
  crumbLink: 'hover:text-ink',
  title: 'mt-3 font-display text-5xl',
  meta: 'mt-2 font-mono text-xs text-ink-soft',
  failures: 'mt-4 flex flex-col gap-1',
  failure:
    'rounded-[2px] border border-l-2 border-ink-faint border-l-alarm bg-panel px-4 py-2 text-sm text-alarm',
} as const;
