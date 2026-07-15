// Clases de la auditoría de fuentes citadas, estilo bibliografía.
export const styles = {
  root: 'mt-16',
  panel: 'rounded-[2px] border border-l-2 border-ink-faint border-l-alarm bg-panel',
  empty: 'p-6 text-ink-soft',
  row: 'grid grid-cols-[44px_minmax(0,1fr)_auto_auto] items-baseline gap-4 border-b border-ink-faint px-5 py-3 last:border-b-0',
  index: 'font-mono text-xs text-ink-soft',
  host: 'truncate font-medium',
  count: 'font-mono text-xs text-ink-soft',
  ownBadge:
    'rounded-[2px] border border-signal px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.12em] text-signal uppercase',
  otherBadge: 'font-mono text-[10px] text-ink-faint',
} as const;
