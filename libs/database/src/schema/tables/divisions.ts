import { ColumnType, Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface DivisionsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  name: string;
  event_id: string; // UUID foreign key to events.id
  color: string;
  pit_map_url: string | null;
  has_schedule: Generated<boolean>; // Default false
  has_awards: Generated<boolean>; // Default false
  stagger_matches: Generated<boolean>; // Default false
}

export type Division = Selectable<DivisionsTable>;
export type InsertableDivision = Insertable<DivisionsTable>;
export type UpdateableDivision = Updateable<DivisionsTable>;
