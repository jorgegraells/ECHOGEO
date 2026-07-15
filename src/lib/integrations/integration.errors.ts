/**
 * Errores tipados de las integraciones con motores de IA. Cada uno lleva
 * un `code` estable para poder distinguirlos sin comparar mensajes.
 */

/** Error base de una integración. Nunca se lanza directamente. */
export abstract class IntegrationError extends Error {
  abstract readonly code: string;
}

/** La llamada HTTP al motor de IA falló (status no-OK o red caída). */
export class EngineRequestError extends IntegrationError {
  readonly code = 'ENGINE_REQUEST_FAILED';

  constructor(
    readonly engine: string,
    readonly status: number | null,
    detail: string,
  ) {
    super(`El motor ${engine} falló (${status ?? 'sin respuesta'}): ${detail}`);
    this.name = 'EngineRequestError';
  }
}

/** La respuesta del motor no tiene la forma esperada. */
export class EngineResponseError extends IntegrationError {
  readonly code = 'ENGINE_RESPONSE_INVALID';

  constructor(
    readonly engine: string,
    detail: string,
  ) {
    super(`Respuesta inesperada del motor ${engine}: ${detail}`);
    this.name = 'EngineResponseError';
  }
}
