export type ScheduledEventType = 'session-completed' | 'match-completed';

export interface ScheduledEvent {
  eventType: ScheduledEventType;
  divisionId: string;
  metadata: Record<string, unknown>;
}
