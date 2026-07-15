// Fachada de las integraciones con motores de IA.
export { createPerplexityAdapter } from './perplexity';
export { createOpenAIAdapter } from './openai';
export { createGeminiAdapter } from './gemini';
export { createMockAdapter } from './mock';
export {
  EngineRequestError,
  EngineResponseError,
  IntegrationError,
} from './integration.errors';
