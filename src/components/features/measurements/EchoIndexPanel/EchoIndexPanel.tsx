import { getI18n } from '@/lib/i18n';
import { formatNumber, formatPercent } from '@/lib/utils';
import type { Report } from '@/types';

import { styles } from './EchoIndexPanel.styles';

interface EchoIndexPanelProps {
  report: Report;
}

/** Índice de Eco compuesto y su desglose (presencia, cita, posición). */
export async function EchoIndexPanel({ report }: EchoIndexPanelProps) {
  const { locale, t } = await getI18n();

  const rows = [
    {
      key: 'presence',
      name: t('runDetail.metrics.presence'),
      hint: t('runDetail.metrics.presenceHint', { total: report.totalRuns }),
      value: report.presence,
      label: formatPercent(report.presence, locale),
    },
    {
      key: 'linkedCitation',
      name: t('runDetail.metrics.linkedCitation'),
      hint: t('runDetail.metrics.linkedCitationHint'),
      value: report.domainCited,
      label: formatPercent(report.domainCited, locale),
    },
    {
      key: 'position',
      name: t('runDetail.metrics.position'),
      hint: t('runDetail.metrics.positionHint'),
      value: report.positionScore,
      label: formatNumber(report.positionScore, locale, 2),
    },
  ];

  return (
    <section data-component="echo-index-panel" className={styles.root}>
      <figure className={styles.figure}>
        <div className={styles.bigNumber}>
          {formatNumber(report.index10, locale)}
          <span className={styles.bigUnit}>/ 10</span>
        </div>
        <figcaption className={styles.caption}>{t('runDetail.indexLabel')}</figcaption>
      </figure>
      <div>
        {rows.map((row) => (
          <div key={row.key} className={styles.row}>
            <span className={styles.rowName}>
              {row.name}
              <small className={styles.rowHint}>{row.hint}</small>
            </span>
            <span className={styles.track}>
              <span
                className={styles.fill}
                style={{ width: `${Math.round(row.value * 100)}%` }}
              />
            </span>
            <span className={styles.value}>{row.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
