'use client';

import { useActionState, useState } from 'react';

import { countPrompts, fillTemplate } from './MeasurementForm.logic';
import { styles } from './MeasurementForm.styles';
import type {
  CreateMeasurementAction,
  CreateMeasurementState,
  MeasurementFormLabels,
  MeasurementSizeOption,
} from './MeasurementForm.types';

interface MeasurementFormProps {
  action: CreateMeasurementAction;
  labels: MeasurementFormLabels;
  sizes: MeasurementSizeOption[];
}

const initialState: CreateMeasurementState = { status: 'idle' };

/**
 * Formulario para definir y lanzar una medición desde la web. Los motores no
 * se eligen (van los tres, que es lo que se cobra) ni hay modo simulado: eso
 * es una herramienta de desarrollo, no de producto.
 */
export function MeasurementForm({ action, labels, sizes }: MeasurementFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [sizeId, setSizeId] = useState(sizes[0]?.id ?? '');
  const [promptsText, setPromptsText] = useState('');

  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const maxPrompts = size?.maxPrompts ?? 0;
  const promptCount = countPrompts(promptsText);
  const overLimit = promptCount > maxPrompts;

  return (
    <form action={formAction} data-component="measurement-form" className={styles.form}>
      <p className={styles.intro}>{labels.intro}</p>

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          {labels.brandLabel}
        </label>
        <input
          id="name"
          name="name"
          required
          placeholder={labels.brandPlaceholder}
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="domain" className={styles.label}>
            {labels.domainLabel}
          </label>
          <input
            id="domain"
            name="domain"
            placeholder={labels.domainPlaceholder}
            className={styles.input}
          />
          <span className={styles.hint}>{labels.domainHint}</span>
        </div>
        <div className={styles.field}>
          <label htmlFor="aliases" className={styles.label}>
            {labels.aliasesLabel}
          </label>
          <input id="aliases" name="aliases" className={styles.input} />
          <span className={styles.hint}>{labels.aliasesHint}</span>
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="competitors" className={styles.label}>
          {labels.competitorsLabel}
        </label>
        <textarea id="competitors" name="competitors" className={styles.textarea} />
        <span className={styles.hint}>{labels.competitorsHint}</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="size" className={styles.label}>
          {labels.sizeLabel}
        </label>
        <select
          id="size"
          name="size"
          value={sizeId}
          onChange={(e) => setSizeId(e.target.value)}
          className={styles.input}
        >
          {sizes.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={styles.hint}>{labels.sizeHint}</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="prompts" className={styles.label}>
          {labels.promptsLabel}
        </label>
        {/* Controlado: si el navegador restaura el formulario, el contador
            no puede quedarse desincronizado con lo que se ve escrito. */}
        <textarea
          id="prompts"
          name="prompts"
          required
          value={promptsText}
          onChange={(e) => setPromptsText(e.target.value)}
          className={styles.textarea}
        />
        <span className={styles.hint}>{labels.promptsHint}</span>
        <span className={overLimit ? styles.warning : styles.hint}>
          {fillTemplate(overLimit ? labels.promptsOverLimit : labels.promptsCount, {
            count: promptCount,
            max: maxPrompts,
          })}
        </span>
      </div>

      <p className={styles.warning}>{labels.realWarning}</p>

      {state.status === 'error' ? <p className={styles.error}>{state.message}</p> : null}

      <button type="submit" disabled={pending || overLimit} className={styles.submit}>
        {pending ? labels.submitting : labels.submit}
      </button>
    </form>
  );
}
