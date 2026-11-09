/**
 * Suggests names for the next table pair by continuing the numeric suffix of
 * the last table name (numeric-aware sort). Returns empty names when no
 * pattern can be inferred.
 */
export const suggestPairNames = (tables: { name: string }[]): [string, string] => {
  if (tables.length === 0) return ['', ''];

  const sorted = [...tables].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true })
  );
  const match = sorted[sorted.length - 1].name.match(/^(.*?)(\d+)$/);
  if (!match) return ['', ''];

  const [, prefix, digits] = match;
  const n = parseInt(digits, 10);
  return [`${prefix}${n + 1}`, `${prefix}${n + 2}`];
};
