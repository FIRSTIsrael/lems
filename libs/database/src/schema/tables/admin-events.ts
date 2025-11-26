import { ColumnType, Insertable, Selectable, Updateable } from 'kysely';

export interface AdminEventsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  admin_id: string; // UUID foreign key to admins.id
  event_id: string; // UUID foreign key to events.id
  assigned_at: ColumnType<Date, never, never>; // Generated on insert
}

export type AdminEvent = Selectable<AdminEventsTable>;
export type InsertableAdminEvent = Insertable<AdminEventsTable>;
export type UpdateableAdminEvent = Updateable<AdminEventsTable>;
