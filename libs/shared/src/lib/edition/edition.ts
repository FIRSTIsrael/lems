export type Edition = 'founders' | 'future';

export const EDITIONS: readonly Edition[] = ['founders', 'future'];

export const DEFAULT_EDITION: Edition = 'founders';

/**
 * The only place that converts a division's edition boolean into an Edition.
 * Accepts both the DB shape (future_edition) and the API shape (futureEdition).
 * Anything missing or falsy resolves to 'founders'.
 */
export const getEdition = (division: {
  future_edition?: boolean | null;
  futureEdition?: boolean | null;
}): Edition => (division.future_edition || division.futureEdition ? 'future' : 'founders');

/** Parses an untrusted string (e.g. a URL query value) into an Edition, defaulting to 'founders'. */
export const parseEdition = (value: string | null | undefined): Edition =>
  EDITIONS.find(e => e === value) ?? DEFAULT_EDITION;
