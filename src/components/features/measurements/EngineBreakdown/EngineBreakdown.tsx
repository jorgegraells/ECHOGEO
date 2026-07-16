import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { EngineReport } from '@/types';

import { styles } from './EngineBreakdown.styles';

interface EngineBreakdownProps {
  byEngine: EngineReport[];
  register: string;
}

/** Desglose del Índice de Eco por motor: dónde sale citada la marca y dónde no. */
export async function EngineBreakdown({ byEngine, register }: EngineBreakdownProps) {
  const { locale, t } = await getI18n();

  return (
    <section data-component="engine-breakdown" className={styles.root}>
      <SectionHeading label={register} title={t('runDetail.byEngine')} />
      <div className={styles.list}>
        {byEngine.map((engine) => (
          <div key={engine.engine} className={styles.row}>
            <div>
              <p className={styles.engine}>{engine.engine}</p>
              <p className={styles.detail}>
                {t('runDetail.engineRow', {
                  index: formatNumber(engine.index10, locale),
                  presence: formatPercent(engine.presence, locale),
                  citation: formatPercent(engine.domainCited, locale),
                })}
              </p>
            </div>
            <span className={styles.index}>
              {formatNumber(engine.index10, locale)}
              <span className={styles.indexUnit}> {t('measurements.outOfTen')}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
