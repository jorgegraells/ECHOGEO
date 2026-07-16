// API pública del servicio de medición. El resto de la app importa desde
// aquí, nunca de los archivos internos.
export {
  getMeasurement,
  listMeasurements,
  rescoreMeasurement,
  runMeasurement,
} from './measurement.service';
export { scoreMeasurement } from './measurement.scoring';
export { buildRecommendations } from './measurement.recommendations';
export { computeCost } from './measurement.cost';
export type { CostBasis, EngineCost, MeasurementCost } from './measurement.cost';
export {
  measurementConfigSchema,
  measurementFileSchema,
  parseMeasurementConfig,
  parseMeasurementFile,
} from './measurement.validation';
export {
  EngineNotConfiguredError,
  InvalidConfigError,
  MeasurementError,
  MeasurementNotFoundError,
  UnknownEngineError,
} from './measurement.errors';
export type {
  MeasurementProgress,
  MeasurementResult,
  RunMeasurementOptions,
} from './measurement.types';
