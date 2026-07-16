import { MeasurementForm } from '@/components/features/measurements';
import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';
import { MEASUREMENT_SIZES } from '@/lib/services/measurement';

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
    // Plantillas: el contador se interpola en el cliente según se escribe.
    promptsCount: t('newMeasurement.promptsCount'),
    promptsOverLimit: t('newMeasurement.promptsOverLimit'),
    sizeLabel: t('newMeasurement.sizeLabel'),
    sizeHint: t('newMeasurement.sizeHint', {
      runs: MEASUREMENT_SIZES.basic.runsPerPrompt,
    }),
    realWarning: t('newMeasurement.realWarning'),
    submit: t('newMeasurement.submit'),
    submitting: t('newMeasurement.submitting'),
  };

  // Los tamaños salen del servicio: la UI no inventa límites.
  const sizes = [
    { size: MEASUREMENT_SIZES.basic, key: 'sizeBasic' },
    { size: MEASUREMENT_SIZES.medium, key: 'sizeMedium' },
    { size: MEASUREMENT_SIZES.full, key: 'sizeFull' },
  ].map(({ size, key }) => ({
    id: size.id,
    maxPrompts: size.maxPrompts,
    label: t(`newMeasurement.${key}`, { max: size.maxPrompts }),
  }));

  return (
    <div className="pt-10">
      <SectionHeading
        level={1}
        label={t('common.register')}
        title={t('newMeasurement.title')}
      />
      <MeasurementForm action={createMeasurement} labels={labels} sizes={sizes} />
    </div>
  );
}
