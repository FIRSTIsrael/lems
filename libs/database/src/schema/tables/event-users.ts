import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface EventUsersTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  id: ColumnType<string, never, never>; // UUID, generated
  event_id: string; // UUID foreign key to events.id
  role: string;
  identifier: string | null;
  role_info: Record<string, unknown> | null; // JSON field for role configuration
  password: string; // VARCHAR(4) random string
}

export type EventUser = Selectable<EventUsersTable>;
export type InsertableEventUser = Insertable<EventUsersTable>;
export type UpdateableEventUser = Updateable<EventUsersTable>;
