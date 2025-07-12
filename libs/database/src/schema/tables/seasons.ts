import { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export interface SeasonsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  slug: string;
  name: string;
  start_date: Date;
  end_date: Date;
  logo_url: string | null;
}

export type Season = Selectable<SeasonsTable>;
export type InsertableSeason = Insertable<SeasonsTable>;
export type UpdateableSeason = Updateable<SeasonsTable>;
