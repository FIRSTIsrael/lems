export type ScheduledEventType = 'session-completed';

export interface ScheduledEvent {
  eventType: ScheduledEventType;
  divisionId: string;
  metadata: Record<string, unknown>;
}
