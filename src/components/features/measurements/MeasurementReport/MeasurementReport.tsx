import Link from 'next/link';

import { getI18n } from '@/lib/i18n';
import { buildRecommendations, computeCost } from '@/lib/services/measurement';
import type { MeasurementResult } from '@/lib/services/measurement';
import { formatDateTime, formatUsd } from '@/lib/utils';

import { EchoIndexPanel } from '../EchoIndexPanel';
import { EngineBreakdown } from '../EngineBreakdown';
import { OnPageAudit } from '../OnPageAudit';
import { Prescription } from '../Prescription';
import { PromptLog } from '../PromptLog';
import { SourceAudit } from '../SourceAudit';
import { styles } from './MeasurementReport.styles';

interface MeasurementReportProps {
  result: MeasurementResult;
}

/** Boletín completo de una medición: cabecera, índice, registro y fuentes. */
export async function MeasurementReport({ result }: MeasurementReportProps) {
  const { locale, t } = await getI18n();
  const { file, report, audit } = result;
  const brand = file.config.brand;
  const register = t('common.register');
  const multiEngine = report.byEngine.length > 1;
  const recommendations = buildRecommendations(file, report, audit);

  // Numeración de registros según qué secciones se muestran.
  const pad = (n: number) => `${register} ${String(n).padStart(2, '0')}`;
  let section = 0;
  const engineReg = multiEngine ? pad(++section) : null;
  const prescriptionReg = recommendations.length ? pad(++section) : null;
  const onpageReg = audit ? pad(++section) : null;
  const promptReg = pad(++section);
  const sourceReg = pad(++section);

  // Coste de la medición: exacto donde el motor lo da, calculado donde no.
  // Si algún motor no sabemos cobrarlo, se dice en vez de fingir un total.
  const cost = computeCost(file);
  const unknownEngines = cost.byEngine
    .filter((e) => e.costUsd === null)
    .map((e) => e.engine)
    .join(', ');
  const costText = cost.hasUnknown
    ? t('runDetail.costPartial', {
        cost: formatUsd(cost.totalUsd, locale),
        engines: unknownEngines,
      })
    : t('runDetail.costSuffix', { cost: formatUsd(cost.totalUsd, locale) });

  const meta =
    t('runDetail.queries', {
      prompts: file.config.prompts.length,
      runs: file.config.runsPerPrompt,
      total: report.totalRuns,
    }) +
    (brand.domain ? t('runDetail.domainSuffix', { domain: brand.domain }) : '') +
    costText;

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
      {engineReg ? (
        <EngineBreakdown byEngine={report.byEngine} register={engineReg} />
      ) : null}
      {prescriptionReg ? (
        <Prescription recommendations={recommendations} register={prescriptionReg} />
      ) : null}
      {audit && onpageReg ? <OnPageAudit audit={audit} register={onpageReg} /> : null}
      <PromptLog report={report} register={promptReg} />
      <SourceAudit file={file} report={report} register={sourceReg} />
    </div>
  );
}
