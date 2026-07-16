// Clases de la auditoría on-page. La gravedad se codifica en el marcador y
// en el color, para que se lea de un vistazo.
export const styles = {
  root: 'mt-16',
  list: 'border-t border-ink-faint',
  item: 'grid grid-cols-[28px_minmax(0,1fr)] items-baseline gap-4 border-b border-ink-faint py-4',
  text: 'text-[15px]',
  meta: 'mt-1 font-mono text-[10px] tracking-[0.08em] text-ink-soft uppercase',
  marker: {
    critical: 'font-mono text-base text-alarm',
    warning: 'font-mono text-base text-alarm',
    info: 'font-mono text-base text-ink-soft',
    ok: 'font-mono text-base text-signal',
  },
} as const;
