/**
 * PostgreSQL native `point` value, as parsed by `pg` (x = longitude, y = latitude).
 */
export interface PgPoint {
  x: number;
  y: number;
}

/**
 * Parses a PostgreSQL `point` value, either already parsed by `pg` or in its text form `(x,y)`.
 */
export const parsePoint = (value: PgPoint | string | null | undefined): PgPoint | null => {
  if (!value) return null;
  if (typeof value !== 'string') return value;

  const match = value.match(/^\(([^,()]+),([^,()]+)\)$/);
  if (!match) return null;

  const x = Number(match[1]);
  const y = Number(match[2]);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
};

/**
 * Formats a point as a PostgreSQL `point` literal, suitable for inserts and updates.
 */
export const formatPoint = (point: PgPoint): string => `(${point.x},${point.y})`;
