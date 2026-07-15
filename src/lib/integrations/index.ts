// Fachada de las integraciones con motores de IA.
export { createPerplexityAdapter } from './perplexity';
export { createMockAdapter } from './mock';
export {
  EngineRequestError,
  EngineResponseError,
  IntegrationError,
} from './integration.errors';
