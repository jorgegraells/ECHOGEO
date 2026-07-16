/** Tamaño ofrecido en el formulario, ya con su etiqueta traducida. */
export interface MeasurementSizeOption {
  id: string;
  maxPrompts: number;
  label: string;
}

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
  /** Plantillas con {count} y {max}: se interpolan en el cliente. */
  promptsCount: string;
  promptsOverLimit: string;
  sizeLabel: string;
  sizeHint: string;
  enginesLabel: string;
  enginesHint: string;
  mockLabel: string;
  mockHint: string;
  realWarning: string;
  submit: string;
  submitting: string;
}
