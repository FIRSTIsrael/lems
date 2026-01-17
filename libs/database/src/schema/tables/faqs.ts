import { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export interface FaqsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  season_id: string; // UUID foreign key to seasons.id
  question: string;
  answer: string;
  display_order: number;
  created_at: ColumnType<Date, never, never>; // Generated on insert
  updated_at: ColumnType<Date, never, Date>; // Updated on modification
}

export type Faq = Selectable<FaqsTable>;
export type InsertableFaq = Insertable<FaqsTable>;
export type UpdateableFaq = Updateable<FaqsTable>;
