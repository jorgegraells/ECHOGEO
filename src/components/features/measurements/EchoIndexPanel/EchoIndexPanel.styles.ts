// Clases del panel del Índice de Eco y su desglose de métricas.
export const styles = {
  root: 'mt-12 grid gap-10 border-t border-ink pt-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]',
  figure: 'm-0',
  bigNumber:
    'flex items-baseline gap-2 font-display text-[7rem] leading-none tabular-nums',
  bigUnit: 'font-mono text-sm tracking-[0.08em] text-ink-soft',
  caption: 'kicker mt-4',
  row: 'grid grid-cols-[minmax(110px,180px)_1fr_70px] items-center gap-4 border-b border-ink-faint py-3.5 first:border-t',
  rowName: 'text-[15px] font-medium',
  rowHint: 'block text-xs font-normal text-ink-soft',
  track:
    'relative h-[7px] rounded-[1px] bg-[repeating-linear-gradient(90deg,var(--color-ink-faint)_0_1px,transparent_1px_9px)]',
  fill: 'absolute inset-y-0 left-0 rounded-[1px] bg-signal',
  value: 'text-right font-mono text-[13px] tabular-nums',
} as const;
