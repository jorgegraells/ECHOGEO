// Clases de la prescripción: lista numerada de acciones priorizadas.
export const styles = {
  root: 'mt-16',
  list: 'flex flex-col border-t border-ink-faint',
  item: 'grid grid-cols-[52px_minmax(0,1fr)] items-baseline gap-4 border-b border-ink-faint py-5',
  number: 'font-display text-3xl leading-none text-alarm',
  text: 'text-[17px]',
} as const;
