/**
 * Errores tipados del servicio de medición. Cada uno lleva un `code`
 * estable para distinguirlos sin comparar mensajes.
 */

/** Error base del servicio de medición. Nunca se lanza directamente. */
export abstract class MeasurementError extends Error {
  abstract readonly code: string;
}

/** La configuración de la medición no es válida. */
export class InvalidConfigError extends MeasurementError {
  readonly code = 'MEASUREMENT_CONFIG_INVALID';

  constructor(detail: string) {
    super(`Configuración de medición inválida: ${detail}`);
    this.name = 'InvalidConfigError';
  }
}

/** Se pidió un motor que no tiene integración registrada. */
export class UnknownEngineError extends MeasurementError {
  readonly code = 'MEASUREMENT_ENGINE_UNKNOWN';

  constructor(readonly engine: string) {
    super(`Motor de IA desconocido: ${engine}`);
    this.name = 'UnknownEngineError';
  }
}

/** El motor requiere una clave de API que no está en el entorno. */
export class EngineNotConfiguredError extends MeasurementError {
  readonly code = 'MEASUREMENT_ENGINE_NOT_CONFIGURED';

  constructor(
    readonly engine: string,
    detail: string,
  ) {
    super(`El motor ${engine} no está configurado: ${detail}`);
    this.name = 'EngineNotConfiguredError';
  }
}

/** Ningún motor pudo responder: no hay medición que guardar. */
export class AllEnginesFailedError extends MeasurementError {
  readonly code = 'MEASUREMENT_ALL_ENGINES_FAILED';

  constructor(readonly engines: string[]) {
    super(`Ningún motor pudo responder (${engines.join(', ')})`);
    this.name = 'AllEnginesFailedError';
  }
}

/** No existe una medición guardada con ese identificador. */
export class MeasurementNotFoundError extends MeasurementError {
  readonly code = 'MEASUREMENT_NOT_FOUND';

  constructor(readonly id: string) {
    super(`No se encontró la medición: ${id}`);
    this.name = 'MeasurementNotFoundError';
  }
}
