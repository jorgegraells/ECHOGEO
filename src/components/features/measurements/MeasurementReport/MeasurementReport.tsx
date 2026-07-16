import Link from 'next/link';

import { getI18n } from '@/lib/i18n';
import type { MeasurementResult } from '@/lib/services/measurement';
import { formatDateTime } from '@/lib/utils';

import { EchoIndexPanel } from '../EchoIndexPanel';
import { PromptLog } from '../PromptLog';
import { SourceAudit } from '../SourceAudit';
import { styles } from './MeasurementReport.styles';

interface MeasurementReportProps {
  result: MeasurementResult;
}

/** Boletín completo de una medición: cabecera, índice, registro y fuentes. */
export async function MeasurementReport({ result }: MeasurementReportProps) {
  const { locale, t } = await getI18n();
  const { file, report } = result;
  const brand = file.config.brand;
  const register = t('common.register');

  const meta =
    t('runDetail.queries', {
      prompts: file.config.prompts.length,
      runs: file.config.runsPerPrompt,
      total: report.totalRuns,
    }) + (brand.domain ? t('runDetail.domainSuffix', { domain: brand.domain }) : '');

  return (
    <div data-component="measurement-report" className={styles.root}>
      <p className={styles.crumb}>
        <Link href="/" className={styles.crumbLink}>
          {t('common.nav')}
        </Link>{' '}
        ·{' '}
        {t('runDetail.crumb', {
          date: formatDateTime(file.createdAt, locale),
          engine: report.engines.join(' · '),
        })}
      </p>
      <h1 className={styles.title}>{brand.name}</h1>
      <p className={styles.meta}>{meta}</p>

      <EchoIndexPanel report={report} />
      <PromptLog report={report} register={`${register} 01`} />
      <SourceAudit file={file} report={report} register={`${register} 02`} />
    </div>
  );
}
