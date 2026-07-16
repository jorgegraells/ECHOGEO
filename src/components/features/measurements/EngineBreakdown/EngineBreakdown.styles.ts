// Clases del desglose del Índice de Eco por motor.
export const styles = {
  root: 'mt-16',
  list: 'border-t border-ink-faint',
  row: 'grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-4 border-b border-ink-faint py-4',
  engine: 'text-lg font-medium',
  detail: 'font-mono text-xs text-ink-soft',
  index: 'font-display text-3xl tabular-nums',
  indexUnit: 'font-mono text-[10px] text-ink-soft',
} as const;
