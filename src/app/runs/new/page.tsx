import { MeasurementForm } from '@/components/features/measurements';
import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';

import { createMeasurement } from './actions';

export const dynamic = 'force-dynamic';

export default async function NewMeasurementPage() {
  const { t } = await getI18n();

  const labels = {
    intro: t('newMeasurement.intro'),
    brandLabel: t('newMeasurement.brandLabel'),
    brandPlaceholder: t('newMeasurement.brandPlaceholder'),
    domainLabel: t('newMeasurement.domainLabel'),
    domainPlaceholder: t('newMeasurement.domainPlaceholder'),
    domainHint: t('newMeasurement.domainHint'),
    aliasesLabel: t('newMeasurement.aliasesLabel'),
    aliasesHint: t('newMeasurement.aliasesHint'),
    competitorsLabel: t('newMeasurement.competitorsLabel'),
    competitorsHint: t('newMeasurement.competitorsHint'),
    promptsLabel: t('newMeasurement.promptsLabel'),
    promptsHint: t('newMeasurement.promptsHint'),
    runsLabel: t('newMeasurement.runsLabel'),
    runsHint: t('newMeasurement.runsHint'),
    engineLabel: t('newMeasurement.engineLabel'),
    engineMock: t('newMeasurement.engineMock'),
    enginePerplexity: t('newMeasurement.enginePerplexity'),
    realWarning: t('newMeasurement.realWarning'),
    submit: t('newMeasurement.submit'),
    submitting: t('newMeasurement.submitting'),
  };

  return (
    <div className="pt-10">
      <SectionHeading
        level={1}
        label={t('common.register')}
        title={t('newMeasurement.title')}
      />
      <MeasurementForm action={createMeasurement} labels={labels} />
    </div>
  );
}
