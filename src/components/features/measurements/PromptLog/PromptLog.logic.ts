import type { Translator } from '@/lib/i18n';
import type { RunScore } from '@/types';

import { styles } from './PromptLog.styles';

/** Clase del marcador de una pasada según si hay mención y cita. */
export function dotClassName(score: RunScore): string {
  if (score.mentioned && score.domainCited) return `${styles.dot} ${styles.dotCited}`;
  if (score.mentioned) return `${styles.dot} ${styles.dotMention}`;
  return `${styles.dot} ${styles.dotAbsent}`;
}

/** Contenido del marcador: la posición, o × si no aparece. */
export function dotContent(score: RunScore): string {
  if (!score.mentioned) return '×';
  return score.position === null ? '·' : String(score.position);
}

/** Tooltip descriptivo de una pasada, ya traducido. */
export function dotTooltip(score: RunScore, t: Translator): string {
  let detail: string;
  if (!score.mentioned) {
    detail = t('runDetail.runAbsent');
  } else if (score.domainCited) {
    detail = t('runDetail.runCited', { position: score.position ?? '·' });
  } else {
    detail = t('runDetail.runMention', { position: score.position ?? '·' });
  }
  return t('runDetail.runTooltip', { n: score.runIndex + 1, detail });
}
