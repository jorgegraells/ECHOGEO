// Clases de la lista de mediciones del dashboard.
export const styles = {
  root: 'pt-10',
  empty: 'chart-paper rounded-[2px] border border-ink-faint p-10',
  emptyText: 'max-w-[42em] text-lg',
  emptyCommand: 'mt-4 font-mono text-sm text-ink-soft',
  list: 'border-t border-ink-faint',
  item: 'border-b border-ink-faint',
  link: 'grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-4 transition-colors hover:bg-panel-hover sm:grid-cols-[170px_minmax(0,1fr)_110px_90px_90px]',
  date: 'font-mono text-xs text-ink-soft',
  brand: 'text-lg font-medium',
  engine: 'kicker hidden sm:inline',
  presence: 'kicker hidden sm:inline',
  index: 'text-right font-display text-2xl tabular-nums',
  indexUnit: 'font-mono text-[10px] text-ink-soft',
} as const;
