import { PgPoint, formatPoint } from '@lems/database';
import { Coordinates, CoordinatesSchema } from '@lems/types/api/coordinates';

export const pointToCoordinates = (point: PgPoint | null): Coordinates | null =>
  point ? { latitude: point.y, longitude: point.x } : null;

/**
 * Parses request input into a Postgres point literal.
 * Returns `null` to clear the value, or `undefined` if the input is invalid.
 */
export const coordinatesToPointLiteral = (value: unknown): string | null | undefined => {
  if (value === null) return null;
  const result = CoordinatesSchema.safeParse(value);
  if (!result.success) return undefined;
  return formatPoint({ x: result.data.longitude, y: result.data.latitude });
};
