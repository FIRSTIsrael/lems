import type { Edition } from '@lems/shared/edition';

/**
 * Returns `<edition>.<id>` when the namespace has an edition-specific override for `id`,
 * otherwise `id`. Founders never uses overrides.
 */
export const resolveEditionKey = (
  has: (key: string) => boolean,
  edition: Edition,
  id: string
): string => {
  const editionKey = `${edition}.${id}`;
  return edition !== 'founders' && has(editionKey) ? editionKey : id;
};
