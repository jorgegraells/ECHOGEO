/** Errores tipados de la auditoría on-page, con `code` estable. */

export abstract class OnPageError extends Error {
  abstract readonly code: string;
}

/** El dominio de la marca no es utilizable como URL. */
export class InvalidDomainError extends OnPageError {
  readonly code = 'ONPAGE_DOMAIN_INVALID';

  constructor(readonly domain: string) {
    super(`Dominio inválido: ${domain}`);
    this.name = 'InvalidDomainError';
  }
}

/** No se pudo descargar la web (red caída, timeout, status no-OK). */
export class FetchFailedError extends OnPageError {
  readonly code = 'ONPAGE_FETCH_FAILED';

  constructor(
    readonly url: string,
    readonly status: number | null,
    detail: string,
  ) {
    super(`No se pudo descargar ${url} (${status ?? 'sin respuesta'}): ${detail}`);
    this.name = 'FetchFailedError';
  }
}
