import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface PitMapsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  division_id: string; // UUID foreign key to divisions.id
  map_image_url: string; // URL to uploaded map image
  created_at: ColumnType<Date, never, never>; // Timestamp
  updated_at: Date; // Timestamp
}

export type PitMap = Selectable<PitMapsTable>;
export type InsertablePitMap = Insertable<PitMapsTable>;
export type UpdateablePitMap = Updateable<PitMapsTable>;
