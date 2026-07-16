import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';
import type { Recommendation } from '@/types';

import { formatValues } from './Prescription.logic';
import { styles } from './Prescription.styles';

interface PrescriptionProps {
  recommendations: Recommendation[];
  register: string;
}

/** Acciones concretas para mejorar la visibilidad, priorizadas. */
export async function Prescription({ recommendations, register }: PrescriptionProps) {
  const { locale, t } = await getI18n();

  return (
    <section data-component="prescription" className={styles.root}>
      <SectionHeading label={register} title={t('runDetail.prescription')} />
      <ol className={styles.list}>
        {recommendations.map((rec, i) => (
          <li key={rec.code + i} className={styles.item}>
            <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
            <p className={styles.text}>{t(rec.code, formatValues(rec.values, locale))}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
