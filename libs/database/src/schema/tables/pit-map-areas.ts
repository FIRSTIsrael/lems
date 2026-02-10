import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface PitMapAreasTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  pit_map_id: string; // UUID foreign key to pit_maps.id
  name: string; // Area name (e.g., "North Section", "Area A")
  coordinates: string; // JSON string storing polygon coordinates [{x, y}, ...]
  max_teams: number; // Maximum number of teams in this area
  division_id: string | null; // Optional: specific division for this area
  created_at: ColumnType<Date, never, never>; // Timestamp
}

export type PitMapArea = Selectable<PitMapAreasTable>;
export type InsertablePitMapArea = Insertable<PitMapAreasTable>;
export type UpdateablePitMapArea = Updateable<PitMapAreasTable>;
