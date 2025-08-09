import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface EventUserDivisionsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  user_id: string; // UUID foreign key to event_users.id
  division_id: string; // UUID foreign key to divisions.id
}

export type EventUserDivision = Selectable<EventUserDivisionsTable>;
export type InsertableEventUserDivision = Insertable<EventUserDivisionsTable>;
export type UpdateableEventUserDivision = Updateable<EventUserDivisionsTable>;
