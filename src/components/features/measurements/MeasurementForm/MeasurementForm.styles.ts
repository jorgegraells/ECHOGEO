// Clases del formulario de nueva medición.
export const styles = {
  form: 'mt-8 flex max-w-[640px] flex-col gap-6',
  intro: 'text-lg text-ink-soft',
  field: 'flex flex-col gap-1.5',
  label: 'font-mono text-[11px] font-medium tracking-[0.12em] text-ink uppercase',
  hint: 'text-xs text-ink-soft',
  input:
    'rounded-[2px] border border-ink-faint bg-panel px-3 py-2 font-body text-ink outline-none focus-visible:border-signal',
  textarea:
    'min-h-24 rounded-[2px] border border-ink-faint bg-panel px-3 py-2 font-body text-ink outline-none focus-visible:border-signal',
  row: 'grid gap-6 sm:grid-cols-2',
  engines: 'flex flex-wrap gap-x-6 gap-y-2',
  engineOption: 'flex items-center gap-2 text-[15px]',
  checkbox: 'h-4 w-4 accent-[var(--color-signal)]',
  mockRow: 'flex w-fit items-center gap-2 text-[15px]',
  warning: 'font-mono text-xs text-alarm',
  error:
    'rounded-[2px] border border-l-2 border-ink-faint border-l-alarm bg-panel px-4 py-3 text-alarm',
  submit:
    'w-fit rounded-[2px] border-[1.5px] border-ink bg-ink px-6 py-3 font-mono text-xs font-medium tracking-[0.12em] text-paper uppercase transition-colors hover:bg-signal hover:border-signal disabled:opacity-50',
} as const;
