import { SectionHeading } from '@/components/ui';
import { getI18n } from '@/lib/i18n';
import type { OnPageAudit as Audit } from '@/lib/services/onpage';

import { styles } from './OnPageAudit.styles';

interface OnPageAuditProps {
  audit: Audit;
  register: string;
}

/** Marcador visual de cada gravedad. */
const MARKER = { critical: '✗', warning: '!', info: '·', ok: '✓' } as const;

/**
 * Auditoría de la web de la marca. Cada hallazgo declara su nivel de
 * evidencia, para que no se confunda un hecho documentado (los crawlers no
 * ejecutan JavaScript) con una correlación (la frescura).
 */
export async function OnPageAudit({ audit, register }: OnPageAuditProps) {
  const { t } = await getI18n();

  return (
    <section data-component="onpage-audit" className={styles.root}>
      <SectionHeading label={register} title={t('runDetail.onpage')} aside={audit.url} />
      <div className={styles.list}>
        {audit.findings.map((finding, i) => (
          <div key={`${finding.code}-${i}`} className={styles.item}>
            <span className={styles.marker[finding.severity]}>
              {MARKER[finding.severity]}
            </span>
            <div>
              <p className={styles.text}>{t(finding.code, finding.values)}</p>
              <p className={styles.meta}>{t(`onpage.evidence.${finding.evidence}`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
