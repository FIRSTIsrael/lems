import { ColumnType, Insertable, Selectable, Updateable, Generated } from 'kysely';

export interface EventIntegrationsTable {
  pk: ColumnType<number, never, never>; // Serial primary key
  event_id: string; // UUID foreign key to events.id
  integration_type: string; // Type of integration (e.g., 'first-israel-dashboard')
  enabled: Generated<boolean>; // Whether the integration is enabled
  settings: Record<string, unknown>; // JSONB settings object
  created_at: Generated<Date>;
  updated_at: Generated<Date>;
}

export type EventIntegration = Selectable<EventIntegrationsTable>;
export type InsertableEventIntegration = Insertable<EventIntegrationsTable>;
export type UpdateableEventIntegration = Updateable<EventIntegrationsTable>;
