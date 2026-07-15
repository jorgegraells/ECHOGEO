// Clases del registro por prompt y los marcadores de cada pasada.
export const styles = {
  root: 'mt-16',
  list: 'border-t border-ink-faint',
  item: 'grid gap-x-8 gap-y-2 border-b border-ink-faint py-5 md:grid-cols-[minmax(0,1fr)_260px]',
  prompt: 'text-[17px]',
  summary: 'mt-1 font-mono text-xs text-ink-soft',
  dots: 'flex items-center gap-2 md:justify-end',
  dot: 'flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[11px]',
  dotCited: 'border-signal bg-signal text-paper',
  dotMention: 'border-ink text-ink',
  dotAbsent: 'border-alarm text-alarm',
} as const;
