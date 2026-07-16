// API pública del servicio de auditoría on-page.
export { auditDomain } from './onpage.service';
export { AI_BOTS, CITATION_BOTS, type AiBot, type BotTier } from './onpage.bots';
export { FetchFailedError, InvalidDomainError, OnPageError } from './onpage.errors';
export { isAllowed, parseRobots } from './onpage.robots';
export type { Evidence, Finding, FindingSeverity, OnPageAudit } from './onpage.types';
