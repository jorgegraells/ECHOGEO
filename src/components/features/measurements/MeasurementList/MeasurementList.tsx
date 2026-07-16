import Link from 'next/link';

import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';
import type { MeasurementResult } from '@/lib/services/measurement';
import { formatDateTime, formatNumber, formatPercent } from '@/lib/utils';

import { styles } from './MeasurementList.styles';

interface MeasurementListProps {
  items: MeasurementResult[];
}

/** Lista de todas las mediciones guardadas, con su Índice de Eco. */
export async function MeasurementList({ items }: MeasurementListProps) {
  const { locale, t } = await getI18n();

  return (
    <div data-component="measurement-list" className={styles.root}>
      <SectionHeading
        level={1}
        label={t('common.register')}
        title={t('measurements.title')}
        aside={t.plural('measurements.count', items.length)}
      />

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{t('measurements.empty')}</p>
          <pre className={styles.emptyCommand}>npm run measure</pre>
        </div>
      ) : (
        <ul className={styles.list}>
          {items.map(({ id, file, report }) => (
            <li key={id} className={styles.item}>
              <Link href={`/runs/${id}`} className={styles.link}>
                <span className={styles.date}>
                  {formatDateTime(file.createdAt, locale)}
                </span>
                <span className={styles.brand}>{file.config.brand.name}</span>
                <span className={styles.engine}>{report.engines.join(' · ')}</span>
                <span className={styles.presence}>
                  {t('measurements.presence', {
                    value: formatPercent(report.presence, locale),
                  })}
                </span>
                <span className={styles.index}>
                  {formatNumber(report.index10, locale)}
                  <span className={styles.indexUnit}> {t('measurements.outOfTen')}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
