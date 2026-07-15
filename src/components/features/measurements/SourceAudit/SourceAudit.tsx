import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';
import type { MeasurementFile, Report } from '@/types';

import { aggregateSources, isOwnDomain, normalizeOwnDomain } from './SourceAudit.logic';
import { styles } from './SourceAudit.styles';

interface SourceAuditProps {
  file: MeasurementFile;
  report: Report;
  register: string;
}

/** Auditoría de fuentes: qué dominios cita el motor y si el propio aparece. */
export async function SourceAudit({ file, report, register }: SourceAuditProps) {
  const { t } = await getI18n();
  const sources = aggregateSources(file);
  const ownDomain = normalizeOwnDomain(file.config.brand.domain);

  return (
    <section data-component="source-audit" className={styles.root}>
      <SectionHeading
        label={register}
        title={t('runDetail.sources')}
        aside={t.plural('runDetail.sourcesCount', sources.length)}
      />
      <div className={styles.panel}>
        {sources.length === 0 ? (
          <p className={styles.empty}>{t('runDetail.sourcesEmpty')}</p>
        ) : (
          sources.map(({ host, count }, i) => (
            <div key={host} className={styles.row}>
              <span className={styles.index}>[{String(i + 1).padStart(2, '0')}]</span>
              <span className={styles.host}>{host}</span>
              <span className={styles.count}>
                {t('runDetail.sourceRuns', { count, total: report.totalRuns })}
              </span>
              {isOwnDomain(host, ownDomain) ? (
                <span className={styles.ownBadge}>{t('runDetail.ownDomain')}</span>
              ) : (
                <span className={styles.otherBadge}>—</span>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
