import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { Report } from '@/types';

import { dotClassName, dotContent, dotTooltip } from './PromptLog.logic';
import { styles } from './PromptLog.styles';

interface PromptLogProps {
  report: Report;
  register: string;
}

/** Registro por prompt: métricas y el estado de cada pasada. */
export async function PromptLog({ report, register }: PromptLogProps) {
  const { locale, t } = await getI18n();

  return (
    <section data-component="prompt-log" className={styles.root}>
      <SectionHeading
        label={register}
        title={t('runDetail.byPrompt')}
        aside={t('runDetail.legend')}
        asideOnlyDesktop
      />
      <ol className={styles.list}>
        {report.prompts.map((prompt) => {
          const scores = report.runScores.filter(
            (s) => s.promptIndex === prompt.promptIndex,
          );
          const position =
            prompt.avgPosition === null
              ? t('runDetail.notPresent')
              : t('runDetail.avgPosition', {
                  value: formatNumber(prompt.avgPosition, locale),
                });
          return (
            <li key={prompt.promptIndex} className={styles.item}>
              <div>
                <p className={styles.prompt}>«{prompt.prompt}»</p>
                <p className={styles.summary}>
                  {t('runDetail.promptSummary', {
                    presence: formatPercent(prompt.presence, locale),
                    citation: formatPercent(prompt.domainCited, locale),
                    position,
                  })}
                </p>
              </div>
              <div className={styles.dots}>
                {scores.map((score) => (
                  <span
                    key={score.runIndex}
                    title={dotTooltip(score, t)}
                    className={dotClassName(score)}
                  >
                    {dotContent(score)}
                  </span>
                ))}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
