import { Coordinates } from '@lems/types/api/coordinates';

export const toCoordinates = (row: {
  latitude: number | null;
  longitude: number | null;
}): Coordinates | null =>
  row.latitude !== null && row.longitude !== null
    ? { latitude: row.latitude, longitude: row.longitude }
    : null;
