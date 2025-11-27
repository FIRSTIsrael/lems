import { ColumnType, Insertable, Selectable, Updateable, Generated } from 'kysely';

export interface EventSettingsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  event_id: string; // UUID foreign key to events.id
  visible: Generated<boolean>;
  official: Generated<boolean>;
  completed: Generated<boolean>;
  published: Generated<boolean>;
  advancement_percent: Generated<number>; // Float between 0 and 1
}

export type EventSettings = Selectable<EventSettingsTable>;
export type InsertableEventSettings = Insertable<EventSettingsTable>;
export type UpdateableEventSettings = Updateable<EventSettingsTable>;
