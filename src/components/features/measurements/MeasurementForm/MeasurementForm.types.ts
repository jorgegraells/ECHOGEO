/** Estado del formulario devuelto por la Server Action. */
export type CreateMeasurementState =
  { status: 'idle' } | { status: 'error'; message: string };

/** Firma de la Server Action que crea una medición. */
export type CreateMeasurementAction = (
  state: CreateMeasurementState,
  formData: FormData,
) => Promise<CreateMeasurementState>;

/** Textos del formulario, ya traducidos en el servidor. */
export interface MeasurementFormLabels {
  intro: string;
  brandLabel: string;
  brandPlaceholder: string;
  domainLabel: string;
  domainPlaceholder: string;
  domainHint: string;
  aliasesLabel: string;
  aliasesHint: string;
  competitorsLabel: string;
  competitorsHint: string;
  promptsLabel: string;
  promptsHint: string;
  runsLabel: string;
  runsHint: string;
  engineLabel: string;
  engineMock: string;
  enginePerplexity: string;
  engineOpenai: string;
  engineGemini: string;
  realWarning: string;
  submit: string;
  submitting: string;
}
